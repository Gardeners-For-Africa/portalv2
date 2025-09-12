import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import {
  MagicLinkEmailData,
  ResetPasswordEmailData,
  TeacherInvitationEmailData,
  WelcomeEmailData,
} from "./mail.types";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMagicLink(email: string, payload: MagicLinkEmailData) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Your Magic Link - Gardeners for Africa Portal",
      template: "magic-link",
      context: {
        ...payload,
        magicUrl: payload.magicLink, // Map magicLink to magicUrl for template
      },
    });
  }

  async sendResetPassword(email: string, payload: ResetPasswordEmailData) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Reset Your Password - Gardeners for Africa Portal",
      template: "reset-password",
      context: {
        ...payload,
        resetUrl: payload.resetPasswordLink, // Map resetPasswordLink to resetUrl for template
      },
    });
  }

  async sendWelcomeEmail(email: string, payload: WelcomeEmailData) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Welcome to Your New Portal Powered by Gardeners for Africa",
      template: "welcome-email",
      context: {
        ...payload,
        loginUrl: payload.welcomeLink, // Map welcomeLink to loginUrl for template
      },
    });
  }

  async sendTeacherInvitation(email: string, payload: TeacherInvitationEmailData) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Teacher Invitation - ${payload.schoolName} | Gardeners for Africa Portal`,
      template: "teacher-invitation",
      context: {
        ...payload,
        expiresAt: payload.expiresAt.toLocaleDateString(),
        daysUntilExpiry: payload.daysUntilExpiry,
      },
    });
  }
}
