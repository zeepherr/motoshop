import { prisma } from "../lib/primsa.js";

export const getUser = async (colum, value) => {
  return await prisma.user.findFirst({
    where: {
      [colum]: value,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,

      userMotors: {
        select: {
          motorId: true,

          motor: {
            select: {
              id: true,
              model: true,
              type: true,
              isActive: true,

              motorBrand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      userInfo: {
        select: {
          photoUrl: true,
        },
      },
    },
  });
};

export const createUser = async (userDate) => {
  return await prisma.user.create({ data: userDate.data });
};

export const getUserBy = async (column, value) => {
  return await prisma.user.findFirst({
    where: { [column]: value },
    select: {
      id: true,
      password: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });
};

export const findAllUser = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,

      userMotors: {
        select: {
          motorId: true,

          motor: {
            select: {
              id: true,
              model: true,
              type: true,
              isActive: true,

              motorBrand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      userInfo: {
        select: {
          photoUrl: true,
        },
      },
    },
  });
};

export const findUsersForManagement = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findUserForRoleManagement = async (userId) => {
  return await prisma.user.findFirst({
    where: {
      id: userId,

      role: {
        not: "ADMIN",
      },
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });
};

export const changeUserRole = async (userId, role) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      role,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
};
//for order

export const findMemberForOrder = async (memberId) => {
  return await prisma.user.findUnique({
    where: {
      id: memberId,
      isActive: true,
      role: "MEMBER",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      userMotors: {
        select: { motorId: true },
      },
    },
  });
};
