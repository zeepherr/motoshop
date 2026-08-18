import express from "express";
import {
  createMoto,
  deleteMoto,
  getAllMoto,
  getAllMotoAdmin,
  getMotoBy,
  updateMoto,
} from "../controllers/moto.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { paramId } from "../validations/general.schema.js";
import { allowRoles } from "./../middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authenticate);
router.get("/all", getAllMoto);
router.get("/all-motors", allowRoles("ADMIN"), getAllMotoAdmin);
router.get("/:id", validateParams(paramId), getMotoBy);

router.post("/", allowRoles("ADMIN"), createMoto);
router.patch("/:id", validateParams(paramId), allowRoles("ADMIN"), updateMoto);
router.delete("/:id", validateParams(paramId), allowRoles("ADMIN"), deleteMoto);
export default router;
