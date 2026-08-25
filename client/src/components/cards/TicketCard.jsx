import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * TicketCard — Hero receipt/KOT ticket card.
 * White background, solid ink border, ticket-shadow.
 * Tear-off zigzag bottom edge via .tear-off CSS class.
 * Dashed dividers between sections.
 * Delivery route visualization at bottom.
 */
export default function TicketCard({ orderId, time, status, items }) {
  return (
    <div className="w-full max-w-[380px] bg-white border border-on-background p-8 ticket-shadow tear-off">
      {/* Header — Order ID + Time */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-secondary">
            Order ID
          </p>
          <p className="font-mono font-bold text-[14px] text-on-background mt-0.5">
            {orderId}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-secondary">
            Time
          </p>
          <p className="font-mono font-bold text-[14px] text-on-background mt-0.5">
            {time}
          </p>
        </div>
      </div>

      {/* Dashed Divider */}
      <div className="border-t border-dashed border-outline my-4" aria-hidden="true" />

      {/* Line Items */}
      <div className="space-y-3 mb-6" role="list" aria-label="Order items">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center"
            role="listitem"
          >
            <span className="font-body text-[14px] leading-[1.5] text-on-background">
              {item.name}
            </span>
            <span className="font-mono font-bold text-[14px] text-on-background">
              {item.price}
            </span>
          </div>
        ))}
      </div>

      {/* Dashed Divider */}
      <div className="border-t border-dashed border-outline my-4" aria-hidden="true" />

      {/* Status + Delivery Route */}
      <div className="py-4">
        {/* Status Badge */}
        <div className="flex items-center mb-4">
          <span className="font-mono text-[11px] uppercase tracking-wider bg-primary-container text-on-primary px-2 py-1">
            {status}
          </span>
        </div>

        {/* Delivery Route Visualization */}
        <div className="relative h-24 flex items-center" aria-label="Delivery route from kitchen to you">
          {/* Start dot — Kitchen */}
          <div
            className="absolute left-0 w-3 h-3 bg-on-background"
            aria-hidden="true"
          />
          {/* End dot — You */}
          <div
            className="absolute right-0 w-3 h-3 bg-primary"
            aria-hidden="true"
          />

          {/* Dashed route line */}
          <div className="w-full h-px border-t border-dashed border-on-background relative">
            {/* Delivery icon on the route */}
            <div className="absolute top-1/2 left-2/3 -translate-y-1/2 bg-white border border-on-background p-1">
              <MapPin size={14} className="text-on-background" aria-hidden="true" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute left-0 -bottom-4 font-mono text-[10px] uppercase text-on-background">
            Kitchen
          </div>
          <div className="absolute right-0 -bottom-4 font-mono text-[10px] uppercase text-primary">
            You
          </div>
        </div>
      </div>
    </div>
  );
}
