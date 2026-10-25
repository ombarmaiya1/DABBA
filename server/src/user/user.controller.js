import User from "./user.model.js";
import Restaurant from "../resturants/restaurant.model.js";

// GET /user/me
// Returns the currently authenticated user
export const GetMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching current user";
    next(error);
  }
};

// GET /user/profile
// Read user profile
export const GetProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching profile";
    next(error);
  }
};

// PUT or PATCH /user/profile
// Update user profile
export const UpdateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, dob, gender, photo, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is changing, verify it's not already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;

    if (photo !== undefined) {
      if (typeof photo === "string") {
        user.photo = { url: photo, publicId: user.photo?.publicId || null };
      } else if (typeof photo === "object" && photo !== null) {
        user.photo = {
          url: photo.url ?? user.photo?.url,
          publicId: photo.publicId ?? user.photo?.publicId ?? null,
        };
      }
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while updating profile";
    next(error);
  }
};

// GET /user/all (Admin only)
// Retrieves registered users sorted by roles, excluding Admins by default
export const GetAllUsers = async (req, res, next) => {
  try {
    const { includeAdmin, role } = req.query;
    const filter = {};

    // Exclude Admin users from registered users list unless explicitly requested
    if (includeAdmin !== "true") {
      filter.userType = { $ne: "Admin" };
    }

    if (role && role !== "all") {
      filter.userType = role;
    }

    // Sort by role (userType) ascending, then by creation date descending
    const users = await User.find(filter)
      .select("-password")
      .sort({ userType: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching users";
    next(error);
  }
};

// GET /user/:id
// Retrieve user by ID (accessible by Admin or user themselves)
export const GetUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.userType !== "Admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching user";
    next(error);
  }
};

// PATCH /user/:id/status (Admin only)
// Activates or deactivates a user
export const ToggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType === "Admin") {
      return res.status(400).json({ message: "Admin users cannot be deactivated" });
    }

    user.isActive = typeof isActive === "boolean" ? isActive : !user.isActive;
    await user.save();

    // If a restaurant owner is deactivated, also mark their restaurant inactive & closed
    if (user.userType === "Restaurant" && !user.isActive) {
      await Restaurant.updateMany({ owner: user._id }, { isActive: false, isOpen: false });
    }

    return res.status(200).json({
      success: true,
      message: `User "${user.fullName}" is now ${user.isActive ? "active" : "deactivated"}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating user status";
    next(error);
  }
};

