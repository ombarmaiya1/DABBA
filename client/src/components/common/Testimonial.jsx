import React from 'react';
import { Quote } from 'lucide-react';

/**
 * Testimonial — Dashed-border quote card with customer info.
 * Matches the Stitch design: dashed border container, offset quote icon box,
 * Hanken Grotesk quote text, Space Mono metadata.
 */
export default function Testimonial({ quote, customerName, customerLabel, verifiedLabel, verifiedTime }) {
  return (
    <div className="max-w-xl w-full bg-surface-container-low border border-dashed border-outline p-8 sm:p-10 relative">
      {/* Quote Icon Box */}
      <div
        className="absolute -top-4 -left-4 w-8 h-8 bg-background border border-on-background flex items-center justify-center"
        aria-hidden="true"
      >
        <Quote size={16} className="text-primary" />
      </div>

      {/* Quote Text */}
      <blockquote className="font-headline text-[20px] sm:text-[24px] mb-8 leading-snug text-on-background">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Customer Info */}
      <div className="flex justify-between items-end border-t border-dashed border-outline pt-6">
        <div>
          <p className="font-mono text-[12px] uppercase text-secondary tracking-wider">
            {customerLabel}
          </p>
          <p className="font-mono font-bold text-[14px] text-on-background">
            {customerName}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[12px] uppercase text-secondary tracking-wider">
            {verifiedLabel}
          </p>
          <p className="font-mono font-bold text-[14px] text-on-background">
            {verifiedTime}
          </p>
        </div>
      </div>
    </div>
  );
}
