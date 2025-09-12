import {
  AcceptInvitationRequest,
  CreateTeacherInvitationRequest,
  DeclineInvitationRequest,
  InvitationFilters,
  InvitationListResponse,
  InvitationStats,
  ResendInvitationRequest,
  TeacherInvitation,
  UpdateTeacherInvitationRequest,
} from "@/types/teacher-invitation";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class TeacherInvitationService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("authToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Create a new teacher invitation
  async createInvitation(data: CreateTeacherInvitationRequest): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>("/teacher-invitations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get all teacher invitations with filters
  async getInvitations(filters: InvitationFilters = {}): Promise<InvitationListResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/teacher-invitations?${queryString}` : "/teacher-invitations";

    return this.request<InvitationListResponse>(endpoint);
  }

  // Get invitation statistics
  async getStats(): Promise<InvitationStats> {
    return this.request<InvitationStats>("/teacher-invitations/stats");
  }

  // Get invitation by ID
  async getInvitationById(id: string): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>(`/teacher-invitations/${id}`);
  }

  // Update invitation
  async updateInvitation(
    id: string,
    data: UpdateTeacherInvitationRequest,
  ): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>(`/teacher-invitations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Resend invitation
  async resendInvitation(
    id: string,
    data: ResendInvitationRequest = {},
  ): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>(`/teacher-invitations/${id}/resend`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Cancel invitation
  async cancelInvitation(id: string): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>(`/teacher-invitations/${id}`, {
      method: "DELETE",
    });
  }

  // Get invitation by token (public endpoint)
  async getInvitationByToken(token: string): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>(`/invite/teacher?token=${token}`);
  }

  // Accept invitation (public endpoint)
  async acceptInvitation(
    data: AcceptInvitationRequest,
  ): Promise<{ user: any; invitation: TeacherInvitation }> {
    return this.request<{ user: any; invitation: TeacherInvitation }>("/invite/teacher/accept", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Decline invitation (public endpoint)
  async declineInvitation(data: DeclineInvitationRequest): Promise<TeacherInvitation> {
    return this.request<TeacherInvitation>("/invite/teacher/decline", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const teacherInvitationService = new TeacherInvitationService();
