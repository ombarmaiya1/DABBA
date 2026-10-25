import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import Restaurant from "../resturants/restaurant.model.js";
import {
  notifyRestaurantNewOrder,
  notifyOrderStatusUpdate,
  notifyRidersNewDelivery,
} from "../socket/socket.js";

// Place a new order from the customer's cart
// POST /orders
export const CreateOrder = async (req, res, next) => {
  try {
    // 1. Get logged-in user's ID
    const userId = req.user._id;
    const { deliveryAddress, paymentMethod = "cod" } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    // 2. Read customer's cart and populate menu items
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    // 3. Validate that cart exists, is not empty, and has a restaurant
    if (!cart || !cart.restaurant || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant || restaurant.isActive === false) {
      return res.status(400).json({ message: "This kitchen is currently deactivated and not accepting orders" });
    }

    // 4. Check that every menu item is available and belongs to the cart's restaurant
    for (const item of cart.items) {
      const menuItem = item.menuItem;

      if (!menuItem) {
        return res.status(400).json({ message: "A menu item in your cart no longer exists" });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }

      if (menuItem.restaurant.toString() !== cart.restaurant.toString()) {
        return res.status(400).json({
          message: `${menuItem.name} does not belong to the selected restaurant`,
        });
      }
    }

    // 5. Calculate total using database prices & prepare item snapshots
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const menuItem = item.menuItem;
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      // 6. Create snapshot of each item's name, price, and quantity
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    // Create the order
    const order = new Order({
      customer: userId,
      restaurant: cart.restaurant,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      status: "placed",
    });

    await order.save();

    // 7. Clear the cart only AFTER order is saved successfully in the database
    const restaurantId = cart.restaurant;
    cart.items = [];
    cart.restaurant = null;
    await cart.save();

    // Populate order details for immediate socket emission & response
    await order.populate([
      { path: "customer", select: "fullName phone email" },
      { path: "restaurant", select: "name address phone" },
    ]);

    // Send real-time notification to the restaurant room via WebSocket
    notifyRestaurantNewOrder(restaurantId.toString(), order);

    // 8. Return created order with HTTP 201 Created
    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while placing order";
    next(error);
  }
};

// Get logged-in customer's order history
// GET /orders
export const GetMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("restaurant", "name address")
      .populate("rider", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching orders";
    next(error);
  }
};

// Get single order details
// GET /orders/:id
export const GetOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("restaurant", "name address owner")
      .populate("customer", "fullName email phone")
      .populate("rider", "fullName phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is customer, assigned rider, restaurant owner, or admin
    const isCustomer = order.customer?._id?.toString() === req.user._id.toString();
    const isRider = order.rider?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === "Admin";
    const isRestaurantOwner = order.restaurant?.owner?.toString() === req.user._id.toString();

    if (!isCustomer && !isRider && !isAdmin && !isRestaurantOwner) {
      return res.status(403).json({ message: "Unauthorized to view this order" });
    }

    return res.status(200).json({
      order,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching order";
    next(error);
  }
};

// Get orders belonging to a restaurant owner's restaurant
// GET /orders/restaurant/orders
export const GetRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant && req.user.userType !== "Admin") {
      return res.status(404).json({ message: "No restaurant found for this account" });
    }

    const filter =
      req.user.userType === "Admin" && req.query.restaurantId
        ? { restaurant: req.query.restaurantId }
        : { restaurant: restaurant._id };

    const orders = await Order.find(filter)
      .populate("customer", "fullName phone email")
      .populate("rider", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching restaurant orders";
    next(error);
  }
};

// Update order status by restaurant owner (placed -> confirmed -> preparing -> out_for_delivery)
// PATCH /orders/:orderId/restaurant-status
export const UpdateRestaurantOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["out_for_delivery", "cancelled"],
    };

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant && req.user.userType !== "Admin") {
      return res.status(403).json({ message: "No restaurant found for this account" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.userType !== "Admin" &&
      order.restaurant.toString() !== restaurant._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    const validNext = allowedTransitions[order.status];
    if (!validNext || !validNext.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from '${order.status}' to '${status}'. Allowed: ${validNext?.join(", ") || "none"}`,
      });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    await order.populate([
      { path: "customer", select: "fullName phone email" },
      { path: "restaurant", select: "name address phone" },
      { path: "rider", select: "fullName phone" },
    ]);

    // Broadcast status update to order room (customer) and restaurant room
    const targetRestaurantId = restaurant?._id || order.restaurant?._id || order.restaurant;
    notifyOrderStatusUpdate(order._id, order, targetRestaurantId);

    // If restaurant accepted the order (transitioned from placed to confirmed),
    // dispatch real-time delivery request to all available riders
    if (previousStatus === "placed" && status === "confirmed") {
      notifyRidersNewDelivery(order);
    }

    return res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while updating restaurant order status";
    next(error);
  }
};

// Get all orders across the entire platform (Admin only)
// GET /orders/admin/all
export const GetAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("restaurant", "name address")
      .populate("customer", "fullName email phone")
      .populate("rider", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = error.message || "Error occurred while fetching all orders";
    next(error);
  }
};
