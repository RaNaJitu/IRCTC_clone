import { AppError } from "../../../exceptions/app-error";
import { hashToken } from "../../../utils/hash";
import { SessionService } from "../../session/session.service";

import { ITokenService } from "../interfaces/token.interface";

export class RefreshTokenService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: ITokenService
  ) {}

  
  async execute(refreshToken: string) {

    const payload =
    await this.tokenService.verifyRefreshToken(
        refreshToken
    );

    // Validate Session:
    const session =
    await this.sessionService.findById(
        payload.sessionId
    );
    if (!session) {
        throw new AppError(
          "Session not found",
          401
        );
      }

    //   Check revoked:
      if (session.revokedAt) {
        throw new AppError(
          "Session revoked",
          401
        );
      }

    //   Check expiry:
      if (session.expiresAt < new Date()) {
        throw new AppError(
          "Session expired",
          401
        );
      }

    //   Verify Token Hash
      const hash =
        hashToken(refreshToken);

        if (
        hash !== session.refreshTokenHash
        ) {
        throw new AppError(
            "Invalid refresh token",
            401
        );
    }

    // Generate new access token:
    const accessToken =
    await this.tokenService.generateAccessToken({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.id
    });

    // Generate new refresh token:
    const newRefreshToken =
    await this.tokenService.generateRefreshToken({
        sessionId: session.id,
        userId: session.userId,
    });

    // Hash the new token:
    const refreshTokenHash = hashToken(newRefreshToken);


    // Update the session:
    await this.sessionService.updateRefreshToken(
    session.id,
    refreshTokenHash
    );


    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
  }
}