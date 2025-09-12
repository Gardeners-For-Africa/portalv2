// Teacher Invitation Types

export interface TeacherInvitation {
  id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  firstName?: string;
  lastName?: string;
  message?: string;
  metadata?: Record<string, any>;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  cancelledAt?: string;
  schoolId: string;
  invitedBy: string;
  acceptedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  school?: {
    id: string;
    name: string;
    type: string;
  };
  inviter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  acceptedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired" | "cancelled";

export interface CreateTeacherInvitationRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTeacherInvitationRequest {
  firstName?: string;
  lastName?: string;
  message?: string;
  metadata?: Record<string, any>;
  notes?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface DeclineInvitationRequest {
  token: string;
  reason?: string;
}

export interface ResendInvitationRequest {
  message?: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
  cancelled: number;
  expiringSoon: number;
}

export interface InvitationListResponse {
  invitations: TeacherInvitation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvitationFilters {
  status?: InvitationStatus;
  search?: string;
  page?: number;
  limit?: number;
}
