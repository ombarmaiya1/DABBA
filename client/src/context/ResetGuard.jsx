import React from 'react';
import { Navigate } from 'react-router-dom';
import { useResetPassword, STEPS } from './ResetPasswordContext';

export function ResetGuard({ requiredStep, children }) {
  const { step, email } = useResetPassword();

  // If trying to access step 2 (verify) or 3 (reset) without an email set
  if (requiredStep > STEPS.FORGOT && !email) {
    return <Navigate to="/forgot-password" replace />;
  }

  // If attempting to jump directly to a step ahead of current progress
  if (step < requiredStep) {
    return <Navigate to="/forgot-password" replace />;
  }

  return children;
}
