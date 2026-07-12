import { UserRepository } from "../../user/user.repository";
import { ITokenService } from "../interfaces/token.interface";
import { AppError } from "../../../exceptions/app-error";
import { AUTH_MESSAGES } from "../../../constants/messages";
import { HTTP_STATUS } from "../../../constants/status-codes";
import { comparePassword, hashToken } from "../../../utils/hash";
import { SessionService } from "../../session/session.service";

export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(data: { email: string, password: string, userAgent?: string, ipAddress?: string }) {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // 1. Create empty session
    const session = await this.sessionService.createSession({
      user: {
        connect: {
          id: user.id,
        },
      },
      refreshTokenHash: "",
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });

    // Generate Access Token
    const accessToken = await this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    });

    // 2. Generate Refresh Token
    const refreshToken =
    await this.tokenService.generateRefreshToken({
      sessionId: session.id,
      userId: user.id,
    });

    //Hash it:
    const refreshTokenHash = hashToken(refreshToken);

    // Update the session:
    await this.sessionService.updateRefreshToken(
      session.id,
      refreshTokenHash
    );
    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}