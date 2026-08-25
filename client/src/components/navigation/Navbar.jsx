import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Navbar — Fixed top navigation bar.
 * Brutalist receipt aesthetic: sharp edges, Space Mono labels, DABBA logo with red dot.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 w-full z-50 border-b border-on-background bg-background h-20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="font-headline text-[28px] sm:text-[32px] font-black text-on-background tracking-tight"
          aria-label="DABBA home"
        >
          DABBA<span className="text-primary">.</span>
        </Link>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/register"
            className="font-mono text-[12px] uppercase tracking-wider px-4 py-2 text-on-surface hover:bg-primary-container/10 transition-all"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-primary-container text-on-primary px-6 py-2 font-mono text-[12px] uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          > 
          Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-on-surface hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-on-background">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              to="/register"
              className="font-mono text-[12px] uppercase tracking-wider px-4 py-2.5 text-on-surface border border-on-background text-center hover:border-primary transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-primary-container text-on-primary px-6 py-2.5 font-mono text-[12px] uppercase tracking-wider text-center transition-all active:scale-95"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
