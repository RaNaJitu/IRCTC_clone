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

export class AuthService {
  private repository = new UserRepository();
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

  //#region Login
  async login(email: string, password: string) {
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
}



