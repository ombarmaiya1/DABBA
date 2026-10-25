import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    userType: {
      type: String,
      enum: ["Admin", "Customer", "Rider", "Restaurant"],
      required: true,
      default: "Customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", UserSchema);

export default User;