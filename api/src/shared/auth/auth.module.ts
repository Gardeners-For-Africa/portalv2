import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission, Role, User } from "../../database/entities";
import { TenantModule } from "../../tenant/tenant.module";
import { CookieService } from "../services/cookie.service";
import { JwtService } from "../services/jwt.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RolesGuard } from "./guards/roles.guard";
import { TenantGuard } from "./guards/tenant.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.jwtSecret"),
        signOptions: {
          expiresIn: configService.get<string>("jwt.jwtExpiresIn"),
        },
      }),
      inject: [ConfigService],
    }),
    TenantModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CookieService,
    JwtService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}
