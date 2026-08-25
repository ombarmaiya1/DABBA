import React, { createContext, useContext, useState } from 'react';

const ResetPasswordContext = createContext();

export const STEPS = {
  FORGOT: 1,
  VERIFY: 2,
  RESET: 3,
  SUCCESS: 4,
};

export function ResetPasswordProvider({ children }) {
  const [email, setEmail] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [step, setStep] = useState(STEPS.FORGOT);

  const resetFlow = () => {
    setEmail('');
    setOtpVerified(false);
    setStep(STEPS.FORGOT);
  };

  return (
    <ResetPasswordContext.Provider
      value={{
        email,
        setEmail,
        otpVerified,
        setOtpVerified,
        step,
        setStep,
        resetFlow,
      }}
    >
      {children}
    </ResetPasswordContext.Provider>
  );
}

export function useResetPassword() {
  const context = useContext(ResetPasswordContext);
  if (!context) {
    throw new Error('useResetPassword must be used within a ResetPasswordProvider');
  }
  return context;
}
