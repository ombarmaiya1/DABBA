import jwt from "jsonwebtoken";
import User from "../user/user.model.js";
import { JWT_SECRET } from "../config/config.js";

export const AuthOTP = async (req, res, next) => {
    try {
        const otpToken = req.cookies.otpToken;
        console.log(otpToken)
        if (!otpToken) {
            return res.status(400).json({ message: "OTP Expired" });
        }
        
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET || JWT_SECRET);
        const email = decoded.email;
        console.log(email)
        req.user = { email };
        console.log(req.user)
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired OTP token" });
    }
}

export const AuthUser = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export const AuthorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        if (!allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({
                message: `Forbidden: Access denied. Required role(s): ${allowedRoles.join(", ")}`,
            });
        }

        next();
    };
};



