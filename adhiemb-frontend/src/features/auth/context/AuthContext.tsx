import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types/auth.types';
import { tokenStorage } from '@/lib/storage';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.getToken();
      const storedUser = tokenStorage.getUser();
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
        }
        try {
          const response = await api.get(API_ENDPOINTS.AUTH.ME);
          if (response.data && response.data.data) {
            const userData = response.data.data;
            setUser(userData);
            tokenStorage.setUser(userData);
          }
        } catch (error) {
          // If token expired/invalid, clear
          tokenStorage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    tokenStorage.setToken(newToken);
    tokenStorage.setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Ignore
    } finally {
      setToken(null);
      setUser(null);
      tokenStorage.clear();
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string) => {
    if (!user || !user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]) => {
    if (!user || !user.permissions || !Array.isArray(user.permissions)) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        permissions: Array.isArray(user?.permissions) ? user.permissions : [],
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
