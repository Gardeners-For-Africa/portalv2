import { registerAs } from "@nestjs/config";
import { z } from "zod";

// Validation schemas
const AppConfigSchema = z.object({
  PORT: z.coerce.number().default(32190),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("*"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  BASE_URL: z.string().default("http://localhost:32190/api/v1"),
  FRONTEND_URL: z.string().default("http://localhost:32190"),
});

const DatabaseConfigSchema = z.object({
  // Master database for tenant management
  MASTER_DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://username:password@localhost:5432/g4a_master"),
  // Default database URL for backward compatibility
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://username:password@localhost:5432/g4a_portal"),
  // Database connection settings
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().default("username"),
  DB_PASSWORD: z.string().default("password"),
  DB_NAME_PREFIX: z.string().default("g4a_tenant_"),
  // TypeORM settings
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),
  DB_LOGGING: z.coerce.boolean().default(false),
  DB_MIGRATIONS_RUN: z.coerce.boolean().default(true),
});

const EmailConfigSchema = z.object({
  MAIL_HOST: z.string().default("sandbox.smtp.mailtrap.io"),
  MAIL_PORT: z.coerce.number().min(1).max(65535).default(587),
  MAIL_USER: z.string().default("6096323b662003"),
  MAIL_PASSWORD: z.string().default("0377296367428d"),
  MAIL_FROM: z.string().default("no-reply@routerx.co"),
  MAIL_NAME: z.string().default("Favour from RouterX"),
});

const JwtConfigSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32)
    .default("your-super-secret-jwt-key-that-is-at-least-32-characters-long"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default("your-super-secret-refresh-jwt-key-that-is-at-least-32-characters-long"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const CookieConfigSchema = z.object({
  COOKIE_SECRET: z
    .string()
    .min(32)
    .default("your-super-secret-cookie-key-that-is-at-least-32-characters-long"),
  COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  COOKIE_MAX_AGE: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
  COOKIE_DOMAIN: z.string().optional(),
});

const MediaConfigSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().default("g4a-media"),
  CLOUDINARY_API_KEY: z.string().default("1234567890"),
  CLOUDINARY_API_SECRET: z.string().default("1234567890"),
  CLOUDINARY_SECURE: z.coerce.boolean().default(true),
});

// Configuration factory functions
export const appConfig = registerAs("app", () => {
  const result = AppConfigSchema.parse(process.env);
  return {
    port: result.PORT,
    nodeEnv: result.NODE_ENV,
    corsOrigin: result.CORS_ORIGIN,
    logLevel: result.LOG_LEVEL,
    baseUrl: result.BASE_URL,
    frontendUrl: result.FRONTEND_URL,
  };
});

export const databaseConfig = registerAs("database", () => {
  const result = DatabaseConfigSchema.parse(process.env);
  return {
    masterDatabaseUrl: result.MASTER_DATABASE_URL,
    databaseUrl: result.DATABASE_URL,
    host: result.DB_HOST,
    port: result.DB_PORT,
    username: result.DB_USERNAME,
    password: result.DB_PASSWORD,
    namePrefix: result.DB_NAME_PREFIX,
    synchronize: result.DB_SYNCHRONIZE,
    logging: result.DB_LOGGING,
    migrationsRun: result.DB_MIGRATIONS_RUN,
  };
});

export const emailConfig = registerAs("email", () => {
  const result = EmailConfigSchema.parse(process.env);
  return {
    host: result.MAIL_HOST,
    port: result.MAIL_PORT,
    user: result.MAIL_USER,
    password: result.MAIL_PASSWORD,
    from: result.MAIL_FROM,
    name: result.MAIL_NAME,
  };
});

export const jwtConfig = registerAs("jwt", () => {
  const result = JwtConfigSchema.parse(process.env);
  return {
    jwtSecret: result.JWT_SECRET,
    jwtExpiresIn: result.JWT_EXPIRES_IN,
    jwtRefreshSecret: result.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: result.JWT_REFRESH_EXPIRES_IN,
  };
});

export const cookieConfig = registerAs("cookie", () => {
  const result = CookieConfigSchema.parse(process.env);
  return {
    cookieSecret: result.COOKIE_SECRET,
    cookieHttpOnly: result.COOKIE_HTTP_ONLY,
    cookieSecure: result.COOKIE_SECURE,
    cookieSameSite: result.COOKIE_SAME_SITE,
    cookieMaxAge: result.COOKIE_MAX_AGE,
    cookieDomain: result.COOKIE_DOMAIN,
  };
});

export const mediaConfig = registerAs("media", () => {
  const result = MediaConfigSchema.parse(process.env);
  return {
    cloudinaryCloudName: result.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: result.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: result.CLOUDINARY_API_SECRET,
    cloudinarySecure: result.CLOUDINARY_SECURE,
  };
});
