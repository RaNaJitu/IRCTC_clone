import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload:
      | { sub: string; email: string; role: string }
      | { deviceId: string; userId: string, jti?: string };

    user: {
      sub: string;
      email: string;
      role: string;
      deviceId: string;
    };
  }
}