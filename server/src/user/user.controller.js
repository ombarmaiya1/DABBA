import User from "./user.model.js";

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
// Example role-protected endpoint to get all registered users
export const GetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
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
