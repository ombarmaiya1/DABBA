import Order from "../order/order.model.js";
import User from "../user/user.model.js";
import { notifyOrderStatusUpdate, notifyRiderOrderClaimed } from "../socket/socket.js";

// 1. List eligible orders for riders
// GET /rider/available-orders or /orders/available-for-delivery
export const GetAvailableDeliveries = async (req, res, next) => {
  try {
    // Only return orders that have been accepted/confirmed by the restaurant
    // Orders with status: "placed" are awaiting kitchen acceptance and not yet dispatchable to riders
    const orders = await Order.find({
      rider: null,
      status: { $in: ["confirmed", "preparing", "out_for_delivery"] },
    })
      .populate("restaurant", "name address phone")
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching available orders";
    next(error);
  }
};

// 2. Assign a rider to an order
// PATCH /rider/orders/:orderId/assign or /orders/:orderId/assign-rider
export const AssignRider = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    // Derive riderId from authenticated user unless Admin
    const riderId = req.user.userType === "Admin" && req.body.riderId ? req.body.riderId : req.user._id;

    // Check if the rider is open for delivery
    if (req.user.userType === "Rider") {
      const riderUser = await User.findById(req.user._id);
      if (riderUser && riderUser.isAvailable === false) {
        return res.status(400).json({
          message: "You are currently closed for delivery. Please set your status to Open to accept orders.",
        });
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.rider) {
      return res.status(400).json({ message: "Order is already assigned to a rider" });
    }

    // Guard: Customer orders must be accepted by the kitchen first
    if (order.status === "placed") {
      return res.status(400).json({
        message: "This order has not been accepted by the restaurant yet. Delivery pickup will become available once the kitchen accepts the order.",
      });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({ message: `Cannot assign rider to a ${order.status} order` });
    }

    order.rider = riderId;
    await order.save();
    await order.populate([
      { path: "restaurant", select: "name address phone" },
      { path: "customer", select: "fullName phone" },
      { path: "rider", select: "fullName phone" },
    ]);

    notifyOrderStatusUpdate(order._id, order, order.restaurant?._id || order.restaurant);
    notifyRiderOrderClaimed(order._id);

    return res.status(200).json({
      message: "Rider assigned successfully",
      order,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while assigning rider";
    next(error);
  }
};

// 3. Rider views their assigned orders
// GET /rider/my-deliveries or /orders/my-deliveries
export const GetMyDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ rider: req.user._id })
      .populate("restaurant", "name address phone")
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching your deliveries";
    next(error);
  }
};

// 4. Rider updates delivery status
// PATCH /rider/orders/:orderId/status or /orders/:orderId/delivery-status
export const UpdateDeliveryStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["out_for_delivery", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Valid status required: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({ message: `Cannot update a ${order.status} order` });
    }

    // Verify assigned rider or admin
    if (
      order.rider?.toString() !== req.user._id.toString() &&
      req.user.userType !== "Admin"
    ) {
      return res.status(403).json({ message: "You are not assigned to this delivery" });
    }

    order.status = status;

    // If delivered and payment was COD, update paymentStatus to paid
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save();
    await order.populate([
      { path: "restaurant", select: "name address phone" },
      { path: "customer", select: "fullName phone" },
      { path: "rider", select: "fullName phone" },
    ]);

    notifyOrderStatusUpdate(order._id, order, order.restaurant?._id || order.restaurant);

    return res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating delivery status";
    next(error);
  }
};

// 5. Rider gets their availability status
// GET /rider/availability
export const GetRiderAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("isAvailable isActive fullName");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      isAvailable: user.isAvailable !== false,
      isActive: user.isActive !== false,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching rider availability";
    next(error);
  }
};

// 6. Rider toggles open/closed for delivery
// PATCH /rider/availability
export const ToggleRiderAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Cannot update delivery status. Your account has been deactivated by administrator.",
      });
    }

    const { isAvailable } = req.body;
    user.isAvailable = typeof isAvailable === "boolean" ? isAvailable : !user.isAvailable;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `You are now ${user.isAvailable ? "open for delivery (Online)" : "closed for delivery (Offline)"}`,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating rider delivery status";
    next(error);
  }
};

