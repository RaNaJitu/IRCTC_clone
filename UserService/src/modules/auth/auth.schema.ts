import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z.string().min(2),

  lastName: z.string().min(2),

  email: z.email(),

  password: z.string().min(8),
});

export type RegisterInput = z.infer<
  typeof RegisterSchema
>;

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginSchema>;