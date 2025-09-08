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
  MONGODB_URI: z.string().url().default("mongodb://localhost:27017/react_auth_course"),
  MONGODB_DATABASE_NAME: z.string().default("react_auth_course"),
  DATABASE_CONNECTION_LIMIT: z.coerce.number().min(1).max(10).default(10),
  DATABASE_CONNECTION_IDLE_TIMEOUT: z.coerce.number().min(1).max(10000).default(10000),
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
    mongodbUri: result.MONGODB_URI,
    mongodbDatabaseName: result.MONGODB_DATABASE_NAME,
    databaseConnectionLimit: result.DATABASE_CONNECTION_LIMIT,
    databaseConnectionIdleTimeout: result.DATABASE_CONNECTION_IDLE_TIMEOUT,
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
