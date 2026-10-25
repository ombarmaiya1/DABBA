import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import sendOTPEmail from "../services/email.service.js";
import OTP from "./otp.model.js";
import { JWT_SECRET } from "../config/config.js";

const RegisterUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, userType } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (userType === "Admin") {
      return res.status(400).json({ message: "Admin registration is not allowed" });
    }

    const allowedRoles = ["Customer", "Restaurant", "Rider"];
    const assignedRole = allowedRoles.includes(userType) ? userType : "Customer";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const photoURL = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      photo: {
        url: photoURL,
        publicId: null,
      },
      userType: assignedRole,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while registering user";
    next(error);
  }
};

const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been deactivated by administrator. Please contact support.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 1000,
    });

    return res.status(200).json({
      message: `Login successful`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        photo: user.photo,
        isActive: user.isActive !== false,
        isAvailable: user.isAvailable !== false,
      },
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while logging in";
    next(error);
  }
};

const LogoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logout successful" });
};

const SendOTP = async (req, res, next) => {
  try {
   const { email } = req.body;
   if (!email) {
     return res.status(400).json({ message: "Email is required" });
   }

   const existingUser = await User.findOne({ email });
   if (!existingUser) {
     return res.status(400).json({ message: "User does not exist" });
   }

   const newOTP = Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6);

   const hashedOTP = await bcrypt.hash(newOTP, 10);

   const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      await existingOTP.deleteOne();
    }
    
    const saveOTP = await OTP.create({
      email,
      otp: hashedOTP
    });
   
    sendOTPEmail(email, newOTP);
    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while setting OTP";
    next(error);
  }
};

const VerifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const existingOTP = await OTP.findOne({ email });
    if (!existingOTP) {
      return res.status(400).json({ message: "OTP not found" });
    }

    const isMatch = await bcrypt.compare(otp, existingOTP.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await existingOTP.deleteOne();


    const otpToken = jwt.sign({ email }, process.env.JWT_SECRET || JWT_SECRET, {
      expiresIn: "10m",
    });

    res.cookie("otpToken", otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });

    return res.status(200).json({ message: "OTP verified successfully" });  
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while verifying OTP";
    next(error);
  }
};
const ResetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const {email} = req.user;

    const existingUser = await User.findOne({ email });
   
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while resetting password";
    next(error);
  }
};

export {
  RegisterUser,
  LoginUser,
  LogoutUser,
  SendOTP,
  VerifyOTP,
  ResetPassword,
};
