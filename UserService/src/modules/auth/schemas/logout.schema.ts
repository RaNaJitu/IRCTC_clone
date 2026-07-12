import { z } from "zod";

export const LogoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export type LogoutInput = z.infer<typeof LogoutSchema>;