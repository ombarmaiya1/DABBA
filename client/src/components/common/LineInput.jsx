import React from 'react';

/**
 * LineInput — Receipt-style text input with bottom-border only.
 * Space Mono label floated above, thin border activates red on focus.
 * Used on transactional/auth screens (Register, Login, etc).
 */
export default function LineInput({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  autoComplete,
  error = '',
}) {
  return (
    <div className="relative w-full">
      <label
        htmlFor={id}
        className="block mb-1 font-mono text-[12px] uppercase tracking-wider text-[#006EB1]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={[
          'w-full bg-transparent',
          'border-0 border-b font-mono text-[16px] text-on-surface',
          'pb-2 pt-1 px-0',
          'focus:outline-none focus:ring-0',
          'placeholder:text-on-surface-variant/50 placeholder:font-mono placeholder:text-[14px]',
          'transition-colors duration-200',
          error
            ? 'border-error focus:border-error'
            : 'border-outline focus:border-primary-container',
          error ? 'border-b-2' : 'border-b focus:border-b-2',
        ].join(' ')}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
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
