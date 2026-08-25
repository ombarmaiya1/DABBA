import React from 'react';

/**
 * Button — Brutalist receipt-aesthetic button.
 *
 * Variants:
 *  - primary: Red container, white text, ticket-shadow on hover
 *  - secondary: Bordered, ink text
 *  - ghost: Transparent, uppercase mono text
 *  - inverse: For dark backgrounds
 *
 * All buttons use Space Mono, uppercase, 0px border-radius.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  href,
  className = '',
  ...props
}) {
  const baseStyles = [
    'inline-flex items-center justify-center gap-2',
    'font-mono uppercase tracking-wider',
    'transition-all duration-150 ease-in-out',
    'cursor-pointer select-none',
    'active:scale-95',
  ].join(' ');

  const sizeStyles = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-6 py-2.5 text-[12px]',
    lg: 'px-8 py-4 text-[12px]',
  };

  const variantStyles = {
    primary: [
      'bg-primary-container text-on-primary',
      'hover:-translate-y-0.5 hover:translate-x-0.5',
      'hover:shadow-[8px_8px_0px_var(--color-ink)]',
    ].join(' '),
    secondary: [
      'border border-on-background text-on-surface',
      'hover:text-primary hover:border-primary',
    ].join(' '),
    ghost: [
      'text-on-surface',
      'hover:bg-primary-container/10',
    ].join(' '),
    inverse: [
      'bg-primary text-on-primary',
      'border border-primary',
      'hover:bg-transparent hover:text-primary',
    ].join(' '),
    link: [
      'underline text-on-surface',
      'hover:text-primary',
      'px-0 py-0',
    ].join(' '),
  };

  const classes = [
    baseStyles,
    sizeStyles[size] || sizeStyles.md,
    variantStyles[variant] || variantStyles.primary,
    className,
  ].join(' ');

  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
