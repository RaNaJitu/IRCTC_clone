import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload:
      | { sub: string; email: string; role: string }
      | { sessionId: string; userId: string };

    user: {
      sub: string;
      email: string;
      role: string;
      sessionId: string;
    };
  }
}