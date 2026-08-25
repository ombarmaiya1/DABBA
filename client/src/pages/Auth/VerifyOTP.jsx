import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LineInput from '../../components/common/LineInput';
import styles from './Auth.module.css';
import { toast } from 'react-hot-toast';
import { verifyOTP, sendOTP } from '../../services/auth.service';
import { useResetPassword, STEPS } from '../../context/ResetPasswordContext';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { email, setOtpVerified, setStep } = useResetPassword();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [time] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP code is required');
      return;
    }
    if (otp.trim().length < 4) {
      setError('Please enter a valid OTP code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    verifyOTP(email, otp.trim())
      .then((res) => {
        toast.success(res?.message || 'OTP verified successfully!');
        setOtpVerified(true);
        setStep(STEPS.RESET);
        navigate('/reset-password');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Invalid or expired OTP';
        toast.error(msg);
        setError(msg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleResend() {
    setIsResending(true);
    sendOTP(email)
      .then((res) => {
        toast.success(res?.message || 'New OTP sent to your email!');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to resend OTP');
      })
      .finally(() => {
        setIsResending(false);
      });
  }

  return (
    <div className={styles.pageWrapper}>
      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* ── Brand Header ── */}
        <div className={styles.brandHeader}>
          <h1 className={styles.brandName}>DABBA.</h1>
          <p className={styles.brandSubtitle}>OTP Verification // KOT-OTP-02</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                Verify OTP
              </h2>
              <p className="font-body text-[13px] text-on-surface-variant mt-1">
                Sent to: <span className="font-mono text-tertiary font-bold">{email}</span>
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Verify OTP form">
            <div className="space-y-6">
              <LineInput
                id="otp"
                label="Enter Verification Code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (error) setError('');
                }}
                required
                autoComplete="one-time-code"
                error={error}
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
                Didn't receive code?
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-mono text-[11px] uppercase tracking-wider text-tertiary underline hover:text-primary transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            <div className="pt-6 border-t border-dashed border-outline-variant mt-8 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  'w-full bg-primary text-on-primary',
                  'font-headline text-[18px] font-bold uppercase tracking-wider',
                  'py-4',
                  'transition-all duration-150',
                  'hover:shadow-[4px_4px_0px_0px_#B35F4E]',
                  'active:translate-y-px',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none',
                ].join(' ')}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Verifying…' : 'Verify Code'}
              </button>

              <div className="flex justify-center pt-2">
                <Link
                  to="/forgot-password"
                  className="font-mono text-[11px] uppercase tracking-wider text-tertiary underline hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Change Email
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
