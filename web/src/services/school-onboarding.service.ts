import {
  OnboardingFilters,
  OnboardingListResponse,
  OnboardingProgress,
  OnboardingStats,
  OnboardingStatus,
  OnboardingStep,
  StepCompletionData,
} from "@/types/school-onboarding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class SchoolOnboardingService {
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

  // Initialize onboarding for current user
  async initializeOnboarding(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/initialize", {
      method: "POST",
    });
  }

  // Start onboarding process
  async startOnboarding(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/start", {
      method: "POST",
    });
  }

  // Get current user's onboarding progress
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/progress");
  }

  // Complete a specific step
  async completeStep(data: StepCompletionData): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/complete-step", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Move to next step
  async nextStep(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/next-step", {
      method: "POST",
    });
  }

  // Move to previous step
  async previousStep(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/previous-step", {
      method: "POST",
    });
  }

  // Skip current step
  async skipStep(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/skip-step", {
      method: "POST",
    });
  }

  // Abandon onboarding process
  async abandonOnboarding(reason?: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/abandon", {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Restart onboarding process
  async restartOnboarding(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>("/onboarding/restart", {
      method: "POST",
    });
  }

  // Get onboarding statistics (superadmin only)
  async getOnboardingStats(): Promise<OnboardingStats> {
    return this.request<OnboardingStats>("/onboarding/stats");
  }

  // Get all onboarding records (superadmin only)
  async getAllOnboardings(filters: OnboardingFilters = {}): Promise<OnboardingListResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.step) params.append("step", filters.step);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/onboarding/all?${queryString}` : "/onboarding/all";

    return this.request<OnboardingListResponse>(endpoint);
  }

  // Get specific onboarding record (superadmin only)
  async getOnboardingById(id: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>(`/onboarding/${id}`);
  }

  // Require approval for onboarding (superadmin only)
  async requireApproval(id: string, notes?: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>(`/onboarding/${id}/require-approval`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  }

  // Approve onboarding (superadmin only)
  async approveOnboarding(id: string, notes?: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>(`/onboarding/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  }

  // Reject onboarding (superadmin only)
  async rejectOnboarding(id: string, reason: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>(`/onboarding/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Get onboarding analytics (superadmin only)
  async getOnboardingAnalytics(): Promise<{
    completionRate: number;
    averageCompletionTime: number;
    stepCompletionRates: Record<OnboardingStep, number>;
    abandonmentReasons: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      started: number;
      completed: number;
      abandoned: number;
    }>;
  }> {
    return this.request("/onboarding/analytics");
  }

  // Export onboarding data (superadmin only)
  async exportOnboardingData(filters: OnboardingFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.step) params.append("step", filters.step);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/onboarding/export?${queryString}` : "/onboarding/export";

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }
}

export const schoolOnboardingService = new SchoolOnboardingService();
