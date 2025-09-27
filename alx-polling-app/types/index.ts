// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creator: User;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  orderIndex: number;
  votes: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  voterId?: string;
  voterIp?: string;
  voterFingerprint?: string;
  createdAt: string;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PollWithResults extends PollWithOptions {
  options: (PollOption & { voteCount: number })[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreatePollForm {
  title: string;
  description?: string;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  options: Array<{
    text: string;
    orderIndex: number;
  }>;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

// Component props types
export interface PollCardProps {
  poll: PollWithOptions;
  onVote?: (pollId: string, optionId: string) => void;
  onShare?: (pollId: string) => void;
}

export interface PollVotingProps {
  poll: PollWithOptions;
  hasVoted?: boolean;
  onVote?: (optionId: string) => void;
}

// Utility types
export type PollStatus = 'active' | 'expired' | 'draft';
export type VoteStatus = 'not_voted' | 'voted' | 'multiple_votes_allowed';
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
