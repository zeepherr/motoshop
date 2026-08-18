import express from "express";
import {
  createBrand,
  deleteBrand,
  getAllBrandAdmin,
  getAllBrands,
  getBrandById,
  updateBrand,
} from "../controllers/brand.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { paramId } from "../validations/general.schema.js";
const router = express.Router();
router.use(authenticate);
router.get("/all", getAllBrands);
router.get("/all-brands", allowRoles("ADMIN"), getAllBrandAdmin);
router.get("/:id", validateParams(paramId), getBrandById);

router.post("/", allowRoles("ADMIN"), createBrand); //finished
router.patch("/:id", validateParams(paramId), allowRoles("ADMIN"), updateBrand); //finished
router.delete(
  "/:id",
  validateParams(paramId),
  allowRoles("ADMIN"),
  deleteBrand,
); // finished

export default router;
