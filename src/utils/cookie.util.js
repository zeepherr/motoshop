import { config } from "../config/index.js";
export const refreshCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  secure: config.node_env === "production",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 1000,
};
