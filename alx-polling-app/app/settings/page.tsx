'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun
} from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"

interface UserSettings {
  name: string
  bio: string
  email: string
  emailNotifications: boolean
  pollNotifications: boolean
  publicProfile: boolean
  showEmail: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
}

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    bio: '',
    email: '',
    emailNotifications: true,
    pollNotifications: true,
    publicProfile: false,
    showEmail: false,
    theme: 'system',
    language: 'en'
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadSettings()
  }, [user, profile, router])

  const loadSettings = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, bio, email_notifications, poll_notifications, public_profile, show_email, theme, language')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      setSettings({
        name: profileData?.name || '',
        bio: profileData?.bio || '',
        email: user.email || '',
        emailNotifications: profileData?.email_notifications ?? true,
        pollNotifications: profileData?.poll_notifications ?? true,
        publicProfile: profileData?.public_profile ?? false,
        showEmail: profileData?.show_email ?? false,
        theme: profileData?.theme || 'system',
        language: profileData?.language || 'en'
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: settings.name.trim(),
          bio: settings.bio.trim() || null,
          email_notifications: settings.emailNotifications,
          poll_notifications: settings.pollNotifications,
          public_profile: settings.publicProfile,
          show_email: settings.showEmail,
          theme: settings.theme,
          language: settings.language,
          updated_at: new Date().toISOString()
        })

      if (updateError) {
        throw updateError
      }

      setSuccess('Settings saved successfully!')
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return

    try {
      // Delete user's polls first
      const { error: pollsError } = await supabase
        .from('polls')
        .delete()
        .eq('user_id', user.id)

      if (pollsError) {
        throw pollsError
      }

      // Delete user's votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)

      if (votesError) {
        throw votesError
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      // Sign out and redirect
      await signOut()
      router.push('/')
      toast.success('Account deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 3000)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
      </div>

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

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your display name"
                  value={settings.name}
                  onChange={(e) => updateSetting('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  value={settings.bio}
                  onChange={(e) => updateSetting('bio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your polls and activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="poll-notifications">Poll Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone votes on your polls
                  </p>
                </div>
                <Switch
                  id="poll-notifications"
                  checked={settings.pollNotifications}
                  onCheckedChange={(checked) => updateSetting('pollNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your profile and polls
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => updateSetting('publicProfile', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Language
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSetting('language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="mt-12 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This action cannot be undone. This will permanently delete your account, 
                  all your polls, votes, and remove all data from our servers.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
