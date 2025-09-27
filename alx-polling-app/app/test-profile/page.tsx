'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProfileTestPage() {
  const { user, profile } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const supabase = createClient()

  const runTests = async () => {
    const results: string[] = []
    
    try {
      // Test 1: Check if user is authenticated
      if (user) {
        results.push(`✅ User authenticated: ${user.email}`)
      } else {
        results.push('❌ User not authenticated')
        setTestResults(results)
        return
      }

      // Test 2: Check if profile exists
      if (profile) {
        results.push(`✅ Profile exists: ${profile.name}`)
      } else {
        results.push('❌ Profile does not exist')
      }

      // Test 3: Test profile update
      const testBio = `Test bio updated at ${new Date().toISOString()}`
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ bio: testBio })
        .eq('id', user.id)

      if (updateError) {
        results.push(`❌ Profile update failed: ${updateError.message}`)
      } else {
        results.push('✅ Profile update successful')
      }

      // Test 4: Test poll fetching
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('user_id', user.id)

      if (pollsError) {
        results.push(`❌ Poll fetching failed: ${pollsError.message}`)
      } else {
        results.push(`✅ Poll fetching successful: ${pollsData?.length || 0} polls found`)
      }

      // Test 5: Test vote counting
      if (pollsData && pollsData.length > 0) {
        const pollId = pollsData[0].id
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId)

        if (votesError) {
          results.push(`❌ Vote counting failed: ${votesError.message}`)
        } else {
          results.push(`✅ Vote counting successful: ${votesData?.length || 0} votes found`)
        }
      } else {
        results.push('ℹ️ No polls to test vote counting')
      }

    } catch (error: any) {
      results.push(`❌ Test error: ${error.message}`)
    }

    setTestResults(results)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Feature Test</h1>
        <p className="text-muted-foreground">
          Test the profile functionality to identify any issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
            <CardDescription>Current authentication and profile state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Profile:</strong> {profile?.name || 'No profile'}</p>
            <p><strong>Profile ID:</strong> {profile?.id || 'N/A'}</p>
            <p><strong>Bio:</strong> {profile?.bio || 'No bio'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>Run tests to verify functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} className="w-full">
              Run Profile Tests
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/profile">Go to Profile Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from the latest test run</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
