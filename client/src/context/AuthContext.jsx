import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getProfile();
        if (isMounted) {
          setUser(profile);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateUser = async (profileData) => {
    try {
      const updated = await userService.updateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const res = await userService.uploadAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatarUrl: res.avatarUrl } : null));
      return res;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('travelai_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        updateUser,
        uploadAvatar,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
