import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { AuthState, Tenant, User, UserRole } from "@/types";

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@campusbloom.com",
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "principal@greenvalley.edu",
    firstName: "Dr. Maria",
    lastName: "Rodriguez",
    role: "school_admin",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b4c5?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    tenantId: "tenant-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "john.smith@greenvalley.edu",
    firstName: "John",
    lastName: "Smith",
    role: "teacher",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    tenantId: "tenant-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "emma.wilson@student.greenvalley.edu",
    firstName: "Emma",
    lastName: "Wilson",
    role: "student",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    tenantId: "tenant-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    email: "david.wilson@parent.greenvalley.edu",
    firstName: "David",
    lastName: "Wilson",
    role: "parent",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    isActive: true,
    tenantId: "tenant-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const MOCK_TENANTS: Tenant[] = [
  {
    id: "tenant-1",
    name: "Green Valley School",
    slug: "green-valley",
    logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop",
    isActive: true,
    settings: {
      schoolName: "Green Valley International School",
      address: "123 Education Street, Learning City, LC 12345",
      phone: "+1 (555) 123-4567",
      email: "info@greenvalley.edu",
      academicYear: "2024-2025",
      currency: "USD",
      timezone: "America/New_York",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

interface AuthContextType extends AuthState {
  login: (email: string, password: string, tenantSlug?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantSlug?: string;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for stored auth data on initialization
    const storedAuth = localStorage.getItem("campusbloom_auth");
    if (storedAuth) {
      try {
        const { user, tenant } = JSON.parse(storedAuth);
        setAuthState({
          user,
          tenant,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem("campusbloom_auth");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string, tenantSlug?: string): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find((u) => u.email === email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      let tenant: Tenant | null = null;
      if (user.role !== "super_admin") {
        if (tenantSlug) {
          tenant = MOCK_TENANTS.find((t) => t.slug === tenantSlug) || null;
        } else if (user.tenantId) {
          tenant = MOCK_TENANTS.find((t) => t.id === user.tenantId) || null;
        }

        if (!tenant) {
          throw new Error("Invalid school/tenant");
        }
      }

      const authData = { user, tenant };
      localStorage.setItem("campusbloom_auth", JSON.stringify(authData));

      setAuthState({
        user,
        tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      return false;
    }
  };

  const register: AuthContextType["register"] = async (userData) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new mock user
      const newUser: User = {
        id: (MOCK_USERS.length + 1).toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}`,
        isActive: true,
        tenantId: userData.tenantSlug
          ? MOCK_TENANTS.find((t) => t.slug === userData.tenantSlug)?.id
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_USERS.push(newUser);

      const tenant = userData.tenantSlug
        ? MOCK_TENANTS.find((t) => t.slug === userData.tenantSlug) || null
        : null;

      const authData = { user: newUser, tenant };
      localStorage.setItem("campusbloom_auth", JSON.stringify(authData));

      setAuthState({
        user: newUser,
        tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("campusbloom_auth");
    setAuthState({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const switchRole = (role: UserRole) => {
    const mockUser = MOCK_USERS.find((u) => u.role === role);
    if (mockUser && authState.user) {
      const updatedUser = { ...mockUser, id: authState.user.id };
      const authData = { user: updatedUser, tenant: authState.tenant };
      localStorage.setItem("campusbloom_auth", JSON.stringify(authData));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        ...authState,
        login,
        register,
        logout,
        switchRole,
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
