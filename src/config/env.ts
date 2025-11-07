import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  MONGODB_URI: z.string().min(1),
  APP_JWT_SECRET: z.string().min(32),
  SEPIDAR_URL: z.string().url(),
  DEFAULT_GENERATION_VERSION: z.string().default("110"),
  SEPIDAR_SERVICE_USERNAME: z.string().optional(),
  SEPIDAR_SERVICE_PASSWORD: z.string().optional()
}).superRefine((val, ctx) => {
  if ((val.SEPIDAR_SERVICE_USERNAME && !val.SEPIDAR_SERVICE_PASSWORD) || (!val.SEPIDAR_SERVICE_USERNAME && val.SEPIDAR_SERVICE_PASSWORD)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both SEPIDAR_SERVICE_USERNAME and SEPIDAR_SERVICE_PASSWORD must be provided together"
    });
  }
});

export const env = schema.parse(process.env);
