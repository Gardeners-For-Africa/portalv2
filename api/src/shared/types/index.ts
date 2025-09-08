export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
  schoolId?: string;
  sub?: string;
}
