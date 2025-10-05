"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
 id: string;
 full_name: string;
 email: string;
}

interface AuthContextType {
 user: User | null;
 login: (user: User) => void;
 logout: () => void;
 isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
 children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  // Check if user is logged in on page load
  const storedUser = localStorage.getItem("quiz_user");
  if (storedUser) {
   try {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
   } catch (error) {
    console.error("Error parsing stored user:", error);
    localStorage.removeItem("quiz_user");
   }
  }
  setIsLoading(false);
 }, []);

 const login = (userData: User) => {
  setUser(userData);
  localStorage.setItem("quiz_user", JSON.stringify(userData));
 };

 const logout = () => {
  setUser(null);
  localStorage.removeItem("quiz_user");
 };

 const value: AuthContextType = {
  user,
  login,
  logout,
  isLoading,
 };

 return (
  <AuthContext.Provider value={value}>
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