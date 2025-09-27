'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/auth-context'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface UserProfileProps {
  user?: User | null;
  profile?: Profile | null;
}

export function UserProfile({ user, profile }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const displayName = profile?.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
        {displayName}
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{displayName}</CardTitle>
            <CardDescription className="text-xs">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
