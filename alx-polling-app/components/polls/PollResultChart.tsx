'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react"
import type { PollWithResults, PollOption } from '@/types'

interface PollResultChartProps {
  poll: PollWithResults
  showVoteCounts?: boolean
  showPercentages?: boolean
  showTrends?: boolean
  className?: string
}

interface ChartData {
  option: PollOption
  votes: number
  percentage: number
  color: string
}

export function PollResultChart({ 
  poll, 
  showVoteCounts = true, 
  showPercentages = true,
  showTrends = false,
  className = ""
}: PollResultChartProps) {
  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + (option.voteCount || 0), 0)
  
  // Prepare chart data with colors
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-gray-500'
  ]

  const chartData: ChartData[] = poll.options.map((option, index) => ({
    option,
    votes: option.voteCount || 0,
    percentage: totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0,
    color: colors[index % colors.length]
  }))

  // Sort by vote count (highest first)
  const sortedData = [...chartData].sort((a, b) => b.votes - a.votes)

  // Calculate statistics
  const isPollClosed = poll.expiresAt && new Date(poll.expiresAt) < new Date()
  const timeRemaining = poll.expiresAt ? new Date(poll.expiresAt).getTime() - Date.now() : null
  const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Poll Results
            </CardTitle>
            <CardDescription>
              {poll.title}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPollClosed ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Closed
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Votes</span>
            </div>
            <div className="text-2xl font-bold">{totalVotes}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Options</span>
            </div>
            <div className="text-2xl font-bold">{poll.options.length}</div>
          </div>

          {daysRemaining !== null && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Days Left</span>
              </div>
              <div className="text-2xl font-bold">{daysRemaining}</div>
            </div>
          )}

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Leading</span>
            </div>
            <div className="text-lg font-bold truncate">
              {sortedData[0]?.option.text || 'N/A'}
            </div>
          </div>
        </div>

        {/* Results Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vote Distribution</h3>
          
          {totalVotes === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No votes yet. Be the first to vote!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedData.map((item, index) => (
                <div key={item.option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      <span className="font-medium">{item.option.text}</span>
                      {index === 0 && item.votes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Winner
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {showVoteCounts && (
                        <span className="font-medium">{item.votes} votes</span>
                      )}
                      {showPercentages && (
                        <span className="font-medium">{item.percentage}%</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={item.percentage} 
                      className="h-3"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 rounded-full ${item.color} opacity-20`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        {poll.description && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{poll.description}</p>
          </div>
        )}

        {/* Poll Metadata */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Created by {poll.creator.name}</span>
            <span>
              {new Date(poll.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export default for easier imports
export default PollResultChart
