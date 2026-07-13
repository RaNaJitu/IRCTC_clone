export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: "User registered successfully",

  LOGIN_SUCCESS: "Login successful",

  INVALID_CREDENTIALS: "Invalid email or password",

  CONFIRM_PASSWORD: "confirm password is not Matched to password",

  EMAIL_EXISTS: "Email already exists",

  MISSING_FIELDS: "Missing required fields",

  UNAUTHORIZED: "Unauthorized",

  MISSING_REFRESH_TOKEN : "Missing refresh Token"
} as const;

export const USER_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exits",
} as const;

export const OTP_MESSAGES = {
  OTP_SENT: "OTP sent successfully",
  OTP_VERIFIED: "OTP verified successfully",
  OTP_EXPIRED: "OTP has expired",
  OTP_INVALID: "Invalid OTP",
  OTP_RATE_LIMIT: "Too many OTP requests. Please try again later.",
  EXPIRED_SESSION: "Expired OTP session. Please request a new OTP.",
  OTP_MAX_ATTEMPTS_REACHED: "Maximum OTP verification attempts reached. Please request a new OTP.",
} as const;