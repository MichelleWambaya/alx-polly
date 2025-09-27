'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  BarChart3, 
  Clock,
  Users,
  Settings,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
interface UserStats {
  totalPolls: number
  totalVotes: number
  pollsCreated: number
  joinDate: string
}

interface UserPoll {
  id: number
  title: string
  description: string | null
  user_id: string
  allow_multi: boolean
  closes_at: string | null
  created_at: string
  updated_at: string
  poll_options: Array<{
    id: number
    poll_id: number
    text: string
    position: number
    votes?: number
  }>
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userPolls, setUserPolls] = useState<UserPoll[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalPolls: 0,
    totalVotes: 0,
    pollsCreated: 0,
    joinDate: ''
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Initialize form with current profile data
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
    }

    fetchUserData()
  }, [user, profile, router])

  const fetchUserData = async () => {
    if (!user) return

    console.log('Fetching user data for:', user.id)
    setLoading(true)
    try {
      // Fetch user's polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (pollsError) {
        throw pollsError
      }

      setUserPolls(pollsData || [])

      // Calculate total votes across all polls
      let totalVotes = 0
      if (pollsData) {
        for (const poll of pollsData) {
          // Fetch vote counts for this poll
          const { data: votesData } = await supabase
            .from('votes')
            .select('option_id')
            .eq('poll_id', poll.id)
          
          if (votesData) {
            totalVotes += votesData.length
          }
        }
      }

      setStats({
        totalPolls: pollsData?.length || 0,
        totalVotes,
        pollsCreated: pollsData?.length || 0,
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    console.log('Updating profile for user:', user.id, 'with data:', { name, bio })
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setSuccess('Profile updated successfully!')
      setShowSuccessAlert(true)
      setIsEditing(false)
      
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)

      // Refresh profile data by refetching
      await fetchUserData()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(profile?.name || '')
    setBio(profile?.bio || '')
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const isPollClosed = (poll: UserPoll) => {
    return poll.closes_at && new Date(poll.closes_at) < new Date()
  }

  const getPollStatus = (poll: UserPoll) => {
    if (isPollClosed(poll)) {
      return { label: 'Closed', variant: 'secondary' as const }
    }
    return { label: 'Active', variant: 'default' as const }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account and view your polls</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {showSuccessAlert && (
        <Alert className={`mb-6 transition-opacity duration-500 ${showSuccessAlert ? 'opacity-100' : 'opacity-0'}`}>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showErrorAlert && (
        <Alert variant="destructive" className={`mb-6 transition-opacity duration-500 ${showErrorAlert ? 'opacity-100' : 'opacity-0'}`}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="polls">My Polls</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {(profile?.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{profile?.name || user.email?.split('@')[0] || 'User'}</h3>
                        <p className="text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {profile?.bio && (
                      <div>
                        <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Polls Created</span>
                    </div>
                    <span className="font-semibold">{stats.pollsCreated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Votes</span>
                    </div>
                    <span className="font-semibold">{stats.totalVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <span className="font-semibold">{stats.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Polls Tab */}
        <TabsContent value="polls" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Polls</h2>
              <p className="text-muted-foreground">Manage and view your created polls</p>
            </div>
            <Button asChild>
              <Link href="/polls/create">
                <Edit3 className="h-4 w-4 mr-2" />
                Create New Poll
              </Link>
            </Button>
          </div>

          {userPolls.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
                <p className="text-muted-foreground mb-4">Create your first poll to get started!</p>
                <Button asChild>
                  <Link href="/polls/create">Create Your First Poll</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userPolls.map((poll) => {
                const status = getPollStatus(poll)
                return (
                  <Card key={poll.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{poll.title}</h3>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </div>
                          {poll.description && (
                            <p className="text-muted-foreground mb-3">{poll.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {poll.poll_options.length} options
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(poll.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account preferences and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">{stats.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
