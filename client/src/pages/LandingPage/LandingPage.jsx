import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import Button from '../../components/buttons/Button';
import TicketCard from '../../components/cards/TicketCard';
import StatItem from '../../components/common/StatItem';
import CuisineChip from '../../components/common/CuisineChip';
import StepCard from '../../components/cards/StepCard';
import RestaurantCard from '../../components/cards/RestaurantCard';
import Testimonial from '../../components/common/Testimonial';

import {
  STATS,
  CUISINE_CHIPS,
  HOW_IT_WORKS_STEPS,
  RESTAURANTS,
  HERO_TICKET,
  TESTIMONIAL,
} from '../../constants/data';
// Navbar is now handled in App.jsx
/* ────────────────────────────────────────────
   Framer Motion variants
   ──────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ────────────────────────────────────────────
   LandingPage
   ──────────────────────────────────────────── */
export default function LandingPage() {
  const [activeChip, setActiveChip] = useState('North Indian');

  return (
    <div className="min-h-screen bg-background text-on-background font-body">

      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        aria-labelledby="hero-headline"
      >
        {/* Left — Headline + CTA */}
        <motion.div
          className="flex flex-col gap-6"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span
            variants={fadeInUp}
            className="font-mono text-[12px] uppercase tracking-wider text-primary"
          >
            Timed like a dabbawala
          </motion.span>

          <motion.h1
            id="hero-headline"
            variants={fadeInUp}
            className="font-headline font-black text-[40px] sm:text-[56px] leading-[1.1] tracking-[-0.02em] text-on-background"
          >
            Every order,{' '}
            <span className="text-primary">on time.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="font-body text-[18px] leading-[1.6] text-secondary max-w-md"
          >
            Precision-engineered logistics for the modern appetite. We don&rsquo;t just
            deliver food; we deliver punctuality.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-4 mt-2 items-center"
          >
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-8 py-4 font-mono text-[12px] uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[8px_8px_0px_var(--color-ink)] active:scale-95"
            >
              Order now <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="font-mono text-[12px] uppercase tracking-wider px-6 py-3 border border-on-background text-on-surface hover:text-primary hover:border-primary transition-all"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        {/* Right — Ticket Card */}
        <motion.div
          className="relative flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <TicketCard
            orderId={HERO_TICKET.orderId}
            time={HERO_TICKET.time}
            status={HERO_TICKET.status}
            items={HERO_TICKET.items}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
          ══════════════════════════════════════ */}
      <section
        className="border-y border-on-background bg-surface-container-low overflow-hidden"
        aria-label="Key metrics"
      >
        <motion.div
          className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-on-background h-24 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <StatItem value={stat.value} label={stat.label} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CUISINE CHIPS
          ══════════════════════════════════════ */}
      <section
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-12"
        aria-label="Cuisine filter"
      >
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          role="group"
          aria-label="Filter by cuisine"
        >
          {CUISINE_CHIPS.map((chip) => (
            <motion.div key={chip.label} variants={fadeInUp}>
              <CuisineChip
                label={chip.label}
                active={activeChip === chip.label}
                onClick={() => setActiveChip(chip.label)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-20"
        aria-labelledby="how-it-works-heading"
      >
        {/* Visually hidden heading for accessibility */}
        <h2 id="how-it-works-heading" className="sr-only">
          How it works
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 border border-on-background"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <motion.div key={step.number} variants={fadeInUp}>
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
                isLast={idx === HOW_IT_WORKS_STEPS.length - 1}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          TOP RESTAURANTS
          ══════════════════════════════════════ */}
      <section
        className="bg-surface-container py-24"
        aria-labelledby="restaurants-heading"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            className="flex justify-between items-end mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <h2
              id="restaurants-heading"
              className="font-headline font-bold text-[32px] leading-[1.2] uppercase text-on-background"
            >
              Top Restaurants
            </h2>
            <Link
              to="/restaurants"
              className="font-mono text-[12px] uppercase tracking-wider underline text-on-surface hover:text-primary transition-colors"
            >
              View all
            </Link>
          </motion.div>

          {/* Restaurant Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {RESTAURANTS.map((restaurant) => (
              <motion.div key={restaurant.id} variants={fadeInUp}>
                <RestaurantCard
                  name={restaurant.name}
                  cuisine={restaurant.cuisine}
                  rating={restaurant.rating}
                  deliveryTime={restaurant.deliveryTime}
                  priceForTwo={restaurant.priceForTwo}
                  image={restaurant.image}
                  imageAlt={restaurant.imageAlt}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PARTNER STRIP
          ══════════════════════════════════════ */}
      <section
        className="bg-inverse-surface py-12"
        aria-labelledby="partner-heading"
      >
        <motion.div
          className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeInUp}
        >
          <h3
            id="partner-heading"
            className="font-headline font-bold text-[24px] uppercase tracking-tight text-inverse-on-surface leading-snug"
          >
            Ready to feed more people?{' '}
            <br className="hidden md:block" />
            Partner with us.
          </h3>
          <Link
            to="/register"
            className="bg-primary text-on-primary px-10 py-4 font-mono text-[12px] uppercase tracking-widest border border-primary hover:bg-transparent hover:text-primary transition-all active:scale-95 whitespace-nowrap inline-block text-center"
          >
            Join the network
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIAL
          ══════════════════════════════════════ */}
      <section
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-24 flex justify-center"
        aria-labelledby="testimonial-heading"
      >
        <h2 id="testimonial-heading" className="sr-only">
          Customer testimonial
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeInUp}
          className="w-full flex justify-center"
        >
          <Testimonial
            quote={TESTIMONIAL.quote}
            customerName={TESTIMONIAL.customerName}
            customerLabel={TESTIMONIAL.customerLabel}
            verifiedLabel={TESTIMONIAL.verifiedLabel}
            verifiedTime={TESTIMONIAL.verifiedTime}
          />
        </motion.div>
      </section>
    </div>
  );
}
