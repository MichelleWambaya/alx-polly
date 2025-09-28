'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

interface PollOption {
  text: string;
  position: number;
}

export default function CreatePollPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowMulti, setAllowMulti] = useState(false)
  const [closesAt, setClosesAt] = useState('')
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', position: 0 },
    { text: '', position: 1 }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

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
    setLoading(true)
    setError('')

    if (!user) {
      setError('You must be logged in to create a poll')
      setLoading(false)
      return
    }

    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    const validOptions = options.filter(option => option.text.trim())
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      setLoading(false)
      return
    }

    try {
      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          allow_multi: allowMulti,
          closes_at: closesAt || null,
        })
        .select()
        .single()

      if (pollError) {
        throw pollError
      }

      // Create the poll options
      const optionsData = validOptions.map(option => ({
        poll_id: poll.id,
        text: option.text.trim(),
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

      // Success - redirect to the created poll with QR code
      router.push(`/polls/${poll.id}?created=true`)
    } catch (err: any) {
      setError(err.message || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Poll</h1>
        <p className="text-muted-foreground">Create a poll and share it with others</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Fill in the details for your new poll</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Poll...' : 'Create Poll'}
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
