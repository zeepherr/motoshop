import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import {
  createAuthSession,
  findSessionbyRefreshToken,
  revokeSession,
  savePendingRegistration,
} from "../../services/auth/auth.service.js";
import { getUserBy } from "../../services/auth/user.service.js";
import { refreshCookieOptions } from "../../utils/cookie.util.js";
import {
  hashValidMailDomain,
  sendRegistrationOtp,
} from "../../utils/email.util.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "../../utils/jwt.util.js";
import { generateOtp, hashOtp } from "../../utils/otp.util.js";
import { loginSchema, registerSchema } from "../../validations/auth.schema.js";

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

  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 1000 ->1s , 60s -> 1m , final 10 m

  const passwordHash = await bcrypt.hash(password, 10); //hash password

  const pending = await savePendingRegistration({
    email,
    firstName,
    lastName,
    otpHash,
    expiresAt: otpExpires,
    passwordHash,
  });

  const resendAvailableAt = new Date(
    new Date(pending.lastSentAt).getTime() + 60 * 1000,
  );
  await sendRegistrationOtp(email, otp); //send otp by mail

  return res.status(202).json({
    statu: "pending",
    code: "EMAIL_VERIFICATION_REQUIRED",
    email: pending.email,
    expiresAt: pending.expiresAt,
    resendAvailableAt,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = loginSchema.parse(req.body); //validation

  const haveUser = await getUserBy("email", email); //check existing email
  if (!haveUser)
    return next(createHttpError(401, "Invalid username or password"));

  const hashed = await bcrypt.compare(password, haveUser.password);
  if (!hashed)
    return next(createHttpError(401, "Invalid username or password."));

  const token = await createAccessToken(haveUser);
  const refreshtoken = await createRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshtoken);
  await createAuthSession(haveUser, refreshTokenHash);
  res.cookie("refreshToken", refreshtoken, refreshCookieOptions);
  res.status(200).json({
    message: "Login Successful",
    token,
    user: {
      id: haveUser.id,
      email: haveUser.email,
      role: haveUser.role,
    },
  });
};

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken; // get cookie form req
  if (!refreshToken)
    return next(createHttpError(401, "Refresh token is missing"));
  const tokenHash = await hashRefreshToken(refreshToken); //hase received refreshtoken
  const session = await findSessionbyRefreshToken(tokenHash);

  if (!session) return next(createHttpError(401, "Invalid session"));

  if (session.revokedAt) {
    return next(createHttpError(401, "Session has been revoked")); //logout already
  }
  if (session.expiresAt < new Date()) {
    //session exprires more than 7 days
    return next(createHttpError(401, "Session has expired"));
  }
  if (!session.user.isActive) {
    return next(createHttpError(403, "Account is inactive"));
  }
  const accessToken = await createAccessToken(session.user);
  const { password, isActive, createdAt, updatedAt, ...userData } =
    session.user;
  return res.status(200).json({
    accessToken,
    user: userData,
  });
};

export const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const tokenHash = await hashRefreshToken(refreshToken);
    await revokeSession();
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/v1/auth",
  });
  res.status(200).json({
    message: "Logout Sccessfully",
  });
};

export const getMe = async (req, res, next) => {
  const userData = req.user;
  res.status(200).json({
    message: "Get user details",
    user: {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
  });
};
