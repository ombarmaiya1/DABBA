import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';
import { useResetPassword } from '../../context/ResetPasswordContext';

export default function ResetSuccess() {
  const { resetFlow } = useResetPassword();

  const [time] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  return (
    <div className={styles.pageWrapper}>
      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* ── Brand Header ── */}
        <div className={styles.brandHeader}>
          <h1 className={styles.brandName}>DABBA.</h1>
          <p className={styles.brandSubtitle}>Receipt Completed // KOT-FIN-04</p>
        </div>

        {/* ── Ticket Card ── */}
        <div className={styles.ticketCard}>
          <div className="flex justify-between items-end border-b border-dashed border-outline-variant pb-4 mb-6">
            <div>
              <h2 className="font-headline text-[24px] font-bold uppercase tracking-tight text-on-surface">
                Success
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant mt-1">
                Password updated successfully
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="font-mono text-[12px] text-tertiary">
                TIME: <span>{time}</span>
              </span>
            </div>
          </div>

          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-headline text-[20px] font-bold uppercase text-on-surface">
              Password Changed!
            </h3>

            <p className="font-body text-[14px] text-on-surface-variant max-w-[280px]">
              Your password has been reset. You can now log in to your account with your new credentials.
            </p>
          </div>

          <div className="pt-6 border-t border-dashed border-outline-variant mt-6">
            <Link
              to="/login"
              onClick={resetFlow}
              className={[
                'w-full bg-primary text-on-primary',
                'font-headline text-[18px] font-bold uppercase tracking-wider',
                'py-4 text-center block',
                'transition-all duration-150',
                'hover:shadow-[4px_4px_0px_0px_#B35F4E]',
                'active:translate-y-px',
              ].join(' ')}
            >
              Sign In Now <ArrowRight size={18} className="inline ml-1 mb-0.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
