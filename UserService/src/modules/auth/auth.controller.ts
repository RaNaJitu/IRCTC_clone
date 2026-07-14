import fastify, { FastifyReply, FastifyRequest } from "fastify";

import { AuthService } from "./auth.service";

import { LoginSchema, RegisterSchema } from "./auth.schema";
import { successResponse } from "../../utils/response";
import { AUTH_MESSAGES, OTP_MESSAGES, USER_MESSAGES } from "../../constants/messages";
import { toUserResponse } from "../user/user.mapper";
import { LoginService } from "./services/login.service";
import { FastifyTokenService } from "./services/token.service";
import { UserRepository } from "../user/user.repository";
import { RefreshTokenSchema } from "./schemas/refresh-token.schema";
import { LogoutSchema } from "./schemas/logout.schema";
import { LOGGER } from "../../configs/logger";
import { AppError } from "../../exceptions/app-error";
import { HTTP_STATUS } from "../../constants/status-codes";
import { env } from "../../configs/env";
import { generateDeviceFingerprint } from "../../utils/deviceFingerprint";
import redis from "../../configs/redis";

const authService = new AuthService();

// const userRepository = new UserRepository();
// const tokenService = new FastifyTokenService(app);

// const loginService = new LoginService(
//   userRepository,
//   tokenService
// );

//#region Register
export async function register(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = RegisterSchema.parse(request.body);

  const user = await authService.register(body);

  return reply.status(201).send({
    success: true,
    message: "User created successfully",
    data: toUserResponse(user)
  });
}
//#endregion

//#region Login
export async function login(
    request: FastifyRequest,
    reply: FastifyReply
) {

  const body =
      LoginSchema.parse(request.body);

  const user =
      await authService.login_v1(
          body.email,
          body.password,
      );

  const result = await request.server.container.loginService.execute({
      email: body.email,
      password: body.password,
      userAgent: request.headers["user-agent"] ?? "",
      ipAddress: request.ip,
    });


  return reply.send(
    successResponse(
      AUTH_MESSAGES.LOGIN_SUCCESS,
      {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user
        // user: toUserResponse(user),
      }
    )
  );
}
//#endregion

//#region Login for IRCTC
export async function LOGIN(
    request: FastifyRequest<{
    Body: {
      email: string;
      password: string;
    };
  }>,
    reply: FastifyReply
) {

  const body =
      LoginSchema.parse(request.body);

  LOGGER.info("Login Body:--->", body);

  if (!body.email || !body.password) {
    throw new AppError(
      AUTH_MESSAGES.MISSING_FIELDS,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const deviceId = generateDeviceFingerprint(request);
  console.log("login devicedId", deviceId)

  const { user, accessToken, refreshToken } =
      await authService.login(
          request.server,
          body.email,
          body.password,
          deviceId
      );

  reply.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });

  reply.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_REFRESH_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });

  return reply.send(
    successResponse(
      AUTH_MESSAGES.LOGIN_SUCCESS,
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user,
      }
    )
  );
}
//#endregion

//#region Me
export async function me(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user =
    await authService.me(request.user.sub);

  return reply.send(
    successResponse(
      "Current user",
      toUserResponse(user)
    )
  );
}
//#endregion


//#region Refresh Token
export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = RefreshTokenSchema.parse(request.body);

  const result =
    await request.server.container.refreshTokenService.execute(
      body.refreshToken
    );

  return reply.send(
    successResponse(
      "Token refreshed successfully",
      result
    )
  );
}
//#endregion

/**
 * because the endpoint does two different jobs:

Authenticate the caller (using the access token).
Identify which session to revoke (using the refresh token).

Think of it like this:

Access token = "Who is making this request?"
Refresh token = "Which login session should be destroyed?"

If a user is logged in on:

Laptop
Phone
Tablet
 * @param request 
 * @param reply 
 * @returns 
 */
export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
) {
  LOGGER.info("Access Token:", request.headers.authorization)
  LOGGER.info("Refresh token:",request.body)
  const body = LogoutSchema.parse(request.body);

  await request.server.container.logoutService.execute(
    body.refreshToken
  );

  return reply.send(
    successResponse(
      "Logout successful",
      null
    )
  );
}

//#region Send OTP
export async function SEND_OTP(
  request: FastifyRequest<{
    Body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
  }>,
  reply: FastifyReply
) {
  //  console.log("Headers:", request.headers);
  // console.log("Body:", request.body);

  // LOGGER.info(`Body: ${JSON.stringify(request.body, null, 2)}`);
  LOGGER.info("Body:", request.body);


  const { firstName, lastName, email, password, confirmPassword } = request.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new AppError(
      AUTH_MESSAGES.MISSING_FIELDS,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if(password !== confirmPassword){
    throw new AppError(
      AUTH_MESSAGES.CONFIRM_PASSWORD,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const { otpSessionId } = await authService.sendOTP(firstName, lastName, password, email)

  reply.cookie("otp_session", otpSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.OTP_TTL, // seconds
    path: "/",
  });

  return reply.send(
    successResponse(
      "OPT Send successful",
      null
    )
  );
}
//#endregion

//#region Verify OTP
export async function VERIFY_OTP(
  request: FastifyRequest<{
    Body: {
      otp: string;
    };
  }>,
  reply: FastifyReply
) {
  const { otp } = request.body;
  console.log("OTP:", otp);

  if (!otp) {
    throw new AppError(
      AUTH_MESSAGES.MISSING_FIELDS,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const otpSessionId = request.cookies.otp_session;

  if (!otpSessionId) {
    throw new AppError(
      OTP_MESSAGES.EXPIRED_SESSION,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await authService.verifyOTP(otpSessionId, otp);

  return reply.send(
    successResponse(
      "OTP verified successfully",
      { data: user }
    )
  );
}
//#endregion


//#region Rotate Refresh Token
export async function ROTATE_REFRESH_TOKEN(
  request: FastifyRequest,
  reply: FastifyReply
){

  const refreshToken = request.cookies.refresh_token

  if(!refreshToken){
      throw new AppError(
      AUTH_MESSAGES.MISSING_REFRESH_TOKEN,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const deviceId = generateDeviceFingerprint(request);


  const { newAccessToken, newRefreshToken } = await authService.rotateRefreshToken(request.server,refreshToken, deviceId)

  reply.cookie("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });

  reply.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_REFRESH_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });


  return reply.send(
    successResponse(
      "Access And Refresh Token Reissue",
    )
  );
}
//#endregion

//#region google OAuth2.0
export async function VERIFY_GOOGLE_TOKEN(
  request: FastifyRequest<{
    Body:{
      idToken:string
    }
  }>, 
  reply: FastifyReply
){
  const { idToken } = request.body

  if(!idToken){
    throw new AppError(
      "Invalid Google Token, INVALID TOKEN",
      HTTP_STATUS.BAD_REQUEST
    )
  }
  const deviceId = generateDeviceFingerprint(request);
  const { accessToken, refreshToken } = await authService.verifyGoogleToken(request.server, idToken, deviceId)

  reply.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });

  reply.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_REFRESH_EXPIRES_IN_SECONDS * 1000,
    path: "/",
  });


  
  return { accessToken, refreshToken }
}
//#endregion



