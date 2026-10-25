import api from "./api";

// List orders available for riders to pick up
export const getAvailableOrders = async () => {
  const response = await api.get("/rider/available-orders");
  return response.data;
};

// Rider accepts / assigns order to themselves
export const assignRider = async (orderId) => {
  const response = await api.patch(`/rider/orders/${orderId}/assign`);
  return response.data;
};

// View orders assigned to logged-in rider
export const getMyDeliveries = async () => {
  const response = await api.get("/rider/my-deliveries");
  return response.data;
};

// Update delivery status (out_for_delivery, delivered)
export const updateDeliveryStatus = async (orderId, status) => {
  const response = await api.patch(`/rider/orders/${orderId}/status`, { status });
  return response.data;
};

// Get rider delivery availability status (open/closed for delivery)
export const getRiderAvailability = async () => {
  const response = await api.get("/rider/availability");
  return response.data;
};

// Toggle rider delivery availability status (open/closed for delivery)
export const toggleRiderAvailability = async (isAvailable) => {
  const payload = typeof isAvailable === "boolean" ? { isAvailable } : {};
  const response = await api.patch("/rider/availability", payload);
  return response.data;
};

