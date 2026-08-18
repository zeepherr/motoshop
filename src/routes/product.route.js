import express from "express";

import { getAllBrandAdmin } from "../controllers/brand.controller.js";
import {
  createProduct,
  getAllProduct,
  getProductBy,
  updateProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "./../middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authenticate);
router.get("/all", getAllProduct);
router.get("/all-products", allowRoles("ADMIN"), getAllBrandAdmin);
router.get("/:id", getProductBy);

router.post("/", allowRoles("ADMIN"), createProduct);
router.patch("/:id", allowRoles("ADMIN"), updateProduct);
export default router;
