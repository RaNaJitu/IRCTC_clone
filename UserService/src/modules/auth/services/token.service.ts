
import { env } from "../../../configs/env";
import { FastifyInstance } from "fastify";

import {
  ITokenService,
  JwtPayload,
  RefreshTokenPayload,
} from "../interfaces/token.interface";

export class FastifyTokenService implements ITokenService {
  constructor(private readonly app: FastifyInstance) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.app.jwt.sign(
      {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
      },
      {
        expiresIn: env.JWT_ACCESS_EXPIRES,
      }
    );
  }

  async verifyAccessToken(
    token: string
  ): Promise<JwtPayload> {
    const decoded = await this.app.jwt.verify<JwtPayload>(
      token
    );

    return decoded;
  }

  async generateRefreshToken(
    payload: RefreshTokenPayload
  ): Promise<string> {
    return this.app.jwt.sign(
      {
        sessionId: payload.sessionId,
        userId: payload.userId,
        // sessionId: payload.sessionId,
        // userId: payload.userId,
      },
      {
        key: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRES,
      }
    );
  }


  async verifyRefreshToken(
    token: string
  ): Promise<RefreshTokenPayload> {
    const decoded =
      await this.app.jwt.verify<RefreshTokenPayload>(
        token,
        {
          key: env.JWT_REFRESH_SECRET,
        }
      );

    return decoded;
  }


}