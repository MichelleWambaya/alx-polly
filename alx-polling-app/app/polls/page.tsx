'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

interface PollOption {
  id: number;
  text: string;
  position: number;
  created_at: string;
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
  profiles: {
    name: string | null;
  };
}

export default function PollsDashboard() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchPolls()
    
    // Check if poll was just created
    if (searchParams.get('created') === 'true') {
      setShowSuccessAlert(true)
      // Hide the alert after 2 seconds
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)
    }
  }, [])

  const fetchPolls = async () => {
    try {
      // First, get all polls with their options
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (*)
        `)
        .order('created_at', { ascending: false })

      if (pollsError) {
        throw pollsError
      }

      // Then get all unique user IDs and fetch their profiles
      const userIds = [...new Set(pollsData?.map(poll => poll.user_id) || [])]
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds)

      if (profilesError) {
        throw profilesError
      }

      // Create a map of user_id to profile name
      const profilesMap = profilesData?.reduce((acc, profile) => {
        acc[profile.id] = profile.name
        return acc
      }, {} as Record<string, string>) || {}

      // Combine the data
      const pollsWithProfiles = pollsData?.map(poll => ({
        ...poll,
        profiles: {
          name: profilesMap[poll.user_id] || null
        }
      })) || []

      setPolls(pollsWithProfiles)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch polls')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const deletePoll = async (pollId: number) => {
    if (!confirm('Are you sure you want to delete this poll?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)

      if (error) {
        throw error
      }

      // Refresh polls
      await fetchPolls()
    } catch (err: any) {
      setError(err.message || 'Failed to delete poll')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    }
  }

  const isPollOwner = (poll: Poll) => {
    return user && poll.user_id === user.id
  }

  const isPollClosed = (poll: Poll) => {
    return poll.closes_at && new Date(poll.closes_at) < new Date()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Polls Dashboard</h1>
          <p className="text-muted-foreground">View and manage polls</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/polls/create">Create New Poll</Link>
          </Button>
        )}
      </div>

      {showSuccessAlert && (
        <Alert className={`mb-6 transition-opacity duration-500 ${showSuccessAlert ? 'opacity-100' : 'opacity-0'}`}>
          <AlertDescription>
            Poll created successfully! 🎉
          </AlertDescription>
        </Alert>
      )}

      {showErrorAlert && (
        <Alert variant="destructive" className={`mb-6 transition-opacity duration-500 ${showErrorAlert ? 'opacity-100' : 'opacity-0'}`}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
          <p className="text-muted-foreground mb-4">
            {user ? 'Create your first poll to get started!' : 'Sign in to create polls or wait for others to share them.'}
          </p>
          {user && (
            <Button asChild>
              <Link href="/polls/create">Create Your First Poll</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                <CardDescription>
                  {poll.description && <span className="line-clamp-2">{poll.description}</span>}
                  <div className="mt-1 text-xs text-muted-foreground">
                    By {poll.profiles.name || 'Anonymous'} • {new Date(poll.created_at).toLocaleDateString()}
                    {isPollClosed(poll) && <span className="text-red-500 ml-2">(Closed)</span>}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {poll.poll_options.length} options
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/polls/${poll.id}`}>View</Link>
                    </Button>
                    
                    {isPollOwner(poll) && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deletePoll(poll.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}