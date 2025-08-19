import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('smartpix_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('smartpix_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // This is a mock implementation
    // In a real app, you would call your authentication API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }
        
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }
        
        // Create mock user
        const newUser = {
          email,
          id: Math.random().toString(36).substring(2, 15),
        };
        
        setUser(newUser);
        localStorage.setItem('smartpix_user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const signup = async (email: string, password: string): Promise<void> => {
    // This is a mock implementation
    // In a real app, you would call your authentication API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }
        
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }
        
        // Create mock user
        const newUser = {
          email,
          id: Math.random().toString(36).substring(2, 15),
        };
        
        setUser(newUser);
        localStorage.setItem('smartpix_user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartpix_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};