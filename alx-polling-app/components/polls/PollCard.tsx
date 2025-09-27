import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PollCardProps {
  id: string;
  title: string;
  description?: string;
  creator: string;
  totalVotes: number;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  createdAt: string;
}

export function PollCard({ 
  id, 
  title, 
  description, 
  creator, 
  totalVotes, 
  options, 
  createdAt 
}: PollCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription>
          {description && <span className="line-clamp-2">{description}</span>}
          <div className="mt-1 text-xs text-muted-foreground">
            By {creator} • {new Date(createdAt).toLocaleDateString()} • {totalVotes} votes
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.slice(0, 3).map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{option.text}</span>
                  <span className="text-muted-foreground">{Math.round(percentage)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
          {options.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{options.length - 3} more options
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
