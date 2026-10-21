import { Server } from "socket.io";

// Store last known location for each order in memory
const orderLocations = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Customer or Rider joins an order room
    socket.on("join-order", (orderId) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined order room: ${orderId}`);

      // If rider has already reported location, send it immediately
      const lastLocation = orderLocations.get(orderId);
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
      orderLocations.set(orderId, locationData);

      // Broadcast location to everyone in that order room (customer)
      io.to(orderId).emit("rider-location", locationData);
    });

    // Leave order room
    socket.on("leave-order", (orderId) => {
      socket.leave(orderId);
      console.log(`Socket ${socket.id} left order room: ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
