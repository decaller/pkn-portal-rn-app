/**
 * Authentication and User Types
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  organization?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
