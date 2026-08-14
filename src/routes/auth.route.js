import express from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth/auth.controller.js";
import {
  resendEmailOtp,
  verifyRegistrationEmail,
} from "../controllers/auth/email.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/register/verify", verifyRegistrationEmail);
router.post("/register/resend", resendEmailOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", getMe);

export default router;
