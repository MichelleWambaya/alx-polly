'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { QRCodeCard } from '@/components/polls/QRCodeModal'
import { submitVote } from '@/lib/actions/polls'

interface PollOption {
  id: number;
  text: string;
  position: number;
  created_at: string;
  votes?: number;
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

export default function PollDetailPage() {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()

  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
    
    // Check if poll was just created
    if (searchParams.get('created') === 'true') {
      setSuccess('Poll created successfully! Share it using the QR code below.')
      setShowSuccessAlert(true)
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 3000)
    }
  }, [pollId, searchParams])

  const fetchPoll = async () => {
    try {
      // Fetch poll with options
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

      // Fetch the creator's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', pollData.user_id)
        .single()

          if (profileError) {
            // Profile not found - continue without profile data
          }

      // Fetch vote counts for each option
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('option_id')
        .eq('poll_id', pollId)

      if (votesError) {
        throw votesError
      }

      // Calculate vote counts
      const voteCounts = votesData.reduce((acc, vote) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      // Add vote counts to options and profile data
      const pollWithVotes = {
        ...pollData,
        poll_options: pollData.poll_options.map((option: PollOption) => ({
          ...option,
          votes: voteCounts[option.id] || 0
        })),
        profiles: {
          name: profileData?.name || null
        }
      }

      setPoll(pollWithVotes)

      // Check if current user has voted
      if (user) {
        const { data: userVote } = await supabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .single()

        setHasVoted(!!userVote)
        if (userVote) {
          setSelectedOption(userVote.option_id)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch poll')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!selectedOption) {
      setError('Please select an option')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
      return
    }

    setVoting(true)
    setError('')

    try {
      await submitVote(pollId, selectedOption.toString())

      setSuccess('Vote submitted successfully!')
      setShowSuccessAlert(true)
      setHasVoted(true)

      // Hide success alert after 2 seconds
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)

      // Refresh poll data
      await fetchPoll()
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setVoting(false)
    }
  }

  const isPollClosed = () => {
    return poll?.closes_at && new Date(poll.closes_at) < new Date()
  }

  const totalVotes = poll?.poll_options.reduce((sum, option) => sum + (option.votes || 0), 0) || 0

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/polls">← Back to Polls</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          <CardDescription>
            {poll.description}
            <div className="mt-2 text-sm text-muted-foreground">
              Created by {poll.profiles.name || 'Anonymous'} • {new Date(poll.created_at).toLocaleDateString()}
              {isPollClosed() && <span className="text-red-500 ml-2">(Closed)</span>}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total votes: {totalVotes}
            </div>
            
            {poll.poll_options.map((option) => {
              const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
              const isSelected = selectedOption === option.id;
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isSelected ? 'font-semibold' : ''}>
                      {option.text}
                      {isSelected && <span className="text-green-600 ml-2">✓</span>}
                    </span>
                    <span>{Math.round(percentage)}% ({option.votes || 0} votes)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          {!hasVoted && !isPollClosed() && (
            <div className="space-y-4">
              <div className="space-y-3">
                {poll.poll_options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{option.text}</span>
                  </label>
                ))}
              </div>
              <Button 
                onClick={handleVote} 
                disabled={!selectedOption || voting}
                className="w-full"
              >
                {voting ? 'Submitting Vote...' : 'Submit Vote'}
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="text-center text-green-600 font-medium">
              ✓ You have voted on this poll
            </div>
          )}

          {isPollClosed() && (
            <div className="text-center text-red-600 font-medium">
              This poll has closed
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Sharing Card */}
      <QRCodeCard 
        pollId={pollId} 
        pollTitle={poll.title}
        className="mt-6"
      />
    </div>
  );
}
