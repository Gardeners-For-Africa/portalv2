import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { MailService } from "./mail.service";

describe("MailService", () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const mockMailerService = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should send magic link email", async () => {
    const email = "test@example.com";
    const payload = {
      firstName: "John",
      email: "test@example.com",
      magicLink: "https://example.com/magic?token=123",
      expiryTime: "10 minutes",
      supportUrl: "https://example.com/support",
      helpUrl: "https://example.com/help",
      contactUrl: "https://example.com/contact",
    };

    await service.sendMagicLink(email, payload);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: "Your Magic Link - Gardeners for Africa Portal",
      template: "magic-link",
      context: {
        ...payload,
        magicUrl: payload.magicLink,
      },
    });
  });

  it("should send reset password email", async () => {
    const email = "test@example.com";
    const payload = {
      firstName: "John",
      email: "test@example.com",
      resetPasswordLink: "https://example.com/reset?token=123",
      expiryTime: "15 minutes",
      supportUrl: "https://example.com/support",
      helpUrl: "https://example.com/help",
      contactUrl: "https://example.com/contact",
    };

    await service.sendResetPassword(email, payload);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: "Reset Your Password - Gardeners for Africa Portal",
      template: "reset-password",
      context: {
        ...payload,
        resetUrl: payload.resetPasswordLink,
      },
    });
  });

  it("should send welcome email", async () => {
    const email = "test@example.com";
    const payload = {
      firstName: "John",
      email: "test@example.com",
      welcomeLink: "https://example.com/dashboard",
      role: "teacher",
      supportUrl: "https://example.com/support",
      helpUrl: "https://example.com/help",
      contactUrl: "https://example.com/contact",
    };

    await service.sendWelcomeEmail(email, payload);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: "Welcome to Your New Portal Powered by Gardeners for Africa",
      template: "welcome-email",
      context: {
        ...payload,
        loginUrl: payload.welcomeLink,
      },
    });
  });
});
