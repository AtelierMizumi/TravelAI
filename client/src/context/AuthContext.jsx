import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      setUser(null);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile().catch(() => {
      // In dev or guest initial state, error is stored in state
    });
  }, []);

  const updateUser = async (profileData) => {
    const updated = await userService.updateProfile(profileData);
    setUser(updated);
    return updated;
  };

  const uploadAvatar = async (file) => {
    const res = await userService.uploadAvatar(file);
    setUser((prev) => (prev ? { ...prev, avatarUrl: res.avatarUrl } : null));
    return res;
  };

  const logout = () => {
    localStorage.removeItem('travelai_token');
    localStorage.removeItem('travelai_demo_user');
    setUser(null);
  };

  const loginDemo = async () => {
    return await fetchProfile();
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
        loginDemo,
        fetchProfile,
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
