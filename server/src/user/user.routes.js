import { Router } from "express";
import { AuthUser, AuthorizeRoles } from "../middlewares/auth.middleware.js";
import {
  GetMe,
  GetProfile,
  UpdateProfile,
  GetAllUsers,
  GetUserById,
} from "./user.controller.js";

const router = Router();

// Retrieve logged-in user
router.get("/me", AuthUser, GetMe);

// User profile read and update
router.get("/profile", AuthUser, GetProfile);
router.put("/profile", AuthUser, UpdateProfile);
router.patch("/profile", AuthUser, UpdateProfile);

// Role-based authorization: Admin-only route
router.get("/all", AuthUser, AuthorizeRoles("Admin"), GetAllUsers);

// Retrieve user by id (Admin or self)
router.get("/:id", AuthUser, GetUserById);

export default router;
