import express from "express";
import {
  cancelOrder,
  checkoutOrder,
  completeOrder,
  createOrder,
  getOrderById,
  getPendingOrders,
  updatePeindingOrder,
} from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { allowRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authenticate);
router.post("/", allowRoles("ADMIN", "STAFF"), createOrder);
router.post("/checkout", allowRoles("ADMIN", "STAFF"), checkoutOrder);
router.get("/pending", allowRoles("ADMIN", "STAFF"), getPendingOrders);
router.get("/:id", allowRoles("ADMIN", "STAFF"), getOrderById);
router.patch("/:id", allowRoles("ADMIN", "STAFF"), updatePeindingOrder);
router.post("/:id/complete", allowRoles("ADMIN", "STAFF"), completeOrder);
router.post("/:id/cancel", allowRoles("ADMIN", "STAFF"), cancelOrder);

export default router;
