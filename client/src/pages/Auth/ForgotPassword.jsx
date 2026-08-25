import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import LineInput from '../../components/common/LineInput';
import styles from './Auth.module.css';
import { toast } from 'react-hot-toast';
import { sendOTP } from '../../services/auth.service';
import { useResetPassword, STEPS } from '../../context/ResetPasswordContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { email: savedEmail, setEmail, setStep } = useResetPassword();

  const [inputEmail, setInputEmail] = useState(savedEmail || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [time] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail)) {
      setError('Enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    sendOTP(inputEmail)
      .then((res) => {
        toast.success(res?.message || 'OTP sent to your email!');
        setEmail(inputEmail);
        setStep(STEPS.VERIFY);
        navigate('/verify-otp');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
        toast.error(msg);
        setError(msg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className={styles.pageWrapper}>
      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* ── Brand Header ── */}
        <div className={styles.brandHeader}>
          <h1 className={styles.brandName}>DABBA.</h1>
          <p className={styles.brandSubtitle}>Password Recovery // KOT-FGT-01</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                Forgot Password
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant mt-1">
                Enter your email to receive OTP
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Forgot password form">
            <div className="space-y-6">
              <LineInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={inputEmail}
                onChange={(e) => {
                  setInputEmail(e.target.value);
                  if (error) setError('');
                }}
                required
                autoComplete="email"
                error={error}
              />
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
                {isSubmitting ? 'Sending OTP…' : 'Send OTP'}
              </button>

              <div className="flex justify-center pt-2">
                <Link
                  to="/login"
                  className="font-mono text-[11px] uppercase tracking-wider text-tertiary underline hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Back to Sign In
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
