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
  const res = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { detail } = await res.json();
    throw new Error(detail || "Login failed");
  }

  const user = await res.json();
  setUser(user);
  localStorage.setItem("smartpix_user", JSON.stringify(user));
};


const signup = async (email: string, password: string): Promise<void> => {
  const res = await fetch("http://localhost:8000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { detail } = await res.json();
    throw new Error(detail || "Signup failed");
  }

  const user = await res.json();
  setUser(user);
  localStorage.setItem("smartpix_user", JSON.stringify(user));
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