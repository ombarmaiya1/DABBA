import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/common/PasswordInput';
import styles from './Auth.module.css';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../../services/auth.service';
import { useResetPassword, STEPS } from '../../context/ResetPasswordContext';

export default function SetNewPassword() {
  const navigate = useNavigate();
  const { setStep } = useResetPassword();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [time] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.password) next.password = 'New password is required';
    else if (form.password.length < 8) next.password = 'Minimum 8 characters';
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your new password';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    resetPassword(form.password)
      .then((res) => {
        toast.success(res?.message || 'Password reset successfully!');
        setStep(STEPS.SUCCESS);
        navigate('/reset-success');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to reset password. Try again.';
        toast.error(msg);
        setErrors((prev) => ({ ...prev, password: msg }));
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
          <p className={styles.brandSubtitle}>New Credentials // KOT-PWD-03</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                Set New Password
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant mt-1">
                Enter your new password
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Set new password form">
            <div className="space-y-6">
              <PasswordInput
                id="password"
                label="New Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                error={errors.password}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                error={errors.confirmPassword}
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
                {isSubmitting ? 'Updating Password…' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
