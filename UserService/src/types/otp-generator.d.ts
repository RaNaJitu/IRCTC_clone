declare module "otp-generator" {
  interface OTPOptions {
    digits?: boolean;
    lowerCaseAlphabets?: boolean;
    upperCaseAlphabets?: boolean;
    specialChars?: boolean;
  }

  export function generate(
    length: number,
    options?: OTPOptions
  ): string;

  const otpGenerator: {
    generate: typeof generate;
  };

  export default otpGenerator;
}