import {
  changeUserRole,
  findUserForRoleManagement,
  findUsersForManagement,
} from "../services/user.service.js";
import { paramId } from "../validations/general.schema.js";
import { changeUserRoleSchema } from "../validations/user.schema.js";

export const getAlluser = async (req, res, next) => {
  const users = await findUsersForManagement();
  res.status(200).json({
    success: true,
    message: "Get all  users",
    data: users,
  });
};

export const updateUserRole = async (req, res, next) => {
  const { id: userId } = paramId.parse(req.params);

  const data = changeUserRoleSchema.parse(req.body);

  const user = await findUserForRoleManagement(userId);

  if (!user) {
    return next(
      createHttpError(404, "User does not exist or cannot be managed."),
    );
  }

  if (user.role === data.role) {
    return next(createHttpError(409, `User is already ${data.role}.`));
  }

  const updatedUser = await changeUserRole(userId, data.role);

  res.status(200).json({
    success: true,
    message: `User role changed from ${user.role} to ${data.role}.`,
    data: updatedUser,
  });
};
