import crypto from "node:crypto";
import { config } from "../config/index.js";
import { OTP_RESEND_COOLDOWN_MS } from "../constant/auth.constant.js";

export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString(); // random(6 digital number)
};
export const hashOtp = (otp) => {
  return crypto
    .createHmac("sha256", config.otp_secret)
    .update(otp)
    .digest("hex");
};

export const getOtpCooldownSeconds = (lastSentAt) => {
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  const remaining = OTP_RESEND_COOLDOWN_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / 1000);
};
