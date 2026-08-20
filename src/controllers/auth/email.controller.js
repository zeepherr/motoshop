import createHttpError from "http-errors";
import { MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "../../constant/auth.constant.js";
import {
  addAttemptsPending,
  cleanExpirePending,
  createUserFromPending,
  findPendingUser,
  getPendingByEmail,
  updatePendingOtp,
} from "../../services/auth/auth.service.js";
import { sendRegistrationOtp } from "../../utils/email.util.js";
import {
  generateOtp,
  getOtpCooldownSeconds,
  hashOtp,
} from "../../utils/otp.util.js";
import {
  resendVerificationSchema,
  verifyEmailSchema,
} from "../../validations/auth.schema.js";

export const verifyRegistrationEmail = async (req, res, next) => {
  const { email, code } = verifyEmailSchema.parse(req.body);

  const pending = await findPendingUser(email);
  if (!pending)
    return next(createHttpError(404, "No pending registration found!"));

  if (pending.expiresAt < new Date()) {
    //check if the pending has expred
    return next(
      createHttpError(
        400,
        "Verification code has expired.Please request a new code.",
        { code: "VERIFICATION_CODE_EXPIRED" },
      ),
    );
  }
  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    //check remaning apptempt
    const error = createHttpError(
      429,
      "Too many incorrect attempts. Please request a new verification code.",
    );
    error.code = "TOO_MANY_VERIFICATION_ATTEMPTS";
    error.attemptsRemaining = 0;
    return next(error);
  }
  const submittedHash = hashOtp(code);
  if (submittedHash !== pending.otpHash) {
    const newAttempt = pending.attempts + 1;
    await addAttemptsPending(pending.id);
    const attemptsRemaining = Math.max(0, MAX_OTP_ATTEMPTS - newAttempt);
    if (attemptsRemaining === 0) {
      const error = createHttpError(
        429,
        "Too many incorrect attempts,Please try again later!",
      );
      error.code = "TOO_MANY_VERIFICATION_ATTEMPTS";
      error.attemptsRemaining = 0;
      return next(error);
    }
    const error = createHttpError(
      400,
      "Incorrect verification code .Please try again",
    );
    error.code = "INVALID_VERIFICATION_CODE";
    error.attemptsRemaining = attemptsRemaining;
    return next(error);
  }
  const pendindUser = await createUserFromPending(pending);
  const { password: pw, createdAt, ...userData } = pendindUser;
  return res.status(201).json({
    message: "Register success.Please Login",
    user: userData,
  });
};

export const resendEmailOtp = async (req, res, next) => {
  const { email } = resendVerificationSchema.parse(req.body);

  await cleanExpirePending(); //clean up the expired pending user

  const pending = await getPendingByEmail(email);
  if (!pending) {
    // if user come with mail not registered yet, return
    return next(
      createHttpError(
        404,
        "Registration has expired or does not exist. Please register again.",
        { code: "PENDING_REGISTRATION_NOT_FOUND" },
      ),
    );
  }

  const retryAfterSecond = getOtpCooldownSeconds(pending.lastSentAt); // second between 60 and 1
  if (retryAfterSecond > 0) {
    const error = createHttpError(
      429,
      `Please wait ${retryAfterSecond} seconds to request another code.`,
    );
    ((error.code = "OTP_RESEND_COOLDOWN"),
      (error.retryAfterSecond = retryAfterSecond));
  }

  const otp = generateOtp(); //get new otp
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS); //target 10 minutes

  await updatePendingOtp({ email, otpHash, expiresAt });
  await sendRegistrationOtp(email, otp); //resend to user
  const resendAvailableAt = new Date(Date.now() + 60 * 1000);
  return res.status(200).json({
    success: true,
    code: "VERIFICATION_CODE_RESENT",
    message: "A new verificatioin code has sent to your eamil.",
    expiresAt,
    resendAvailableAt,
  });
};
