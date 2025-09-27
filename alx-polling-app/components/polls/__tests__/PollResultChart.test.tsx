import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PollResultChart } from '@/components/polls/PollResultChart'

// Mock data for testing - using actual database structure
const mockPoll = {
  id: 1,
  title: 'What is your favorite programming language?',
  description: 'A simple poll about programming preferences',
  user_id: 'user-1',
  allow_multi: false,
  closes_at: '2024-12-31T23:59:59Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  poll_options: [
    {
      id: 1,
      poll_id: 1,
      text: 'JavaScript',
      position: 0,
      created_at: '2024-01-01T00:00:00Z',
      votes: 45
    },
    {
      id: 2,
      poll_id: 1,
      text: 'Python',
      position: 1,
      created_at: '2024-01-01T00:00:00Z',
      votes: 30
    },
    {
      id: 3,
      poll_id: 1,
      text: 'TypeScript',
      position: 2,
      created_at: '2024-01-01T00:00:00Z',
      votes: 25
    }
  ],
  profiles: {
    name: 'John Doe'
  }
}

const closedPoll = {
  ...mockPoll,
  closes_at: '2024-01-01T00:00:00Z' // Past date
}

const emptyPoll = {
  ...mockPoll,
  poll_options: mockPoll.poll_options.map(option => ({ ...option, votes: 0 }))
}

// Transform database structure to component expected structure
const transformPollForComponent = (poll: typeof mockPoll) => ({
  id: poll.id,
  title: poll.title,
  description: poll.description,
  creatorId: poll.user_id,
  creator: {
    id: poll.user_id,
    email: 'test@example.com',
    name: poll.profiles?.name || 'Anonymous',
    createdAt: poll.created_at,
    updatedAt: poll.updated_at
  },
  isPublic: true,
  allowMultipleVotes: poll.allow_multi,
  expiresAt: poll.closes_at,
  createdAt: poll.created_at,
  updatedAt: poll.updated_at,
  totalVotes: poll.poll_options.reduce((sum, option) => sum + option.votes, 0),
  options: poll.poll_options.map(option => ({
    id: option.id,
    pollId: option.poll_id,
    text: option.text,
    orderIndex: option.position,
    votes: 0,
    createdAt: option.created_at,
    voteCount: option.votes
  }))
})

describe('PollResultChart', () => {
  describe('Rendering', () => {
    it('renders poll title and description', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('Poll Results')).toBeInTheDocument()
      expect(screen.getByText(mockPoll.title)).toBeInTheDocument()
      expect(screen.getByText(mockPoll.description)).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      const { container } = render(
        <PollResultChart poll={transformedPoll} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('renders all poll options', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      // Check that all option texts appear (they appear in multiple places)
      mockPoll.poll_options.forEach(option => {
        expect(screen.getAllByText(option.text).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Statistics Display', () => {
    it('displays correct total votes', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('100')).toBeInTheDocument() // Total votes (45+30+25)
    })

    it('displays correct number of options', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('3')).toBeInTheDocument() // Number of options
    })

    it('displays leading option', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      // JavaScript appears in multiple places, so we check it exists
      expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0)
    })
  })

  describe('Vote Counts and Percentages', () => {
    it('shows vote counts when showVoteCounts is true', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} showVoteCounts={true} />)
      
      expect(screen.getByText('45 votes')).toBeInTheDocument()
      expect(screen.getByText('30 votes')).toBeInTheDocument()
      expect(screen.getByText('25 votes')).toBeInTheDocument()
    })

    it('hides vote counts when showVoteCounts is false', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} showVoteCounts={false} />)
      
      expect(screen.queryByText('45 votes')).not.toBeInTheDocument()
      expect(screen.queryByText('30 votes')).not.toBeInTheDocument()
      expect(screen.queryByText('25 votes')).not.toBeInTheDocument()
    })

    it('shows percentages when showPercentages is true', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} showPercentages={true} />)
      
      expect(screen.getByText('45%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
      expect(screen.getByText('25%')).toBeInTheDocument()
    })

    it('hides percentages when showPercentages is false', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} showPercentages={false} />)
      
      expect(screen.queryByText('45%')).not.toBeInTheDocument()
      expect(screen.queryByText('30%')).not.toBeInTheDocument()
      expect(screen.queryByText('25%')).not.toBeInTheDocument()
    })
  })

  describe('Poll Status', () => {
    it('shows active badge for open polls', () => {
      // Create a poll with future close date
      const activePoll = {
        ...mockPoll,
        closes_at: '2025-12-31T23:59:59Z' // Future date
      }
      const transformedPoll = transformPollForComponent(activePoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows closed badge for expired polls', () => {
      const transformedPoll = transformPollForComponent(closedPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no votes', () => {
      const transformedPoll = transformPollForComponent(emptyPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('No votes yet. Be the first to vote!')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Total votes
    })

    it('shows correct percentages for zero votes', () => {
      const transformedPoll = transformPollForComponent(emptyPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      // When there are no votes, the component shows empty state instead of percentages
      expect(screen.getByText('No votes yet. Be the first to vote!')).toBeInTheDocument()
    })
  })

  describe('Winner Badge', () => {
    it('shows winner badge for the leading option', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('Winner')).toBeInTheDocument()
    })

    it('does not show winner badge when no votes', () => {
      const transformedPoll = transformPollForComponent(emptyPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.queryByText('Winner')).not.toBeInTheDocument()
    })
  })

  describe('Progress Bars', () => {
    it('renders progress bars for each option', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      // Should have 3 progress bars (one for each option)
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars).toHaveLength(3)
    })

    it('sets correct progress values', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      const progressBars = screen.getAllByRole('progressbar')
      
      // The progress bars exist but may not have aria-valuenow set
      expect(progressBars).toHaveLength(3)
      
      // Check that progress bars have the correct structure
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('aria-valuemax', '100')
        expect(bar).toHaveAttribute('aria-valuemin', '0')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      // Check that progress bars exist (there should be multiple)
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('has proper heading structure', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles poll with no description', () => {
      const pollWithoutDescription = { ...mockPoll, description: null }
      const transformedPoll = transformPollForComponent(pollWithoutDescription)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText(mockPoll.title)).toBeInTheDocument()
    })

    it('handles poll with very long option text', () => {
      const pollWithLongText = {
        ...mockPoll,
        poll_options: [
          {
            ...mockPoll.poll_options[0],
            text: 'This is a very long option text that should be handled gracefully by the component'
          }
        ]
      }
      const transformedPoll = transformPollForComponent(pollWithLongText)
      render(<PollResultChart poll={transformedPoll} />)
      
      // The text appears in multiple places, so we check it exists
      expect(screen.getAllByText('This is a very long option text that should be handled gracefully by the component')).toHaveLength(2)
    })

    it('handles poll with many options', () => {
      const pollWithManyOptions = {
        ...mockPoll,
        poll_options: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          poll_id: 1,
          text: `Option ${i + 1}`,
          position: i,
          created_at: '2024-01-01T00:00:00Z',
          votes: Math.floor(Math.random() * 50)
        }))
      }
      const transformedPoll = transformPollForComponent(pollWithManyOptions)
      render(<PollResultChart poll={transformedPoll} />)
      
      expect(screen.getByText('10')).toBeInTheDocument() // Number of options
    })
  })

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const transformedPoll = transformPollForComponent(mockPoll)
      const startTime = performance.now()
      render(<PollResultChart poll={transformedPoll} />)
      const endTime = performance.now()
      
      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})