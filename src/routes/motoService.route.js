import express from "express";
import {
  createService,
  deleteService,
  getAllService,
  getAllServiceAdmin,
  getServiceBy,
  updateService,
} from "../controllers/motoService.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { paramId } from "../validations/general.schema.js";

const router = express.Router();
router.use(authenticate);
router.get("/all", getAllService);
router.get("/all-services", allowRoles("ADMIN"), getAllServiceAdmin);
router.get("/:id", validateParams(paramId), getServiceBy);

router.post("/", allowRoles("ADMIN"), createService);
router.patch(
  "/:id",
  validateParams(paramId),
  allowRoles("ADMIN"),
  updateService,
);
router.delete(
  "/:id",
  validateParams(paramId),
  allowRoles("ADMIN"),
  deleteService,
);
export default router;
