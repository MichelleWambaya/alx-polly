'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileUpdateSchema, validateInput, checkRateLimit } from '@/lib/validation'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Rate limiting
  if (!checkRateLimit(`update-profile-${user.id}`, 10, 60000)) { // 10 updates per minute
    throw new Error('Rate limit exceeded. Please wait before updating again.')
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get('name') as string,
    bio: formData.get('bio') as string,
    email_notifications: formData.get('email_notifications') === 'true',
    poll_notifications: formData.get('poll_notifications') === 'true',
    public_profile: formData.get('public_profile') === 'true',
    show_email: formData.get('show_email') === 'true',
    theme: formData.get('theme') as string,
    language: formData.get('language') as string
  }

  const validation = validateInput(profileUpdateSchema, rawData)
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  const { data: validData } = validation

  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: validData.name,
        bio: validData.bio,
        email_notifications: validData.email_notifications,
        poll_notifications: validData.poll_notifications,
        public_profile: validData.public_profile,
        show_email: validData.show_email,
        theme: validData.theme,
        language: validData.language,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      throw updateError
    }

    revalidatePath('/profile')
    revalidatePath('/settings')
  } catch (error: any) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

export async function deleteAccount() {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Rate limiting
  if (!checkRateLimit(`delete-account-${user.id}`, 1, 300000)) { // 1 deletion per 5 minutes
    throw new Error('Rate limit exceeded. Please wait before trying again.')
  }

  try {
    // Delete user's data in correct order
    await supabase.from('votes').delete().eq('user_id', user.id)
    await supabase.from('poll_options').delete().eq('poll_id', 
      supabase.from('polls').select('id').eq('user_id', user.id)
    )
    await supabase.from('polls').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out user
    await supabase.auth.signOut()
  } catch (error: any) {
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}
