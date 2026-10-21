import { Router } from "express";
import { AuthUser } from "../middlewares/auth.middleware.js";
import {
  GetCart,
  AddToCart,
  UpdateCartItemQuantity,
  RemoveCartItem,
  ClearCart,
} from "./cart.controller.js";

const router = Router();

// All cart routes require a logged-in user
router.use(AuthUser);

// 1. Get the customer's cart: GET /cart
router.get("/", GetCart);

// 2. Add an item: POST /cart/items
router.post("/items", AddToCart);

// 3. Update quantity: PATCH /cart/items/:menuItemId
router.patch("/items/:menuItemId", UpdateCartItemQuantity);

// 4. Remove an item: DELETE /cart/items/:menuItemId
router.delete("/items/:menuItemId", RemoveCartItem);

// 5. Clear the cart: DELETE /cart
router.delete("/", ClearCart);

export default router;
