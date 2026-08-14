import express from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = express.Router();
router.use(authenticate);
// router.get("/me", getMyInFo);
// router.patch("/me", updateMe);  
// router.patch("/me/info", updateMyInfo);  

export default router;
