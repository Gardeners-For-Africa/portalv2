import { Test, TestingModule } from "@nestjs/testing";
import { CookieService } from "../services/cookie.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            requestMagicLink: jest.fn(),
            verifyMagicLink: jest.fn(),
            ssoLogin: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: CookieService,
          useValue: {
            setCookie: jest.fn(),
            clearCookie: jest.fn(),
            setAccessTokenCookie: jest.fn(),
            setRefreshTokenCookie: jest.fn(),
            clearAuthCookies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
