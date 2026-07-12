import { OTP_MESSAGES } from "../constants/messages";
import { HTTP_STATUS } from "../constants/status-codes";
import { AppError } from "../exceptions/app-error";
// import { RedisClient } from "../configs/redis";
import redis from "../configs/redis";
import { env } from "../configs/env";
import otpGenerator from "otp-generator";
import crypto from "crypto";

//#region Generate and Store OTP
export async function generateAndStoreOTP(payload: any) {
    const rateKey = `otp_rate:${payload.email}`;
    const sendCount = parseInt(await redis.get(rateKey) || "0", 10) || 0;

    if(sendCount >= env.OTP_MAX_PER_HOUR) {
        throw new AppError(
            OTP_MESSAGES.OTP_RATE_LIMIT,
            HTTP_STATUS.TOO_MANY_REQUESTS
        );
    }


    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        specialChars: false, 
        lowerCaseAlphabets: false 
    });


    const otpSessionId = crypto.randomUUID();

    //
    const hashedOtp = hmac(payload.email, otp);

    // Store OTP in redis with a TTL
    await redis.set(`otp_session:${otpSessionId}`, 
        JSON.stringify({ data: payload, otp: hashedOtp }),
         "EX",
        env.OTP_TTL
    );  

    // Increment the send count and set expiration for rate limiting
    await redis.incr(rateKey);
    await redis.expire(rateKey, 3600); // 1 hour
    // await redisClient.multi()
    //     .incr(rateKey)
    //     .expire(rateKey, 3600) // 1 hour
    //     .exec();

    return { otp, otpSessionId };
}
//#endregion


//#region HMAC Function
const hmac = (email: string, OTP: string) => {
    return crypto.createHmac('sha256', env.HMAC_SECRET).update(email + ":" + OTP).digest('hex');
}
//#endregion


// #region verify OTP
export async function verifyOTP(otpSessionId: string, otp: string) {
    // Retrieve the OTP session from Redis
    const otpSession = await redis.get(`otp_session:${otpSessionId}`);

    if (!otpSession) {
        throw new AppError(
            OTP_MESSAGES.EXPIRED_SESSION,
            HTTP_STATUS.BAD_REQUEST
        );
    }
    
    //OTP verification only 5 times
    const otpAttemptsKey = `otp_attempts:${otpSessionId}`;
    const attempts = parseInt(await redis.get(otpAttemptsKey) || "0", 10);

    if (attempts >= env.OTP_MAX_VERIFIED_ATTEMPTS) {
        throw new AppError(
            OTP_MESSAGES.OTP_MAX_ATTEMPTS_REACHED,
            HTTP_STATUS.TOO_MANY_REQUESTS
        );
    }
    
    const { data, otp: storedHashedOtp } = JSON.parse(otpSession);

    // Verify the provided OTP against the stored hashed OTP
    const hashedOtp: any = hmac(data.email, otp);

    if (!crypto.timingSafeEqual(Buffer.from(hashedOtp), Buffer.from(storedHashedOtp))) {
        // Increment the attempt count
        await redis.incr(otpAttemptsKey);
        await redis.expire(otpAttemptsKey, env.OTP_TTL); // Set expiration for attempts key
        return null; // Return null to indicate invalid OTP
    }
    // If valid, delete the OTP session to prevent reuse
    await redis.del(`otp_session:${otpSessionId}`);
    await redis.del(`otp_attempts:${otpSessionId}`);
    await redis.del(`otp_rate:${data.email}`);

    return data; // Return the original payload for further processing (like user creation)

}
//#endregion