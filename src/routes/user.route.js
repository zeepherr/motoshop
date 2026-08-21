import express from "express";
import { getAlluser } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authenticate);
router.get("/all-users", allowRoles("ADMIN"), getAlluser);

// router.get("/me", getMyInFo);
// router.patch("/me", updateMe);
// router.patch("/me/info", updateMyInfo);

export default router;
