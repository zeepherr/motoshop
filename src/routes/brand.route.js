import express from "express";
import {
  createBrand,
  deleteBrand,
  getAllBrandAdmin,
  getAllBrandUser,
  getBrandById,
  updateBrand,
  updateBrandStatus,
} from "../controllers/brand.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { motorBrandIdSchema } from "../validations/brand.schema.js";
const router = express.Router();
router.use(authenticate);
router.get("/all", getAllBrandUser);
router.get("/all-brands", allowRoles("ADMIN"), getAllBrandAdmin);
router.get("/:id", validateParams(motorBrandIdSchema), getBrandById);

router.post("/", allowRoles("ADMIN"), createBrand); //finished
router.patch(
  "/:id",
  validateParams(motorBrandIdSchema),
  allowRoles("ADMIN"),
  updateBrand,
); //finished
router.patch("/:id/status", allowRoles("ADMIN"), updateBrandStatus); //finished
router.delete(
  "/:id",
  validateParams(motorBrandIdSchema),
  allowRoles("ADMIN"),
  deleteBrand,
); // finished

export default router;
