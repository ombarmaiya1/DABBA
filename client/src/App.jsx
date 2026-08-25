import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage/LandingPage';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyOTP from './pages/Auth/VerifyOTP';
import SetNewPassword from './pages/Auth/SetNewPassword';
import ResetSuccess from './pages/Auth/ResetSuccess';
import { ResetPasswordProvider, STEPS } from './context/ResetPasswordContext';
import { ResetGuard } from './context/ResetGuard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <main className="flex-1 pt-20">
        <ResetPasswordProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/verify-otp"
              element={
                <ResetGuard requiredStep={STEPS.VERIFY}>
                  <VerifyOTP />
                </ResetGuard>
              }
            />
            <Route
              path="/reset-password"
              element={
                <ResetGuard requiredStep={STEPS.RESET}>
                  <SetNewPassword />
                </ResetGuard>
              }
            />
            <Route
              path="/reset-success"
              element={
                <ResetGuard requiredStep={STEPS.SUCCESS}>
                  <ResetSuccess />
                </ResetGuard>
              }
            />
          </Routes>
        </ResetPasswordProvider>
      </main>
      <Footer />
    </div>
  );
}