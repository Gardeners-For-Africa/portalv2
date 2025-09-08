// Core Types for School Management System

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  currency: string;
  timezone: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
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
  isActive: boolean;
  maxStudents: number;
  currentStudents: number;
  maxTeachers: number;
  currentTeachers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentId: string; // Unique student number
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  parentGuardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    occupation?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  schoolId: string;
  schoolName: string;
  currentClassId?: string;
  currentClassName?: string;
  currentSectionId?: string;
  currentSectionName?: string;
  admissionDate: string;
  enrollmentStatus: "enrolled" | "pending" | "withdrawn" | "graduated" | "suspended";
  academicStatus: "active" | "inactive" | "on_leave" | "graduated";
  gradeLevel: string;
  academicYear: string;
  previousSchool?: string;
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    emergencyNotes?: string;
  };
  academicHistory: {
    classId: string;
    className: string;
    sectionId: string;
    sectionName: string;
    academicYear: string;
    status: "completed" | "in_progress" | "failed";
    promotionDate?: string;
  }[];
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = "enrolled" | "pending" | "withdrawn" | "graduated" | "suspended";
export type AcademicStatus = "active" | "inactive" | "on_leave" | "graduated";
export type PromotionType = "promote" | "retain" | "graduate";

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "core" | "elective" | "optional";
  level: "primary" | "junior_secondary" | "senior_secondary" | "all";
  gradeLevels: string[]; // e.g., ['Basic 1', 'Basic 2', 'JSS 1']
  credits: number;
  hoursPerWeek: number;
  isActive: boolean;
  schoolId: string;
  schoolName: string;
  assignedTeachers: string[]; // Teacher IDs
  assignedClasses: string[]; // Class IDs
  createdAt: string;
  updatedAt: string;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: string;
  name: string;
  description: string;
  category: "school_fees" | "pta_fees" | "boarding_fees" | "other";
  amount: number;
  currency: string;
  academicYear: string;
  term: "first_term" | "second_term" | "third_term" | "all_terms";
  applicableClasses: string[]; // Class IDs
  dueDate: string;
  isActive: boolean;
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "quarterly" | "annually";
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  feeId: string;
  feeName: string;
  feeCategory: string;
  amount: number;
  currency: string;
  paymentMethod: "cash" | "bank_transfer" | "card" | "mobile_money" | "check";
  transactionId?: string;
  receiptNumber: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  academicYear: string;
  term: string;
  classId: string;
  className: string;
  paidDate?: string;
  dueDate: string;
  description?: string;
  notes?: string;
  schoolId: string;
  schoolName: string;
  // Monnify Integration
  invoiceId?: string;
  invoiceReference?: string;
  paymentProvider: "monnify" | "cash" | "bank_transfer" | "manual";
  providerTransactionId?: string;
  providerStatus?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReport {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  paymentsByCategory: Record<string, { count: number; amount: number }>;
  paymentsByClass: Record<string, { count: number; amount: number }>;
  paymentsByTerm: Record<string, { count: number; amount: number }>;
  recentPayments: Payment[];
}

export interface Parent extends User {
  role: "parent";
  studentIds: string[];
  relationship: string;
  phone: string;
  address: string;
}

export interface Teacher extends User {
  role: "teacher";
  employeeId: string;
  subjectIds: string[];
  classIds: string[];
  isFormTeacher: boolean;
  formClassId?: string;
  phone: string;
  qualifications: string[];
}

export interface SchoolClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: "nursery" | "primary" | "secondary" | "junior_secondary" | "senior_secondary";
  grade: string;
  academicYear: string;
  schoolId: string;
  schoolName: string;
  sections: ClassSection[];
  totalSections: number;
  totalStudents: number;
  maxStudentsPerSection: number;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherIds: string[];
  classIds: string[];
  credits: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradingParameters {
  id: string;
  schoolId: string;
  schoolName: string;
  aMin: number;
  aMax: number;
  aPoints: number;
  aDescription: string;
  bMin: number;
  bMax: number;
  bPoints: number;
  bDescription: string;
  cMin: number;
  cMax: number;
  cPoints: number;
  cDescription: string;
  dMin: number;
  dMax: number;
  dPoints: number;
  dDescription: string;
  eMin: number;
  eMax: number;
  ePoints: number;
  eDescription: string;
  fMin: number;
  fMax: number;
  fPoints: number;
  fDescription: string;
  passMark: number;
  maxScore: number;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringConfiguration {
  id: string;
  schoolId: string;
  schoolName: string;
  educationLevel: "nursery" | "primary" | "secondary";
  academicYear: string;
  isActive: boolean;
  // Primary and Secondary scoring
  kickOffTestWeight?: number; // 5%
  firstTestWeight?: number; // 10%
  secondTestWeight?: number; // 10%
  noteWeight?: number; // 5%
  projectWeight?: number; // 10%
  totalTestWeight?: number; // 40%
  examWeight?: number; // 60%
  // Nursery scoring
  nurseryFirstTestWeight?: number; // 20%
  nurserySecondTestWeight?: number; // 20%
  nurseryTotalTestWeight?: number; // 40%
  nurseryExamWeight?: number; // 60%
  createdAt: string;
  updatedAt: string;
}

export interface SubjectScore {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  term: string;
  classId: string;
  className: string;
  // Primary and Secondary scores
  kickOffTest?: number;
  firstTest?: number;
  secondTest?: number;
  note?: number;
  project?: number;
  totalTest?: number;
  exam?: number;
  total?: number;
  // Nursery scores
  nurseryFirstTest?: number;
  nurserySecondTest?: number;
  nurseryTotalTest?: number;
  nurseryExam?: number;
  nurseryTotal?: number;
  // Common fields
  subjectPosition?: number;
  grade?: string;
  gradePoints?: number;
  remarks?: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTermlyResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  classSection: string;
  academicYear: string;
  term: string;
  educationLevel: "nursery" | "primary" | "secondary";
  subjectScores: SubjectScore[];
  totalScore: number;
  maxPossibleScore: number;
  averagePercentage: number;
  averageGradePoints: number;
  totalGradePoints: number;
  letterGrade: string;
  position: number;
  isPromoted: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnnualResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  classSection: string;
  academicYear: string;
  educationLevel: "nursery" | "primary" | "secondary";
  firstTermScore?: number;
  secondTermScore?: number;
  thirdTermScore?: number;
  totalScore: number;
  averageScore: number;
  position: number;
  isPromoted: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  value: number;
  maxValue: number;
  percentage: number;
  letterGrade: string;
  gradePoints: number;
  type: GradeType;
  term: "first_term" | "second_term" | "third_term";
  academicYear: string;
  comments?: string;
  remarks?: string;
  isPublished: boolean;
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  term: "first_term" | "second_term" | "third_term";
  academicYear: string;
  // Summary statistics
  totalSubjects: number;
  totalScore: number;
  maxPossibleScore: number;
  averageScore: number;
  averagePercentage: number;
  totalGradePoints: number;
  averageGradePoints: number;
  // Position and ranking
  position: number;
  totalStudents: number;
  // Grade summary
  letterGrade: string;
  remarks: string;
  // Individual subject grades
  subjectGrades: Grade[];
  // Performance indicators
  isPromoted: boolean;
  promotionRemarks?: string;
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResult {
  id: string;
  classId: string;
  className: string;
  term: "first_term" | "second_term" | "third_term" | "annual";
  academicYear: string;
  // Class statistics
  totalStudents: number;
  totalSubjects: number;
  averageClassScore: number;
  averageClassPercentage: number;
  // Performance distribution
  gradeDistribution: {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
  };
  // Top performers
  topStudents: {
    position: number;
    studentId: string;
    studentName: string;
    totalScore: number;
    averageScore: number;
    letterGrade: string;
  }[];
  // Subject performance
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    averageScore: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
  }[];
  // Student results
  studentResults: StudentResult[];
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export type GradeType =
  | "assignment"
  | "quiz"
  | "midterm"
  | "final"
  | "project"
  | "participation"
  | "exam"
  | "test"
  | "homework";

export type PaymentType = "tuition" | "books" | "transport" | "meals" | "activities" | "other";
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  activeUsers: number;
  pendingPayments: number;
  recentGrades: number;
  [key: string]: number;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  recipientId: string;
  senderId?: string;
  relatedEntityType?: "school" | "user" | "student" | "teacher" | "payment" | "grade";
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  archivedAt?: string;
}

export type NotificationType = "info" | "success" | "warning" | "error" | "system";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  securitySettings: {
    twoFactorAuth: boolean;
    loginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: "daily" | "weekly" | "monthly";
    retentionDays: number;
    backupLocation: string;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    encryption: "none" | "ssl" | "tls";
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  dashboardLayout: "grid" | "list";
  sidebarCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSection {
  id: string;
  name: string;
  classId: string;
  capacity: number;
  currentStudents: number;
  teacherId?: string;
  teacherName?: string;
  roomNumber?: string;
  schedule?: string;
  isActive: boolean;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}
