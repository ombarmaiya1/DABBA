import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/navigation/Navbar';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/LandingPage/LandingPage';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyOTP from './pages/Auth/VerifyOTP';
import SetNewPassword from './pages/Auth/SetNewPassword';
import ResetSuccess from './pages/Auth/ResetSuccess';

// Connected Feature Pages
import RestaurantsPage from './pages/Restaurants/RestaurantsPage';
import RestaurantDetailPage from './pages/Restaurants/RestaurantDetailPage';
import CartPage from './pages/Cart/CartPage';
import OrdersListPage from './pages/Orders/OrdersListPage';
import OrderReceipt from './pages/Receipt/OrderReceipt';
import ProfilePage from './pages/Profile/ProfilePage';
import RestaurantDashboardPage from './pages/RestaurantAdmin/RestaurantDashboardPage';
import RiderDashboardPage from './pages/Rider/RiderDashboardPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

// Auth and Route Guards
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestOnlyRoute, RoleProtectedRoute } from './components/auth/RouteGuards';
import { ResetPasswordProvider, STEPS } from './context/ResetPasswordContext';
import { ResetGuard } from './context/ResetGuard';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-background flex flex-col">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="flex-1 pt-20">
          <ResetPasswordProvider>
            <Routes>
              {/* 1. Landing Page (Guest-only) & Public Discovery Routes */}
              <Route
                path="/"
                element={
                  <GuestOnlyRoute>
                    <LandingPage />
                  </GuestOnlyRoute>
                }
              />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

              {/* 2. Guest-Only Routes — Redirects authenticated users to their role portal */}
              <Route
                path="/register"
                element={
                  <GuestOnlyRoute>
                    <Register />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <GuestOnlyRoute>
                    <Login />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestOnlyRoute>
                    <ForgotPassword />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <GuestOnlyRoute>
                    <ResetGuard requiredStep={STEPS.VERIFY}>
                      <VerifyOTP />
                    </ResetGuard>
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestOnlyRoute>
                    <ResetGuard requiredStep={STEPS.RESET}>
                      <SetNewPassword />
                    </ResetGuard>
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/reset-success"
                element={
                  <GuestOnlyRoute>
                    <ResetGuard requiredStep={STEPS.SUCCESS}>
                      <ResetSuccess />
                    </ResetGuard>
                  </GuestOnlyRoute>
                }
              />

              {/* 3. Customer / Protected Routes — Requires logged-in user */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipt/:id"
                element={
                  <ProtectedRoute>
                    <OrderReceipt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipt"
                element={<Navigate to="/orders" replace />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 4. Role Protected Routes */}
              {/* Restaurant Owner Dashboard & Menu/Orders Management */}
              <Route
                path="/restaurant/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['Restaurant', 'Admin']}>
                    <RestaurantDashboardPage />
                  </RoleProtectedRoute>
                }
              />

              {/* Rider Delivery Hub */}
              <Route
                path="/rider"
                element={
                  <RoleProtectedRoute allowedRoles={['Rider', 'Admin']}>
                    <RiderDashboardPage />
                  </RoleProtectedRoute>
                }
              />

              {/* Admin Root Console */}
              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboardPage />
                  </RoleProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ResetPasswordProvider>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}