'use client'

import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DebugPanel() {
  const { user, profile, loading } = useAuth()
  const [polls, setPolls] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const supabase = createClient()

  const fetchDebugData = async () => {
    setLoadingData(true)
    try {
      // Fetch all polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (pollsError) {
        console.error('Error fetching polls:', pollsError)
      } else {
        setPolls(pollsData || [])
      }

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      } else {
        setProfiles(profilesData || [])
      }
    } catch (error) {
      console.error('Error fetching debug data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  if (loading) {
    return <div>Loading debug panel...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Panel</CardTitle>
          <CardDescription>Current authentication and database state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Info */}
          <div>
            <h3 className="font-medium mb-2">Current User</h3>
            <div className="bg-muted p-3 rounded text-sm">
              <p><strong>ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Profile Name:</strong> {profile?.name || 'No profile'}</p>
              <p><strong>Profile ID:</strong> {profile?.id || 'N/A'}</p>
            </div>
          </div>

          {/* Database State */}
          <div>
            <h3 className="font-medium mb-2">Database State</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded text-sm">
                <p><strong>Total Polls:</strong> {polls.length}</p>
                <p><strong>Total Profiles:</strong> {profiles.length}</p>
              </div>
              <div className="bg-muted p-3 rounded text-sm">
                <p><strong>User's Polls:</strong> {polls.filter(p => p.user_id === user?.id).length}</p>
                <p><strong>Loading:</strong> {loadingData ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Recent Polls */}
          <div>
            <h3 className="font-medium mb-2">Recent Polls</h3>
            <div className="space-y-2">
              {polls.slice(0, 5).map(poll => (
                <div key={poll.id} className="bg-muted p-2 rounded text-sm">
                  <p><strong>ID:</strong> {poll.id} | <strong>Title:</strong> {poll.title}</p>
                  <p><strong>User ID:</strong> {poll.user_id} | <strong>Created:</strong> {new Date(poll.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Profiles */}
          <div>
            <h3 className="font-medium mb-2">Recent Profiles</h3>
            <div className="space-y-2">
              {profiles.slice(0, 5).map(profile => (
                <div key={profile.id} className="bg-muted p-2 rounded text-sm">
                  <p><strong>ID:</strong> {profile.id} | <strong>Name:</strong> {profile.name}</p>
                  <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={fetchDebugData} disabled={loadingData}>
            {loadingData ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
