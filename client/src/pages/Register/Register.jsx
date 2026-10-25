import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LineInput from '../../components/common/LineInput';
import PasswordInput from '../../components/common/PasswordInput';
import styles from './Register.module.css';
import { toast } from 'react-hot-toast';
import { register } from '../../services/auth.service';

/* ─────────────────────────────────────────────
   Account type tab options from the Stitch design
   ───────────────────────────────────────────── */
const ACCOUNT_TYPES = ['Customer', 'Rider', 'Restaurant'];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'Customer'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Live clock for receipt aesthetic */
  const [time] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  /* ── Field change handler ── */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  /* ── Client-side validation ── */
  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 8)
      next.password = 'Minimum 8 characters';
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match';
    return next;
  }

  /* ── Submit handler ── */
  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      userType: form.userType,
    })
      .then((res) => {
        toast.success(res.message || 'Account created successfully! Please sign in.');
        const redirectTarget = searchParams.get('redirect');
        if (redirectTarget) {
          navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        } else {
          navigate('/login');
        }
      })
      .catch((err) => {
        const backendMessage = err.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(backendMessage);
        
        if (backendMessage.toLowerCase().includes('already exists')) {
          setErrors((prev) => ({ ...prev, email: backendMessage }));
        }
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
          <p className={styles.brandSubtitle}>Registration Form</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>

          {/* Card header: title + live time */}
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                New Account
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant mt-1">
                Order food from restaurants near you
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          {/* ── Account Type Selector ── */}
          <div className="mb-8" role="group" aria-labelledby="account-type-label">
            <span
              id="account-type-label"
              className="block mb-2 font-mono text-[12px] uppercase tracking-wider text-[#006EB1]"
            >
              Account Type:
            </span>
            <div className="flex gap-2">
              {ACCOUNT_TYPES.map((type) => {
                const isActive = form.userType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, userType: type }))}
                    aria-pressed={isActive}
                    className={[
                      'flex-1 font-mono text-[11px] uppercase tracking-wider py-2',
                      'border transition-colors duration-150',
                      isActive
                        ? 'bg-on-surface text-on-primary border-on-surface'
                        : 'bg-transparent text-on-surface border-outline hover:bg-surface-container',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Registration Form ── */}
          <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
            <div className="space-y-6">

              <LineInput
                id="fullName"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
                error={errors.fullName}
              />

              <LineInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                error={errors.email}
              />

              <LineInput
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                error={errors.phone}
              />

              <PasswordInput
                id="password"
                label="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                error={errors.password}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                error={errors.confirmPassword}
              />
            </div>

            {/* ── Footer: sign-in link + submit ── */}
            <div className="pt-6 border-t border-dashed border-outline-variant mt-8">
              {/* Already have account */}
              <div className="flex mb-4">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-tertiary underline hover:text-primary transition-colors font-bold inline-flex items-center gap-0.5"
                  >
                    Sign In <ArrowRight size={10} />
                  </Link>
                </p>
              </div>

              {/* Submit CTA */}
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
                {isSubmitting ? 'Creating Account…' : 'Create Account'}
              </button>

              {/* Legal disclaimer */}
              <p className="font-mono text-[10px] text-on-surface-variant mt-4 text-center leading-relaxed uppercase tracking-wider">
                By creating an account, you agree to our{' '}
                <br />
                <Link
                  to="/terms"
                  className="text-tertiary underline hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  to="/privacy"
                  className="text-tertiary underline hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
