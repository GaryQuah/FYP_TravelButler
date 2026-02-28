/*
This file defines a React context for managing user authentication state across the application. 
It provides a UserProvider component that wraps the app and manages the user state, including loading state while checking localStorage for existing user data. 
The useUser hook allows components to easily access the user state and update it when needed.
TODO: Is this the best way to manage user data? 
*/
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "./api";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state

  useEffect(() => {
    try {
      const item = window.localStorage.getItem("user");
      if (item) {
        setUserState(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUserState(null);
    } finally {
      setLoading(false); // Finished loading
    }
  }, []); // Runs only once on mount

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      window.localStorage.setItem("user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
