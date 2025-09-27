'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PollResultChart } from '@/components/polls/PollResultChart'
import type { PollWithResults } from '@/types'

// Demo data
const demoPolls: PollWithResults[] = [
  {
    id: 1,
    title: 'What is your favorite programming language?',
    description: 'A simple poll about programming preferences in 2024',
    creatorId: 'user-1',
    creator: {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    isPublic: true,
    allowMultipleVotes: false,
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    totalVotes: 1250,
    options: [
      {
        id: 1,
        pollId: 1,
        text: 'JavaScript',
        orderIndex: 0,
        votes: 0,
        createdAt: '2024-01-01T00:00:00Z',
        voteCount: 450
      },
      {
        id: 2,
        pollId: 1,
        text: 'Python',
        orderIndex: 1,
        votes: 0,
        createdAt: '2024-01-01T00:00:00Z',
        voteCount: 380
      },
      {
        id: 3,
        pollId: 1,
        text: 'TypeScript',
        orderIndex: 2,
        votes: 0,
        createdAt: '2024-01-01T00:00:00Z',
        voteCount: 250
      },
      {
        id: 4,
        pollId: 1,
        text: 'Rust',
        orderIndex: 3,
        votes: 0,
        createdAt: '2024-01-01T00:00:00Z',
        voteCount: 170
      }
    ]
  },
  {
    id: 2,
    title: 'Which framework do you prefer for web development?',
    description: 'Help us understand the current trends in web development frameworks',
    creatorId: 'user-2',
    creator: {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    isPublic: true,
    allowMultipleVotes: true,
    expiresAt: '2024-01-01T00:00:00Z', // Closed poll
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    totalVotes: 890,
    options: [
      {
        id: 5,
        pollId: 2,
        text: 'React',
        orderIndex: 0,
        votes: 0,
        createdAt: '2024-01-02T00:00:00Z',
        voteCount: 320
      },
      {
        id: 6,
        pollId: 2,
        text: 'Vue.js',
        orderIndex: 1,
        votes: 0,
        createdAt: '2024-01-02T00:00:00Z',
        voteCount: 280
      },
      {
        id: 7,
        pollId: 2,
        text: 'Angular',
        orderIndex: 2,
        votes: 0,
        createdAt: '2024-01-02T00:00:00Z',
        voteCount: 200
      },
      {
        id: 8,
        pollId: 2,
        text: 'Svelte',
        orderIndex: 3,
        votes: 0,
        createdAt: '2024-01-02T00:00:00Z',
        voteCount: 90
      }
    ]
  },
  {
    id: 3,
    title: 'What is your preferred database?',
    description: 'Database preferences for modern applications',
    creatorId: 'user-3',
    creator: {
      id: 'user-3',
      email: 'bob@example.com',
      name: 'Bob Wilson',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    },
    isPublic: true,
    allowMultipleVotes: false,
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    totalVotes: 0, // Empty poll
    options: [
      {
        id: 9,
        pollId: 3,
        text: 'PostgreSQL',
        orderIndex: 0,
        votes: 0,
        createdAt: '2024-01-03T00:00:00Z',
        voteCount: 0
      },
      {
        id: 10,
        pollId: 3,
        text: 'MongoDB',
        orderIndex: 1,
        votes: 0,
        createdAt: '2024-01-03T00:00:00Z',
        voteCount: 0
      },
      {
        id: 11,
        pollId: 3,
        text: 'MySQL',
        orderIndex: 2,
        votes: 0,
        createdAt: '2024-01-03T00:00:00Z',
        voteCount: 0
      }
    ]
  }
]

export default function PollResultChartDemo() {
  const [selectedPoll, setSelectedPoll] = useState(0)
  const [showVoteCounts, setShowVoteCounts] = useState(true)
  const [showPercentages, setShowPercentages] = useState(true)
  const [showTrends, setShowTrends] = useState(false)

  const currentPoll = demoPolls[selectedPoll]

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PollResultChart Component Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the PollResultChart component with various configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Demo Controls</CardTitle>
              <CardDescription>
                Customize the chart display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Poll Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Poll</Label>
                <div className="space-y-2">
                  {demoPolls.map((poll, index) => (
                    <Button
                      key={poll.id}
                      variant={selectedPoll === index ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedPoll(index)}
                    >
                      {poll.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Display Options</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-votes" className="text-sm">
                    Show Vote Counts
                  </Label>
                  <Switch
                    id="show-votes"
                    checked={showVoteCounts}
                    onCheckedChange={setShowVoteCounts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-percentages" className="text-sm">
                    Show Percentages
                  </Label>
                  <Switch
                    id="show-percentages"
                    checked={showPercentages}
                    onCheckedChange={setShowPercentages}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-trends" className="text-sm">
                    Show Trends
                  </Label>
                  <Switch
                    id="show-trends"
                    checked={showTrends}
                    onCheckedChange={setShowTrends}
                  />
                </div>
              </div>

              {/* Poll Info */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Current Poll Info</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>ID:</strong> {currentPoll.id}</p>
                  <p><strong>Creator:</strong> {currentPoll.creator.name}</p>
                  <p><strong>Total Votes:</strong> {currentPoll.totalVotes}</p>
                  <p><strong>Options:</strong> {currentPoll.options.length}</p>
                  <p><strong>Status:</strong> {
                    currentPoll.expiresAt && new Date(currentPoll.expiresAt) < new Date() 
                      ? 'Closed' 
                      : 'Active'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-2">
          <PollResultChart
            poll={currentPoll}
            showVoteCounts={showVoteCounts}
            showPercentages={showPercentages}
            showTrends={showTrends}
            className="w-full"
          />
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
            <CardDescription>
              Current configuration code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`<PollResultChart
  poll={poll}
  showVoteCounts={${showVoteCounts}}
  showPercentages={${showPercentages}}
  showTrends={${showTrends}}
  className="w-full"
/>`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Component Features</CardTitle>
            <CardDescription>
              Key features and capabilities of the PollResultChart component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Visual Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Interactive progress bars</li>
                  <li>• Color-coded options</li>
                  <li>• Winner highlighting</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Data Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time vote counts</li>
                  <li>• Percentage calculations</li>
                  <li>• Statistics dashboard</li>
                  <li>• Time remaining display</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Accessibility</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ARIA labels</li>
                  <li>• Keyboard navigation</li>
                  <li>• Screen reader support</li>
                  <li>• High contrast support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Customization</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Toggle display options</li>
                  <li>• Custom CSS classes</li>
                  <li>• Flexible data structure</li>
                  <li>• Theme integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
