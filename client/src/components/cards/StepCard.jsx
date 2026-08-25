import React from 'react';

/**
 * StepCard — Numbered step for "How It Works" section.
 * Sharp border, big red step number in Space Mono, uppercase headline.
 */
export default function StepCard({ number, title, description, isLast = false }) {
  return (
    <div
      className={[
        'p-8 sm:p-10',
        'border-b md:border-b-0',
        !isLast ? 'md:border-r' : '',
        'border-on-background',
        'hover:bg-surface-container-high transition-colors duration-200',
      ].join(' ')}
    >
      <span className="font-mono font-bold text-[56px] leading-[1.1] text-primary block mb-6">
        {number}
      </span>
      <h3 className="font-headline font-bold text-[32px] leading-[1.2] mb-4 uppercase text-on-background">
        {title}
      </h3>
      <p className="font-body text-[14px] leading-[1.5] text-secondary">
        {description}
      </p>
    </div>
  );
}
