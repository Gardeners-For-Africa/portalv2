// School Onboarding Types

export enum OnboardingStep {
  ACCOUNT_CREATION = "account_creation",
  EMAIL_VERIFICATION = "email_verification",
  PROFILE_SETUP = "profile_setup",
  SCHOOL_REGISTRATION = "school_registration",
  DOCUMENT_UPLOAD = "document_upload",
  VERIFICATION = "verification",
  PAYMENT_SETUP = "payment_setup",
  COMPLETION = "completion",
}

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
  REQUIRES_APPROVAL = "requires_approval",
}

export interface OnboardingProgress {
  id: string;
  userId: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  progressPercentage: number;
  startedAt?: string;
  completedAt?: string;
  lastStepAt?: string;
  canProceed: boolean;
  nextStep?: OnboardingStep;
}

export interface StepCompletionData {
  step: OnboardingStep;
  data?: Record<string, any>;
  notes?: string;
}

export interface OnboardingStats {
  total: number;
  completed: number;
  inProgress: number;
  abandoned: number;
  pendingApproval: number;
}

export interface OnboardingFilters {
  status?: OnboardingStatus;
  step?: OnboardingStep;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OnboardingListResponse {
  onboardings: OnboardingProgress[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Step-specific data interfaces
export interface AccountCreationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ProfileSetupData {
  bio?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  language?: string;
}

export interface SchoolRegistrationData {
  schoolName: string;
  schoolType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  academicYear: string;
  maxStudents: number;
  maxTeachers: number;
  description?: string;
}

export interface DocumentUploadData {
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface VerificationData {
  verificationStatus: "pending" | "approved" | "rejected";
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface PaymentSetupData {
  paymentMethod: "card" | "bank_transfer" | "mobile_money";
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  subscriptionPlan: "basic" | "premium" | "enterprise";
}

// Step configuration
export interface StepConfig {
  step: OnboardingStep;
  title: string;
  description: string;
  isRequired: boolean;
  estimatedTime: string;
  canSkip: boolean;
  dependencies: OnboardingStep[];
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    step: OnboardingStep.ACCOUNT_CREATION,
    title: "Create Account",
    description: "Set up your basic account information",
    isRequired: true,
    estimatedTime: "2 minutes",
    canSkip: false,
    dependencies: [],
  },
  {
    step: OnboardingStep.EMAIL_VERIFICATION,
    title: "Verify Email",
    description: "Verify your email address",
    isRequired: true,
    estimatedTime: "1 minute",
    canSkip: false,
    dependencies: [OnboardingStep.ACCOUNT_CREATION],
  },
  {
    step: OnboardingStep.PROFILE_SETUP,
    title: "Profile Setup",
    description: "Complete your personal profile",
    isRequired: true,
    estimatedTime: "3 minutes",
    canSkip: false,
    dependencies: [OnboardingStep.EMAIL_VERIFICATION],
  },
  {
    step: OnboardingStep.SCHOOL_REGISTRATION,
    title: "School Registration",
    description: "Register your school information",
    isRequired: true,
    estimatedTime: "5 minutes",
    canSkip: false,
    dependencies: [OnboardingStep.PROFILE_SETUP],
  },
  {
    step: OnboardingStep.DOCUMENT_UPLOAD,
    title: "Upload Documents",
    description: "Upload required school documents",
    isRequired: true,
    estimatedTime: "3 minutes",
    canSkip: false,
    dependencies: [OnboardingStep.SCHOOL_REGISTRATION],
  },
  {
    step: OnboardingStep.VERIFICATION,
    title: "Verification",
    description: "Wait for document verification",
    isRequired: true,
    estimatedTime: "1-2 business days",
    canSkip: false,
    dependencies: [OnboardingStep.DOCUMENT_UPLOAD],
  },
  {
    step: OnboardingStep.PAYMENT_SETUP,
    title: "Payment Setup",
    description: "Set up your payment method",
    isRequired: true,
    estimatedTime: "2 minutes",
    canSkip: false,
    dependencies: [OnboardingStep.VERIFICATION],
  },
  {
    step: OnboardingStep.COMPLETION,
    title: "Completion",
    description: "Welcome to the platform!",
    isRequired: true,
    estimatedTime: "1 minute",
    canSkip: false,
    dependencies: [OnboardingStep.PAYMENT_SETUP],
  },
];
