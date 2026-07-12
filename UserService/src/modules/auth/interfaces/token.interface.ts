import { Role } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  sessionId: string;
}


export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
}

export interface ITokenService {
  generateAccessToken(
    payload: JwtPayload
  ): Promise<string>;

  generateRefreshToken(
    payload: RefreshTokenPayload
  ): Promise<string>;

  verifyAccessToken(
    token: string
  ): Promise<JwtPayload>;

  verifyRefreshToken(
    token: string
  ): Promise<RefreshTokenPayload>;
}