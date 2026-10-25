import { Router } from "express";
import { AuthUser, AuthorizeRoles } from "../middlewares/auth.middleware.js";
import {
  CreateOrder,
  GetMyOrders,
  GetOrderById,
  GetRestaurantOrders,
  UpdateRestaurantOrderStatus,
  GetAllOrdersAdmin,
} from "./order.controller.js";
import {
  GetAvailableDeliveries,
  AssignRider,
  GetMyDeliveries,
  UpdateDeliveryStatus,
} from "../rider/rider.controller.js";

const router = Router();

// All order routes require authentication
router.use(AuthUser);

// Admin-only: GET /orders/admin/all
router.get("/admin/all", AuthorizeRoles("Admin"), GetAllOrdersAdmin);

// Restaurant owner routes (Must be defined before /:id)
// 1. Get restaurant orders: GET /orders/restaurant/orders
router.get("/restaurant/orders", AuthorizeRoles("Restaurant", "Admin"), GetRestaurantOrders);

// 2. Update status: PATCH /orders/:orderId/restaurant-status
router.patch("/:orderId/restaurant-status", AuthorizeRoles("Restaurant", "Admin"), UpdateRestaurantOrderStatus);

// Rider routes (Must be defined before /:id)
// 1. List eligible orders for riders: GET /orders/available-for-delivery
router.get("/available-for-delivery", AuthorizeRoles("Rider", "Admin"), GetAvailableDeliveries);

// 3. Rider views assigned orders: GET /orders/my-deliveries
router.get("/my-deliveries", AuthorizeRoles("Rider", "Admin"), GetMyDeliveries);

// 2. Assign a rider: PATCH /orders/:orderId/assign-rider
router.patch("/:orderId/assign-rider", AuthorizeRoles("Rider", "Admin"), AssignRider);

// 4. Rider updates delivery status: PATCH /orders/:orderId/delivery-status
router.patch("/:orderId/delivery-status", AuthorizeRoles("Rider", "Admin"), UpdateDeliveryStatus);

// Customer routes
// Place a new order: POST /orders
router.post("/", CreateOrder);

// Customer views their own orders: GET /orders
router.get("/", GetMyOrders);

// Get single order details: GET /orders/:id
router.get("/:id", GetOrderById);

export default router;
