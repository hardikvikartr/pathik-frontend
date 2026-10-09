"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { SecureStorage } from "../utils/secureStorage";
import authService from "../services/auth/authService";
import { toast } from "react-toastify";

export type UserRole = "SUPER_ADMIN" | "POLICE_STATION" | "HOTEL";

interface User {
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check SecureStorage for user
    const savedUser = SecureStorage.getItem("pathikUser");
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    SecureStorage.setItem("pathikUser", userData);
    SecureStorage.setItem("token", token || "default-token");
    router.push("/dashboard");
  };

  const logout = async () => {
    let userType: "HOTEL" | "POLICE" | "ADMIN";
    if (user?.role === "HOTEL") {
      userType = "HOTEL";
    } else if (user?.role === "POLICE_STATION") {
      userType = "POLICE";
    } else {
      userType = "ADMIN";
    }
    const toastId = toast.loading("Logging out...");
    const response = await authService.logout(userType);
    toast.update(toastId, {
      render: "Logged out successfully",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });
    if (response?.code === 200) {
      setUser(null);
      SecureStorage.removeItem("pathikUser");
      SecureStorage.removeItem("token");
      if (userType === "ADMIN") {
        router.push("/sys-admin");
      } else if (userType === "POLICE") {
        router.push("/police");
      } else {
        router.push("/hotel");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
