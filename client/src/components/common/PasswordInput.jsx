import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput — LineInput variant with eye toggle for password visibility.
 * Same receipt-style bottom-border aesthetic as LineInput.
 */
export default function PasswordInput({
  id,
  label,
  placeholder = '••••••••',
  value,
  onChange,
  required = false,
  autoComplete,
  error = '',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <label
        htmlFor={id}
        className="block mb-1 font-mono text-[12px] uppercase tracking-wider text-[#006EB1]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={[
            'w-full bg-transparent pr-10',
            'border-0 border-b font-mono text-[16px] text-on-surface',
            'pb-2 pt-1 px-0',
            'focus:outline-none focus:ring-0',
            'placeholder:text-on-surface-variant/50 placeholder:font-mono placeholder:text-[14px]',
            'transition-colors duration-200',
            error
              ? 'border-b-2 border-error focus:border-error'
              : 'border-b border-outline focus:border-b-2 focus:border-primary-container',
          ].join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors"
          tabIndex={0}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 font-mono text-[10px] uppercase tracking-wider text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
