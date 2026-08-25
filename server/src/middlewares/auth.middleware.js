import jwt from "jsonwebtoken";

export const AuthOTP = async (req, res, next) => {
    try {
        const otpToken = req.cookies.otpToken;
        console.log(otpToken)
        if (!otpToken) {
            return res.status(400).json({ message: "OTP Expired" });
        }
        
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
        const email = decoded.email;
        console.log(email)
        req.user = { email };
        console.log(req.user)
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired OTP token" });
    }
}