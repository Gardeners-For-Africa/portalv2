import axios from "axios";
import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import httpClient from "@/lib/http";
import type { AuthState, User } from "@/types";

const API_BASE = "https://g4a-portal-api.onrender.com/api/v1";

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  registerSchool: (formData: FormData) => Promise<any>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    accessToken: null,
    refreshToken: null,
  });

  // restore auth on reload
  useEffect(() => {
    const storedAuth = localStorage.getItem("campusbloom_auth");
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthState({
          user: parsed.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        });
      } catch {
        localStorage.removeItem("campusbloom_auth");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // login with backend
  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
        rememberMe,
      });

      if (response.data?.success) {
        const user: User | null = response.data.user || { email }; // fallback if no full user returned
        const authData = {
          user,
          rememberMe,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
        localStorage.setItem("campusbloom_auth", JSON.stringify(authData));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        return true;
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.message || err.message || "Login failed",
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("campusbloom_auth");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
    });
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const storedAuth = localStorage.getItem("campusbloom_auth");
      if (!storedAuth) return false;

      const parsed = JSON.parse(storedAuth);
      if (!parsed.refreshToken) return false;

      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken: parsed.refreshToken,
      });

      if (response.data?.success) {
        const authData = {
          ...parsed,
          accessToken: response.data.accessToken,
        };
        localStorage.setItem("campusbloom_auth", JSON.stringify(authData));

        setAuthState((prev) => ({
          ...prev,
          accessToken: response.data.accessToken,
        }));

        return true;
      }
      return false;
    } catch {
      logout();
      return false;
    }
  };

  const registerSchool = async (formData: FormData) => {
    try {
      const response = await axios.post(`${API_BASE}/school-registrations`, formData);

      toast({
        title: "School Registered",
        description: "School has been created successfully.",
      });

      return response.data;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to register school",
        variant: "destructive",
      });
      throw err;
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        ...authState,
        login,
        logout,
        registerSchool,
        refreshAccessToken,
      },
    },
    children,
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
