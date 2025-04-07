import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when app loads
    const checkAuth = async () => {
      try {
        const response = await apiRequest({ 
          endpoint: '/auth/me'
        });
        
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest({ 
        endpoint: '/auth/login', 
        method: 'POST', 
        data: { username, password } 
      });
      
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid username or password'
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'An error occurred during login'
      };
    }
  };

  const logout = async () => {
    try {
      await apiRequest({ 
        endpoint: '/auth/logout', 
        method: 'POST' 
      });
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
