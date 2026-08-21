import { findAllUser } from "../services/user.service.js";

export const getAlluser = async (req, res, next) => {
  const users = await findAllUser();
  if (users.length === 0) {
    return res.status(200).json({
      message: "No users found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all  users",
    data: users,
  });
};
