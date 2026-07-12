import { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../constants/status-codes";
import { AUTH_MESSAGES } from "../constants/messages";
import { AppError } from "../exceptions/app-error";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const { sessionId } = request.user;
    const session = await request.server.container.sessionService.findById(
      sessionId);
    

    if (!session) {
      throw new AppError("Session not found", 401);
    }
    
    if (session.revokedAt) {
      throw new AppError("Session has been revoked", 401);
    }
    
    if (session.expiresAt < new Date()) {
      throw new AppError("Session has expired", 401);
    }
  } catch {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      message: AUTH_MESSAGES.UNAUTHORIZED,
    });
  }
}