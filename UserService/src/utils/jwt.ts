import { FastifyInstance } from "fastify";

export function generateAccessToken(
  app: FastifyInstance,
  payload: {
    id: string;
    email: string;
    role: string;
  }
) {
  return app.jwt.sign({
    sub: payload.id,
    email: payload.email,
    role: payload.role,
  });
}