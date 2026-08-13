import { prisma } from "../../lib/primsa.js";
export const savePendingRegistration = async (data) => {
  //using upsert if existing user -> update data , if not --> create new
  return prisma.pendingRegistration.upsert({
    where: { email: data.email },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      otpHash: data.otpHash,
      expiresAt: data.expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    create: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      otpHash: data.otpHash,
      expiresAt: data.expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
  });
};
