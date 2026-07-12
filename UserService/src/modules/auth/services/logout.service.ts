import { AppError } from "../../../exceptions/app-error";
import { SessionService } from "../../session/session.service";
import { ITokenService } from "../interfaces/token.interface";

export class LogoutService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    // Verify refresh token
    const payload =
      await this.tokenService.verifyRefreshToken(
        refreshToken
      );

    // Load session
    const session =
      await this.sessionService.findById(
        payload.sessionId
      );

    if (!session) {
      throw new AppError("Session not found", 401);
    }

    if (session.revokedAt) {
      throw new AppError("Session already revoked", 401);
    }

    // Revoke session
    await this.sessionService.revokeSession(
      session.id
    );
  }
}