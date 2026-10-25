import { Server } from "socket.io";

// Store last known location for each order in memory
const orderLocations = new Map();
let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    // Restaurant joins their dedicated kitchen room
    socket.on("join-restaurant", (restaurantId) => {
      if (!restaurantId) return;
      const room = `restaurant-${restaurantId}`;
      socket.join(room);
    });

    // Restaurant leaves their kitchen room
    socket.on("leave-restaurant", (restaurantId) => {
      if (!restaurantId) return;
      const room = `restaurant-${restaurantId}`;
      socket.leave(room);
    });

    // Customer or Rider joins an order room
    socket.on("join-order", (orderId) => {
      if (!orderId) return;
      const room = orderId.toString();
      socket.join(room);

      // If rider has already reported location, send it immediately
      const lastLocation = orderLocations.get(room);
      if (lastLocation) {
        socket.emit("rider-location", lastLocation);
      }
    });

    // Rider sends live location update
    socket.on("update-location", ({ orderId, latitude, longitude }) => {
      if (!orderId || latitude === undefined || longitude === undefined) {
        return;
      }

      const locationData = {
        orderId,
        latitude,
        longitude,
        updatedAt: new Date(),
      };

      // Save last known location
      orderLocations.set(orderId.toString(), locationData);

      // Broadcast location to everyone in that order room (customer)
      ioInstance.to(orderId.toString()).emit("rider-location", locationData);
    });

    // Riders join the pool room for real-time delivery dispatches
    socket.on("join-riders", () => {
      socket.join("riders-pool");
    });

    // Riders leave the pool room
    socket.on("leave-riders", () => {
      socket.leave("riders-pool");
    });

    // Rider stops location sharing for an order (e.g. upon delivery)
    socket.on("stop-location", ({ orderId }) => {
      if (!orderId) return;
      const room = orderId.toString();
      orderLocations.delete(room);
      ioInstance.to(room).emit("rider-location-stopped", { orderId: room, reason: "delivered" });
    });

    // Leave order room
    socket.on("leave-order", (orderId) => {
      if (!orderId) return;
      socket.leave(orderId.toString());
    });

    socket.on("disconnect", () => {});
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

/**
 * Clear in-memory rider location and notify customer map that live tracking has ended
 */
export const stopOrderLocationTracking = (orderId) => {
  if (!orderId) return;
  const room = orderId.toString();
  orderLocations.delete(room);
  if (ioInstance) {
    ioInstance.to(room).emit("rider-location-stopped", { orderId: room, reason: "delivered" });
  }
};

/**
 * Broadcast real-time notification to the restaurant when a customer places an order
 */
export const notifyRestaurantNewOrder = (restaurantId, order) => {
  if (ioInstance && restaurantId) {
    const room = `restaurant-${restaurantId}`;
    ioInstance.to(room).emit("new-order", order);
  }
};

/**
 * Broadcast real-time order status updates (e.g., confirmed, preparing, out_for_delivery, delivered)
 */
export const notifyOrderStatusUpdate = (orderId, order, restaurantId) => {
  if (ioInstance) {
    if (orderId) {
      const room = orderId.toString();
      ioInstance.to(room).emit("order-status-update", order);

      // If order is delivered or cancelled, automatically terminate live location broadcast
      if (order.status === "delivered" || order.status === "cancelled") {
        stopOrderLocationTracking(orderId);
      }
    }
    if (restaurantId) {
      ioInstance.to(`restaurant-${restaurantId}`).emit("order-status-update", order);
    }
  }
};

/**
 * Broadcast to riders pool when restaurant accepts an order and it becomes available for delivery
 */
export const notifyRidersNewDelivery = (order) => {
  if (ioInstance) {
    ioInstance.to("riders-pool").emit("delivery-available", order);
  }
};

/**
 * Broadcast to riders pool when an order has been claimed by a rider
 */
export const notifyRiderOrderClaimed = (orderId) => {
  if (ioInstance) {
    ioInstance.to("riders-pool").emit("order-claimed", { orderId: orderId.toString() });
  }
};

