export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'demo_google';
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

