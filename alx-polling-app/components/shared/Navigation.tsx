'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/auth/UserProfile'
import { useAuth } from '@/lib/auth-context'

export function Navigation() {
  const { user, profile, loading } = useAuth()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/polls" className="text-xl font-bold">
              ALX Polls
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/polls" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Polls
              </Link>
              {user && (
                <Link 
                  href="/polls/create" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Create Poll
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            ) : (
              <UserProfile user={user} profile={profile} />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
