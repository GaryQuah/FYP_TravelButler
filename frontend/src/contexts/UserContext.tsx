import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../models";
import { clearAuthState, clearLegacyAccessToken } from "../api/auth";
import { getCurrentUser } from "../api/user";

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
    const hydrateUser = async () => {
      try {
        clearLegacyAccessToken();
        const user = await getCurrentUser();
        setUserState(user);
        window.localStorage.setItem("user", JSON.stringify(user));
      } catch {
        setUserState(null);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
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
