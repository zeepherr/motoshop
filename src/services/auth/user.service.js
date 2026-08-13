import { prisma } from "../../lib/primsa.js";

export const getUserBy = async (colum, value) => {
  return await prisma.user.findFirst({
    where: { [colum]: value },
  });
};

export const createUser = async (userDate) => {
  return await prisma.user.create({ data: userDate.data });
};
