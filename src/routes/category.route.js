import express from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { paramId } from "../validations/general.schema.js";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getAllCategoryAdmin,
  getCategoryById,
  updateCatgory,
} from "./../controllers/category.controller.js";
const router = express.Router();
router.use(authenticate);
router.get("/all", getAllCategory);
router.get("/all-categories", allowRoles("ADMIN"), getAllCategoryAdmin);
router.get("/:id", validateParams(paramId), getCategoryById);

router.post("/", allowRoles("ADMIN"), createCategory); //finished
router.patch(
  "/:id",
  validateParams(paramId),
  allowRoles("ADMIN"),
  updateCatgory,
); //finished
router.delete(
  "/:id",
  validateParams(paramId),
  allowRoles("ADMIN"),
  deleteCategory,
); // finished

export default router;
