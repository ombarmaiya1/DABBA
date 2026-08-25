import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LineInput from '../../components/common/LineInput';
import PasswordInput from '../../components/common/PasswordInput';
import styles from './Login.module.css';
import { toast } from 'react-hot-toast';
import { login } from '../../services/auth.service';

/* ─────────────────────────────────────────────
   Login Page
   Matches the Stitch "Dabba Register" design aesthetic
   (Receipt/KOT theme) applied to the Login flow.
   ───────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  /* ── Client-side validation ── */
  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email address is required';
    if (!form.password) next.password = 'Password is required';
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
    
    login({ email: form.email, password: form.password })
      .then((res) => {
        toast.success(res.message || 'Logged in successfully!');
        // Placeholder navigation to dashboard or home
        navigate('/');
      })
      .catch((err) => {
        // Axios stores the backend's 400 response in err.response.data
        const backendMessage = err.response?.data?.message || 'Login failed. Please try again.';
        
        toast.error(backendMessage);
        
        // Associate specific errors with fields if possible
        if (backendMessage.toLowerCase().includes('password')) {
          setErrors((prev) => ({ ...prev, password: backendMessage }));
        } else if (backendMessage.toLowerCase().includes('user') || backendMessage.toLowerCase().includes('email')) {
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
          <p className={styles.brandSubtitle}>Authentication // KOT-LOG-01</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>

          {/* Card header: title + live time */}
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                Sign In
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant mt-1">
                Access your account
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          {/* ── Login Form ── */}
          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            <div className="space-y-6">

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

              <PasswordInput
                id="password"
                label="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                error={errors.password}
              />

              {/* Forgot Password & Remember Me */}
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 border border-outline bg-transparent group-hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={form.rememberMe}
                      onChange={handleChange}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    {form.rememberMe && (
                      <div className="w-2 h-2 bg-primary"></div>
                    )}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Remember me
                  </span>
                </label>
                
                <Link
                  to="/forgot-password"
                  className="font-mono text-[11px] uppercase tracking-wider text-tertiary underline hover:text-primary transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

            </div>

            {/* ── Footer: register link + submit ── */}
            <div className="pt-6 border-t border-dashed border-outline-variant mt-8 space-y-4">
              
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
                {isSubmitting ? 'Authenticating…' : 'Sign In'}
              </button>
              
              {/* Social Login Placeholder */}
              <button
                type="button"
                className={[
                  'w-full bg-transparent text-on-surface border border-outline',
                  'font-mono text-[12px] uppercase tracking-wider',
                  'py-3',
                  'transition-all duration-150 hover:bg-surface-container',
                  'flex items-center justify-center gap-3',
                ].join(' ')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Don't have an account */}
              <div className="flex justify-center pt-2">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-tertiary underline hover:text-primary transition-colors font-bold inline-flex items-center gap-0.5"
                  >
                    Register <ArrowRight size={10} />
                  </Link>
                </p>
              </div>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
