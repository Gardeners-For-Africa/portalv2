import { ConfigService } from "@nestjs/config";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../database/entities/user.entity";
import { TenantService } from "../../tenant/tenant.service";
import { CookieService } from "../services/cookie.service";
import { JwtService } from "../services/jwt.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
            generateTokenPair: jest.fn(),
          },
        },
        {
          provide: NestJwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn(),
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
        {
          provide: TenantService,
          useValue: {
            findById: jest.fn(),
            getSchoolById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
