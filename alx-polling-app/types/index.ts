// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Poll {
  id: number;
  title: string;
  description: string | null;
  creatorId: string;
  creator: User;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
  totalVotes: number;
}

export interface PollOption {
  id: number;
  pollId: number;
  text: string;
  orderIndex: number;
  votes: number;
  createdAt: string;
}

export interface Vote {
  id: number;
  pollId: number;
  optionId: number;
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

// Edit Poll Page specific types
export interface EditPollData {
  id: number;
  title: string;
  description: string | null;
  allow_multi: boolean;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
  poll_options: EditPollOption[];
  user_id: string;
}

export interface EditPollOption {
  id?: number;
  text: string;
  position: number;
}

export interface EditPollFormData {
  title: string;
  description: string;
  allowMulti: boolean;
  closesAt: string;
  options: EditPollOption[];
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
