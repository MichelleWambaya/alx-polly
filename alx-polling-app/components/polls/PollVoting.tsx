'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PollVotingProps {
  pollId: string;
  title: string;
  description?: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  totalVotes: number;
  hasVoted?: boolean;
  onVote?: (optionId: string) => void;
}

export function PollVoting({ 
  pollId, 
  title, 
  description, 
  options, 
  totalVotes, 
  hasVoted = false,
  onVote 
}: PollVotingProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleVote = () => {
    if (selectedOption && onVote) {
      onVote(selectedOption);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {hasVoted ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total votes: {totalVotes}
            </div>
            {options.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span>{Math.round(percentage)}% ({option.votes} votes)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{option.text}</span>
                </label>
              ))}
            </div>
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption}
              className="w-full"
            >
              Submit Vote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
