'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pollSchema, voteSchema, validateInput, checkRateLimit } from '@/lib/validation'

export async function createPoll(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Rate limiting
  if (!checkRateLimit(`create-poll-${user.id}`, 5, 300000)) { // 5 polls per 5 minutes
    throw new Error('Rate limit exceeded. Please wait before creating another poll.')
  }

  // Extract and validate form data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    allow_multi: formData.get('allow_multi') === 'true',
    closes_at: formData.get('closes_at') as string || null,
    options: JSON.parse(formData.get('options') as string || '[]')
  }

  const validation = validateInput(pollSchema, rawData)
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  const { data: validData } = validation

  try {
    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        user_id: user.id,
        title: validData.title,
        description: validData.description,
        allow_multi: validData.allow_multi,
        closes_at: validData.closes_at,
      })
      .select()
      .single()

    if (pollError) {
      throw pollError
    }

    // Create poll options
    const optionsData = validData.options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      position: option.position,
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)

    if (optionsError) {
      // Rollback poll creation
      await supabase.from('polls').delete().eq('id', poll.id)
      throw optionsError
    }

    revalidatePath('/polls')
    redirect(`/polls/${poll.id}?created=true`)
  } catch (error: any) {
    throw new Error(`Failed to create poll: ${error.message}`)
  }
}

export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify ownership
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('user_id')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    throw new Error('Poll not found')
  }

  if (poll.user_id !== user.id) {
    throw new Error('Unauthorized: You can only edit your own polls')
  }

  // Extract and validate form data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    allow_multi: formData.get('allow_multi') === 'true',
    closes_at: formData.get('closes_at') as string || null,
    options: JSON.parse(formData.get('options') as string || '[]')
  }

  const validation = validateInput(pollSchema, rawData)
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  const { data: validData } = validation

  try {
    // Update poll
    const { error: pollError } = await supabase
      .from('polls')
      .update({
        title: validData.title,
        description: validData.description,
        allow_multi: validData.allow_multi,
        closes_at: validData.closes_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId)

    if (pollError) {
      throw pollError
    }

    // Delete existing options
    const { error: deleteError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)

    if (deleteError) {
      throw deleteError
    }

    // Insert new options
    const optionsData = validData.options.map(option => ({
      poll_id: parseInt(pollId),
      text: option.text,
      position: option.position,
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)

    if (optionsError) {
      throw optionsError
    }

    revalidatePath('/polls')
    revalidatePath(`/polls/${pollId}`)
    redirect('/polls')
  } catch (error: any) {
    throw new Error(`Failed to update poll: ${error.message}`)
  }
}

export async function deletePoll(pollId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify ownership
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('user_id')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    throw new Error('Poll not found')
  }

  if (poll.user_id !== user.id) {
    throw new Error('Unauthorized: You can only delete your own polls')
  }

  try {
    // Delete in correct order (votes first, then options, then poll)
    await supabase.from('votes').delete().eq('poll_id', pollId)
    await supabase.from('poll_options').delete().eq('poll_id', pollId)
    await supabase.from('polls').delete().eq('id', pollId)

    revalidatePath('/polls')
    redirect('/polls')
  } catch (error: any) {
    throw new Error(`Failed to delete poll: ${error.message}`)
  }
}

export async function submitVote(pollId: string, optionId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Rate limiting
  if (!checkRateLimit(`vote-${user.id}`, 100, 60000)) { // 100 votes per minute
    throw new Error('Rate limit exceeded. Please wait before voting again.')
  }

  // Validate input
  const validation = validateInput(voteSchema, {
    poll_id: parseInt(pollId),
    option_id: parseInt(optionId)
  })

  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  const { data: validData } = validation

  try {
    // Check if poll exists and is open
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('closes_at, allow_multi')
      .eq('id', validData.poll_id)
      .single()

    if (pollError || !poll) {
      throw new Error('Poll not found')
    }

    // Check if poll is closed
    if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
      throw new Error('This poll has closed')
    }

    // Check if user already voted (for single-vote polls)
    if (!poll.allow_multi) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', validData.poll_id)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        throw new Error('You have already voted on this poll')
      }
    }

    // Submit vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: validData.poll_id,
        option_id: validData.option_id,
        user_id: user.id,
      })

    if (voteError) {
      throw voteError
    }

    revalidatePath(`/polls/${pollId}`)
  } catch (error: any) {
    throw new Error(`Failed to submit vote: ${error.message}`)
  }
}
