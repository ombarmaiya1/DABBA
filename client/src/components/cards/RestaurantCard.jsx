import React from 'react';

/**
 * RestaurantCard — Restaurant listing card.
 * Food image on top, rating badge overlay, name, cuisine type, delivery time + price.
 * ticket-shadow + hover translate effect matching the Stitch design.
 */
export default function RestaurantCard({
  name,
  cuisine,
  rating,
  deliveryTime,
  priceForTwo,
  image,
  imageAlt,
}) {
  return (
    <article
      className="group bg-background border border-on-background transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 ticket-shadow"
      aria-label={`${name} restaurant`}
    >
      {/* Image */}
      <div className="h-48 w-full border-b border-on-background overflow-hidden relative">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white border border-on-background px-2 py-1 font-mono font-bold text-[12px]">
          {rating} ★
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h4 className="font-headline font-bold text-[20px] leading-[1.2] mb-1 text-on-background">
          {name}
        </h4>
        <p className="text-secondary font-mono text-[10px] uppercase tracking-wider mb-4">
          {cuisine}
        </p>

        {/* Delivery + Price */}
        <div className="border-t border-dashed border-outline pt-4 flex justify-between items-center">
          <span className="font-mono font-bold text-[12px] text-on-background">
            {deliveryTime}
          </span>
          <span className="font-mono font-bold text-[12px] text-on-background">
            {priceForTwo}
          </span>
        </div>
      </div>
    </article>
  );
}
