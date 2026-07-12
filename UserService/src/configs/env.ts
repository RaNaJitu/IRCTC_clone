import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  HOST: z.string().default("0.0.0.0"),
  
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string(),
  LOG_LEVEL: z.string(),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),


  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  REDIS_URL : z.string(),
  SENDGRID_API_KEY : z.string(),
  OTP_TTL : z.coerce.number().default(300), // 300 second = 5 mint
  EMAIL_SEND : z.string(),
  OTP_MAX_PER_HOUR: z.coerce.number().default(5),
  OTP_MAX_VERIFIED_ATTEMPTS: z.coerce.number().default(5),
  HMAC_SECRET: z.string().min(10)
});

export const env = envSchema.parse(process.env);