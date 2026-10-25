import api from "./api";

// Get user cart
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

// Add item to cart
export const addToCart = async (menuItemId, quantity = 1) => {
  const response = await api.post("/cart/items", { menuItemId, quantity });
  return response.data;
};

// Update item quantity
export const updateCartItem = async (menuItemId, quantity) => {
  const response = await api.patch(`/cart/items/${menuItemId}`, { quantity });
  return response.data;
};

// Remove single item
export const removeCartItem = async (menuItemId) => {
  const response = await api.delete(`/cart/items/${menuItemId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};
