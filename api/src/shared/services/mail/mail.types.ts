/**
 * Base Email Data Type
 */
export interface BaseEmailData {
  firstName: string;
  email: string;
  supportUrl: string;
  helpUrl: string;
  contactUrl: string;
}

/**
 * Welcome Email Data Type
 */
export interface WelcomeEmailData extends BaseEmailData {
  welcomeLink: string;
  role: string;
}

/**
 * Reset Password Email Data Type
 */
export interface ResetPasswordEmailData extends BaseEmailData {
  resetPasswordLink: string;
  expiryTime: string;
}

/**
 * Magic Link Email Data Type
 */
export interface MagicLinkEmailData extends BaseEmailData {
  magicLink: string;
  expiryTime: string;
}

/**
 * Teacher Invitation Email Data Type
 */
export interface TeacherInvitationEmailData extends BaseEmailData {
  schoolName: string;
  inviterName: string;
  invitationUrl: string;
  message?: string;
  expiresAt: Date;
  daysUntilExpiry: number;
}
