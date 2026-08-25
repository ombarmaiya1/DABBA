import React from 'react';

/**
 * StatItem — Single stat metric display.
 * Big mono number on top, small uppercase label below.
 */
export default function StatItem({ value, label }) {
  return (
    <div className="px-4 text-center md:text-left">
      <p className="font-mono font-bold text-[32px] leading-[1.2] text-on-background">
        {value}
      </p>
      <p className="font-mono text-[10px] uppercase text-secondary tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
