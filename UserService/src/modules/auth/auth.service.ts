import { UserRepository } from "../user/user.repository";
import { hashPassword } from "../../utils/hash";
import { RegisterInput } from "./auth.schema";
import bcrypt from "bcrypt";
import { AppError } from "../../exceptions/app-error";
import { AUTH_MESSAGES, OTP_MESSAGES, USER_MESSAGES } from "../../constants/messages";
import { HTTP_STATUS } from "../../constants/status-codes";
import { LOGGER } from "../../configs/logger";
import { sendOTPEmail, verifyOTPEmail } from "../../utils/email";
import { generateAndStoreOTP, verifyOTP } from "../../utils/otp";
import redis from "../../configs/redis";
import { SessionService } from "../session/session.service";
import { ITokenService } from "../auth/interfaces/token.interface";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/auth";
import { env } from "../../configs/env";
import { FastifyInstance } from "fastify";

export class AuthService {
  private repository = new UserRepository();
  // private sessionService = new SessionService();
  // private readonly tokenService = tokenService();


  //#region Register
  async register(data: RegisterInput) {
    const exists = await this.repository.findByEmail(data.email);

    if (exists) {
      throw new AppError(AUTH_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await hashPassword(data.password);

    return this.repository.create({
      ...data,
      password: hashedPassword,
    });
  }
  //#endregion

  async login_v1(email: string, password: string) {
    const user = await this.repository.findByEmail(email);

    LOGGER.info("User found:--------", user);
    if (!user) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    return user;
  }
  //#region Login
  async login(app: FastifyInstance, email: string, password: string, deviceId: string) {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const accessToken = await generateAccessToken(app, {
      id: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });

    const refreshToken = await generateRefreshToken(app, {
      deviceId,
      userId: user.id,
    });

    const { jti } = app.jwt.decode(refreshToken) as { jti: string };
    console.log(jti)

    // Store the refresh token in Redis with the jti as the key
    await redis.set(`refresh:${user.id}: device:${deviceId}`, jti, "EX", env.JWT_REFRESH_EXPIRES_IN_SECONDS); // Set expiration to 7 days

    const { password: _password, ...safeUser } = user;

    await redis.set(`user:${user.id}`, JSON.stringify(safeUser), "EX", env.REDIS_USER_TTL); // Cache user data for 24 hours 
    
    return { user: safeUser, accessToken, refreshToken };
  }
  //#endregion

  //#region Me
  async me(userId: string) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new AppError(
        USER_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return user;
  }
  //#endregion

  //#region Send OTP
  async sendOTP(firstName: string, lastName: string, password: string, email: string) {
    const user = await this.repository.findByEmail(email);

    if (user) {
      throw new AppError(
        USER_MESSAGES.USER_ALREADY_EXISTS,
        HTTP_STATUS.NOT_FOUND
      );
    }

    //Has the password
    const hashedPassword = await hashPassword(password);

    const payload = {
      firstName,
      lastName,
      email,
      password: hashedPassword
    };

    //Genrate OTP
    const {otp , otpSessionId} = await generateAndStoreOTP(payload);

    //Send the OTP to the user via email or SMS
    await sendOTPEmail(email, parseInt(otp));


    return {otpSessionId};
  }
  //#endregion


  //#region Verify OTP
  async verifyOTP(otpSessionId: string, otp: string) {
    const data = await verifyOTP(otpSessionId, otp);

    if (!data) {
      throw new AppError(
        OTP_MESSAGES.OTP_INVALID,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    //Create the user after successful OTP verification
    const { firstName, lastName, email, password } = data;
    const user = await this.repository.create({
      firstName,
      lastName,
      email,
      password
    });

    //Send a confirmation email to the user
    await verifyOTPEmail(email, data);

    return user;
  }
  //#endregion

  async rotateRefreshToken(app: FastifyInstance, refreshToken: string, deviceId: string){
    const payload: any = await verifyRefreshToken(app, refreshToken)
    const { userId, jti } = payload

    const storedjti = await redis.get(`refresh:${userId}: device:${deviceId}`)

    console.log("STIREJTI", storedjti)

    if(!storedjti){
      throw new AppError(
        "Session Expired, Login Again",
        403
      )
    }

    if(storedjti !== jti){
      redis.del(`refresh:${userId}: device:${deviceId}`)

      throw new AppError(
        "Refresh Token Re-Used, Login Again",
        403
      )
    }

    const newAccessToken = await generateAccessToken(app, payload)
    const newRefreshToken = await generateRefreshToken(app, payload)

    const { jti:newjti } = await app.jwt.decode(newRefreshToken) as { jti: string };

    await redis.set(`refresh:${userId}: device:${deviceId}`, newjti, "EX", env.JWT_REFRESH_EXPIRES_IN_SECONDS); // Set expiration to 7 days


    return {newAccessToken, newRefreshToken}
  }
}



