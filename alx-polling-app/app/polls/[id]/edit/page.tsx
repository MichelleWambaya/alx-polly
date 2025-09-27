'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

interface PollOption {
  id?: number;
  text: string;
  position: number;
}

interface Poll {
  id: number;
  title: string;
  description: string | null;
  allow_multi: boolean;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
  poll_options: PollOption[];
  user_id: string;
}

export default function EditPollPage() {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowMulti, setAllowMulti] = useState(false)
  const [closesAt, setClosesAt] = useState('')
  const [options, setOptions] = useState<PollOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
  }, [pollId])

  const fetchPoll = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (*)
        `)
        .eq('id', pollId)
        .single()

      if (pollError) {
        throw pollError
      }

      // Check if user owns this poll
      if (user && pollData.user_id !== user.id) {
        router.push('/polls')
        return
      }

      setPoll(pollData)
      setTitle(pollData.title)
      setDescription(pollData.description || '')
      setAllowMulti(pollData.allow_multi)
      setClosesAt(pollData.closes_at ? new Date(pollData.closes_at).toISOString().slice(0, 16) : '')
      
      // Sort options by position
      const sortedOptions = pollData.poll_options.sort((a: PollOption, b: PollOption) => a.position - b.position)
      setOptions(sortedOptions)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch poll')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { text: '', position: options.length }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      // Reorder positions
      setOptions(newOptions.map((option, i) => ({ ...option, position: i })))
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text }
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (!user) {
      setError('You must be logged in to edit polls')
      setSaving(false)
      return
    }

    if (!title.trim()) {
      setError('Title is required')
      setSaving(false)
      return
    }

    const validOptions = options.filter(option => option.text.trim())
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      setSaving(false)
      return
    }

    try {
      // Update the poll
      const { error: pollError } = await supabase
        .from('polls')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          allow_multi: allowMulti,
          closes_at: closesAt || null,
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
      const optionsData = validOptions.map(option => ({
        poll_id: parseInt(pollId),
        text: option.text.trim(),
        position: option.position,
      }))

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData)

      if (optionsError) {
        throw optionsError
      }

      setSuccess('Poll updated successfully!')
      setShowSuccessAlert(true)
      setTimeout(() => {
        setShowSuccessAlert(false)
        router.push('/polls')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update poll')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading poll...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>Poll not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/polls">Back to Polls</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Poll</h1>
        <p className="text-muted-foreground">Update your poll details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Update the details for your poll</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {showSuccessAlert && (
              <Alert className={`transition-opacity duration-500 ${showSuccessAlert ? 'opacity-100' : 'opacity-0'}`}>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {showErrorAlert && (
              <Alert variant="destructive" className={`transition-opacity duration-500 ${showErrorAlert ? 'opacity-100' : 'opacity-0'}`}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                placeholder="Enter poll title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your poll..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowMulti"
                  checked={allowMulti}
                  onCheckedChange={(checked) => setAllowMulti(checked as boolean)}
                />
                <Label htmlFor="allowMulti">Allow multiple votes per user</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closesAt">Close Date (Optional)</Label>
                <Input
                  id="closesAt"
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Poll Options *</Label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required={index < 2}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating Poll...' : 'Update Poll'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/polls">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
