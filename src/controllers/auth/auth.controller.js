import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { savePendingRegistration } from "../../services/auth/auth.service.js";
import { getUserBy } from "../../services/auth/user.service.js";
import {
  hashValidMailDomain,
  sendRegistrationOtp,
} from "../../utils/email.util.js";
import { generateOtp, hashOtp } from "../../utils/otp.util.js";
import { registerSchema } from "../../validations/auth.schema.js";
export const register = async (req, res, next) => {
  const data = registerSchema.parse(req.body); //validateion
  const { firstName, lastName, email, password } = data;

  const isMail = await hashValidMailDomain(email); // validate is that a real mail?
  if (!isMail) return next(createHttpError(400, "Please enter a valid email"));

  const haveUser = await getUserBy("email", email); //check existing user
  if (haveUser)
    return next(createHttpError(409, "This user is already registered"));

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const otpExpirs = new Date(Date.now() + 10 * 60 * 1000); // 1000 ->1s , 60s -> 1m , final 10 m

  const passwordHash = await bcrypt.hash(password, 10); //hash password

  const pending = await savePendingRegistration({
    email,
    firstName,
    lastName,
    otpHash,
    expiresAt: otpExpire,
    passwordHash,
  });

  const resendAvailableAt = new Date(
    new Date(pending.lastSentAt).getTime() + 60 * 1000,
  );
  await sendRegistrationOtp(email, otp); //send otp by mail

  return res.status(202).join({
    statu: "pending",
    code: "EMAIL_VERIFICATION_REQUIRED",
    email: pending.email,
    expiresAt: pending.expiresAt,
    resendAvailableAt,
  });
};
