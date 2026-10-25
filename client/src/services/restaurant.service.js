import api from "./api";

// Fetch all restaurants with optional search/filters
export const getRestaurants = async (params = {}) => {
  const response = await api.get("/restaurants", { params });
  return response.data;
};

// Fetch single restaurant details
export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

// Fetch restaurant menu
export const getRestaurantMenu = async (restaurantId) => {
  const response = await api.get(`/restaurants/${restaurantId}/menu`);
  return response.data;
};

// Fetch current restaurant owner's restaurant
export const getMyRestaurant = async () => {
  const response = await api.get("/restaurants/mine");
  return response.data;
};

// Register a new restaurant (formData or JSON)
export const createRestaurant = async (data) => {
  const response = await api.post("/restaurants", data);
  return response.data;
};

// Update restaurant details
export const updateRestaurant = async (id, data) => {
  const response = await api.put(`/restaurants/${id}`, data);
  return response.data;
};

// Toggle restaurant open/close status
export const toggleRestaurantStatus = async (id) => {
  const response = await api.patch(`/restaurants/${id}/status`);
  return response.data;
};

// Add menu item to restaurant
export const addMenuItem = async (restaurantId, data) => {
  const response = await api.post(`/restaurants/${restaurantId}/menu`, data);
  return response.data;
};

// Update menu item
export const updateMenuItem = async (menuId, data) => {
  const response = await api.patch(`/menu/${menuId}`, data);
  return response.data;
};

// Delete menu item
export const deleteMenuItem = async (menuId) => {
  const response = await api.delete(`/menu/${menuId}`);
  return response.data;
};
