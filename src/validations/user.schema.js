import { z } from "zod";

export const changeUserRoleSchema = z.object({
  role: z.enum(["MEMBER", "STAFF"], {
    message: "Role must be MEMBER or STAFF.",
  }),
});
