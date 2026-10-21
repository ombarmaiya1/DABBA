import { Router } from "express";
import { AuthUser, AuthorizeRoles } from "../middlewares/auth.middleware.js";
import {
  GetAvailableDeliveries,
  AssignRider,
  GetMyDeliveries,
  UpdateDeliveryStatus,
} from "./rider.controller.js";

const router = Router();

// All rider routes require Rider or Admin role
router.use(AuthUser, AuthorizeRoles("Rider", "Admin"));

// 1. List available orders for delivery: GET /rider/available-orders
router.get("/available-orders", GetAvailableDeliveries);
router.get("/available-for-delivery", GetAvailableDeliveries);

// 2. Rider views their assigned orders: GET /rider/my-deliveries
router.get("/my-deliveries", GetMyDeliveries);

// 3. Assign a rider: PATCH /rider/orders/:orderId/assign
router.patch("/orders/:orderId/assign", AssignRider);
router.patch("/orders/:orderId/assign-rider", AssignRider);

// 4. Update delivery status: PATCH /rider/orders/:orderId/status
router.patch("/orders/:orderId/status", UpdateDeliveryStatus);
router.patch("/orders/:orderId/delivery-status", UpdateDeliveryStatus);

export default router;
