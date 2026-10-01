import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  api,
  getAuthToken,
  removeAuthToken,
  getActiveBusinessId,
  setActiveBusinessId as setStorageActiveBusinessId,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  activeBusinessId: string | null;
  login: (email: string, pass: string) => Promise<void>;
  pinLogin: (pin: string) => Promise<void>;
  logout: () => void;
  switchBusiness: (id: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(getActiveBusinessId());

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);

      // If active business not set or not in user's businesses, set first available
      if (!activeBusinessId && data.user.businesses && data.user.businesses.length > 0) {
        const firstId = data.user.businesses[0]._id;
        setActiveBusinessIdState(firstId);
        setStorageActiveBusinessId(firstId);
      }
    } catch (err) {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      if (data.user.businesses && data.user.businesses.length > 0) {
        const firstId = data.user.businesses[0]._id;
        setActiveBusinessIdState(firstId);
        setStorageActiveBusinessId(firstId);
      }
    } finally {
      setLoading(false);
    }
  };

  const pinLogin = async (pin: string) => {
    setLoading(true);
    try {
      const data = await api.pinLogin(pin);
      setUser(data.user);
      if (data.user.businesses && data.user.businesses.length > 0) {
        const firstId = data.user.businesses[0]._id;
        setActiveBusinessIdState(firstId);
        setStorageActiveBusinessId(firstId);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const switchBusiness = (id: string) => {
    setActiveBusinessIdState(id);
    setStorageActiveBusinessId(id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        activeBusinessId,
        login,
        pinLogin,
        logout,
        switchBusiness,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
