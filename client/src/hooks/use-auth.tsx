import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loginMutation: any;
  registerMutation: any;
  logoutMutation: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Create a mock user with developer/trainer privileges
  const mockUser: User = {
    id: 10,
    email: 'developer@example.com',
    username: 'developer',
    fullName: 'Developer Account',
    role: 'trainer',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active',
    trialEndsAt: null,
    trainerId: null,
    createdAt: new Date(),
    onboardingStatus: 'completed',
    lastActive: new Date(),
    profilePicture: null,
    preferences: { goals: 'Development testing', healthConditions: 'None' },
    status: 'active',
    password: ''
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const { toast } = useToast();

  // Auto-login for development - no API call needed
  const { isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      // Just return the mock user directly
      return mockUser;
    },
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      const data = await res.json();
      setUser(data);
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; fullName: string }) => {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      const data = await res.json();
      setUser(data);
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Logout failed');
      setUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      });
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