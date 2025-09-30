'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { apiCache, cacheKeys, invalidateCache } from '@/lib/cache'
import { measureDbQuery } from '@/lib/performance'
import { QRCodeModal } from '@/components/polls/QRCodeModal'
import { Spinner } from '@/components/ui/spinner'
import { deletePoll } from '@/lib/actions/polls'

interface PollOption {
  id: number;
  text: string;
  position: number;
  created_at: string;
}

interface Poll {
  id: number;
  user_id: string;
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

function PollsDashboardContent() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
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

  const fetchPolls = async (page = 0, limit = 10) => {
    try {
      if (page === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const cacheKey = cacheKeys.polls(page, limit)
      const cachedData = apiCache.get(cacheKey)
      
      if (cachedData && page === 0) {
        setPolls(cachedData)
        setLoading(false)
        return
      }

      // First, get all polls with their options
      const { data: pollsData, error: pollsError } = await measureDbQuery(
        `fetch-polls-page-${page}`,
        async () => {
          const result = await supabase
            .from('polls')
            .select(`
              *,
              poll_options (*)
            `)
            .order('created_at', { ascending: false })
            .range(page * limit, (page + 1) * limit - 1)
          return result
        }
      ) as { data: any[] | null; error: any }

      if (pollsError) {
        throw pollsError
      }

      // Then get all unique user IDs and fetch their profiles
      const userIds = [...new Set(pollsData?.map((poll: any) => poll.user_id) || [])]
      
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
      const pollsWithProfiles = pollsData?.map((poll: any) => ({
        ...poll,
        profiles: {
          name: profilesMap[poll.user_id] || null
        }
      })) || []

      // Check if we have more data
      setHasMore(pollsWithProfiles.length === limit)

      if (page === 0) {
        setPolls(pollsWithProfiles)
        // Cache the first page for 2 minutes
        apiCache.set(cacheKey, pollsWithProfiles, 2 * 60 * 1000)
      } else {
        setPolls(prev => [...prev, ...pollsWithProfiles])
      }
      
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch polls')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePolls = () => {
    if (!loadingMore && hasMore) {
      fetchPolls(currentPage + 1)
    }
  }

  const handleDeletePoll = async (pollId: number) => {
    if (!confirm('Are you sure you want to delete this poll?')) {
      return
    }

    try {
      await deletePoll(pollId.toString())
      
      // Invalidate cache and refresh polls
      invalidateCache.polls()
      invalidateCache.poll(pollId.toString())
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

  // Loading skeleton component
  const PollSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PollSkeleton key={i} />
          ))}
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
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/polls/${poll.id}`}>View</Link>
                    </Button>
                    
                    <QRCodeModal 
                      pollId={poll.id} 
                      pollTitle={poll.title}
                      trigger={
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      }
                    />
                    
                    {isPollOwner(poll) && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeletePoll(poll.id)}
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={loadMorePolls} 
            disabled={loadingMore}
            variant="outline"
            className="min-w-32"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading...
              </>
            ) : (
              'Load More Polls'
            )}
          </Button>
        </div>
      )}

      {!hasMore && polls.length > 0 && (
        <div className="text-center mt-8 text-muted-foreground">
          <p>You've reached the end of the polls!</p>
        </div>
      )}
    </div>
  );
}

export default function PollsDashboard() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Spinner variant="fireworks" colors={["#3b82f6","#22c55e","#f59e0b","#ef4444"]} speedMs={1200} />
            <p className="text-muted-foreground mt-4">Loading polls...</p>
          </div>
        </div>
      </div>
    }>
      <PollsDashboardContent />
    </Suspense>
  )
}