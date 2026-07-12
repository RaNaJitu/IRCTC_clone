import { Session } from "@prisma/client";

export function toSessionResponse(session: Session) {
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    revokedAt: session.revokedAt,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
  };
}