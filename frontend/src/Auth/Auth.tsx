import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem("role") === "admin");

  const logout = () => {
    localStorage.clear();
    setUsername(null);
    setAuthToken(null);
    setIsAdmin(false);
  };

  // Session management useEffect
  useEffect(() => {
    const checkSessionTimeout = () => {
      const storedLoginTime = localStorage.getItem("loginTime");
      const currentTime = Date.now();

      if (storedLoginTime && currentTime - parseInt(storedLoginTime) > 4 * 60 * 60 * 1000) {
        // If more than 4 hours have passed, log the user out
        logout();
      }
    };

    // Check immediately
    checkSessionTimeout();

    // Set up interval to check every minute
    const intervalId = setInterval(checkSessionTimeout, 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);  // Empty dependency array since we want this to run once on mount

  // Auth state management useEffect
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (token && user) {
      setAuthToken(token);
      setUsername(user);
      setIsAdmin(role === "admin");
    }
  }, []);

  const contextValue: AuthContextType = {
    username,
    setUsername,
    authToken,
    setAuthToken,
    logout,
    isAdmin,
  };
  return (
    <AuthContext.Provider value={contextValue}>
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
