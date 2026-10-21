import Order from "../order/order.model.js";

// 1. List eligible orders for riders
// GET /rider/available-orders or /orders/available-for-delivery
export const GetAvailableDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({
      rider: null,
      status: { $nin: ["delivered", "cancelled"] },
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
    const riderId = req.body.riderId || req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.rider) {
      return res.status(400).json({ message: "Order is already assigned to a rider" });
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
