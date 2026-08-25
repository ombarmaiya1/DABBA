import api from "./api";

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const sendOTP = async (email) => {
  try {
    const response = await api.post("/auth/send-otp", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const resetPassword = async (password) => {
  try {

    const response = await api.post("/auth/reset-password", {password});

    return response.data;
  } catch (error) {
    throw error;
  }
}