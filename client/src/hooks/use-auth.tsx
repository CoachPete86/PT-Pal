import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  loginMutation: any;
  registerMutation: any;
  logoutMutation: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEV_USER = {
  id: 1,
  email: "dev@example.com",
  username: "dev",
  password: "",
  fullName: "Development User",
  role: "trainer" as const,
  subscriptionTier: "premium" as const,
  subscriptionStatus: "active" as const,
  trialEndsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaceId: 1,
  preferences: {}
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Check auth status
  const { isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      if (isDevelopment) {
        setUser(DEV_USER);
        return DEV_USER;
      }

      const res = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setUser(data);
      return data;
    },
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (isDevelopment) {
        setUser(DEV_USER);
        return DEV_USER;
      }

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setUser(data);
      return data;
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (isDevelopment) {
        setUser(DEV_USER);
        return DEV_USER;
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      setUser(data);
      return data;
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isDevelopment) {
        setUser(null);
        queryClient.clear();
        return;
      }

      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Logout failed');
      setUser(null);
      queryClient.clear();
    }
  });

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginMutation, 
      registerMutation, 
      logoutMutation,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}