'use client'

import { DebugPanel } from '@/components/debug/DebugPanel'

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug Dashboard</h1>
        <p className="text-muted-foreground">
          Use this page to debug authentication and database issues
        </p>
      </div>

      <DebugPanel />
    </div>
  )
}
