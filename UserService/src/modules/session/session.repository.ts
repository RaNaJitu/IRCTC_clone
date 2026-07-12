import { Prisma, Session } from "@prisma/client";
import { prisma } from "../../configs/prisma";

export class SessionRepository {
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.session.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
    });
  }

  async findActiveSession(id: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        id,
        revokedAt: null,
      },
    });
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string
  ) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  async revoke(id: string): Promise<Session> {
    return prisma.session.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAll(userId: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async deleteExpired() {
    return prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async findBySessionId(sessionId: string) {
    return prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

}