import { Router } from "express";
import { AuthUser, AuthorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  CreateRestaurant,
  GetRestaurants,
  GetSingleRestaurant,
  UpdateRestaurant,
  ToggleOpenStatus,
} from "./restaurant.controller.js";
import {
  AddMenuItem,
  GetRestaurantMenu,
} from "../menu/menu.controller.js";

const router = Router();

// Step 2: Create restaurant (with image upload)
router.post(
  "/",
  AuthUser,
  AuthorizeRoles("Restaurant", "Admin"),
  upload.single("image"),
  CreateRestaurant
);

// Step 3: Get all restaurants (Public)
router.get("/", GetRestaurants);

// Step 4: Get single restaurant (Public)
router.get("/:id", GetSingleRestaurant);

// Step 5: Update restaurant (with optional image upload)
router.put(
  "/:id",
  AuthUser,
  upload.single("image"),
  UpdateRestaurant
);

// Step 6: Open / close restaurant (Only Owner)
router.patch("/:id/status", AuthUser, ToggleOpenStatus);

// Menu endpoints:
// 1. Add menu item: POST /restaurants/:restaurantId/menu
router.post(
  "/:restaurantId/menu",
  AuthUser,
  upload.single("image"),
  AddMenuItem
);

// 2. Get restaurant menu: GET /restaurants/:restaurantId/menu
router.get("/:restaurantId/menu", GetRestaurantMenu);

export default router;
