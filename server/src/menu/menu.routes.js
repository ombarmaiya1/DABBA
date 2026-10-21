import { Router } from "express";
import { AuthUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  AddMenuItem,
  GetRestaurantMenu,
  UpdateMenuItem,
  DeleteMenuItem,
} from "./menu.controller.js";

const router = Router();

// 3. Update a menu item
router.patch("/:menuId", AuthUser, upload.single("image"), UpdateMenuItem);

// 4. Delete a menu item
router.delete("/:menuId", AuthUser, DeleteMenuItem);

// Also supports /menu/:restaurantId
router.post("/:restaurantId", AuthUser, upload.single("image"), AddMenuItem);
router.get("/:restaurantId", GetRestaurantMenu);

export default router;
