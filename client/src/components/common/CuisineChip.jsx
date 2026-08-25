import React from 'react';

/**
 * CuisineChip — Rectangular filter chip with active state.
 * Active: red border + red dot prefix.
 * Inactive: ink border, no dot.
 * All sharp corners, Space Mono uppercase.
 */
export default function CuisineChip({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-6 py-2 font-mono text-[12px] uppercase tracking-wider',
        'flex items-center gap-2 transition-all',
        active
          ? 'border border-primary text-on-surface hover:bg-primary hover:text-white'
          : 'border border-on-background text-on-surface hover:border-primary',
      ].join(' ')}
      aria-pressed={active}
    >
      {active && (
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  );
}
