import api from "./api";

// Create order from customer's cart
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// Get current customer's order history
export const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// Get single order details
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Get orders belonging to the restaurant owner's kitchen
export const getRestaurantOrders = async () => {
  const response = await api.get("/orders/restaurant/orders");
  return response.data;
};

// Update order preparation status by restaurant owner
export const updateRestaurantOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/restaurant-status`, { status });
  return response.data;
};

// Admin: Get all orders on the platform
export const getAllOrdersAdmin = async () => {
  const response = await api.get("/orders/admin/all");
  return response.data;
};

// Admin: Get all users on the platform
export const getAllUsersAdmin = async () => {
  const response = await api.get("/user/all");
  return response.data;
};

// Admin: Toggle user activation status
export const toggleUserStatusAdmin = async (userId, isActive) => {
  const response = await api.patch(`/user/${userId}/status`, { isActive });
  return response.data;
};

// Admin: Toggle kitchen activation status on platform
export const toggleRestaurantActivationAdmin = async (restaurantId, isActive) => {
  const response = await api.patch(`/restaurants/${restaurantId}/activation`, { isActive });
  return response.data;
};

