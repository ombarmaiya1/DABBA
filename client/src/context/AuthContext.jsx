import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session restoration from HTTP-only cookie
  const checkSession = useCallback(async () => {
    try {
      const data = await getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error indicates unauthenticated guest
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      if (data?.user) {
        setUser(data.user);
      } else {
        // Fallback fetch if user not in login response
        const meData = await getMe();
        if (meData?.user) setUser(meData.user);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    return await apiRegister(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await getMe();
      if (data?.user) setUser(data.user);
    } catch (err) {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
