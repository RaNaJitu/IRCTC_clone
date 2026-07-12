import { Prisma, Session } from "@prisma/client";
import { SessionRepository } from "./session.repository";

export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository
  ) {}

  async createSession(data: Prisma.SessionCreateInput): Promise<Session> {
    return this.sessionRepository.create(data);
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessionRepository.findById(id);
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    return this.sessionRepository.findByRefreshTokenHash(hash);
  }

  // async rotateRefreshToken(
  //   sessionId: string,
  //   refreshTokenHash: string,
  //   expiresAt: Date
  // ) {
  //   return this.sessionRepository.updateRefreshToken(
  //     sessionId,
  //     refreshTokenHash,
  //     expiresAt
  //   );
  // }

  async revokeSession(sessionId: string) {
    return this.sessionRepository.revoke(sessionId);
  }

  async revokeAllSessions(userId: string) {
    return this.sessionRepository.revokeAll(userId);
  }

  async cleanupExpiredSessions() {
    return this.sessionRepository.deleteExpired();
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string
  ) {
    return this.sessionRepository.updateRefreshToken(
      sessionId,
      refreshTokenHash
    );
  }

  async findById(id: string) {
    return this.sessionRepository.findById(id);
  }
}