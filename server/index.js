// CONFIGURATION IMPORTS
import express from "express";
import http from "http";
import { PORT } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./src/socket/socket.js";

// SERVICES IMPORTS
//
//

// ROUTES IMPORTS
import authRoutes from "./src/auth/auth.routes.js";
import userRoutes from "./src/user/user.routes.js";
import restaurantRoutes from "./src/resturants/restaurant.routes.js";
import menuRoutes from "./src/menu/menu.routes.js";
import cartRoutes from "./src/cart/cart.routes.js";
import orderRoutes from "./src/order/order.routes.js";
import riderRoutes from "./src/rider/rider.routes.js";

//********************************************************************************* */

// SERVER CONFIGURATION

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initSocket(server);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
connectDB();

// ROUTES
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/menu", menuRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/rider", riderRoutes);

// DEFAULT ERROR HANDLER
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err.stack);
  res.status(statusCode).json({ message });
});

app.get("/", (req, res) => {
  res.json("Hello World ");
});

server.listen(PORT, () => {
  console.log(`\nServer Started at Port : ${PORT}`);
});

