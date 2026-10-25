import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, LogOut, User, ChefHat, Bike, ShieldCheck, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getHomeRoute } from '../auth/RouteGuards';

/**
 * Navbar — Fixed top navigation bar.
 * Enforces role-specific navigation according to DABBA user journey:
 * - Guest: Home, Browse Kitchens, Login, Register
 * - Customer: Home, Browse Kitchens, Cart, My Orders, Profile, Logout
 * - Restaurant: Restaurant Dashboard, Orders, Menu Management, Profile, Logout
 * - Rider: My Deliveries, Profile, Logout
 * - Admin: Admin Dashboard, Users, Kitchens, Orders, Profile, Logout
 */
export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      toast.error('Logout error. Please try again.');
    }
  };

  return (
    <nav
      className="fixed top-0 w-full z-50 border-b-2 border-on-background bg-background h-20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link
          to={isAuthenticated ? getHomeRoute(user) : "/"}
          className="font-headline text-[28px] sm:text-[32px] font-black text-on-background tracking-tight flex items-center gap-1.5"
          aria-label="DABBA home"
        >
          DABBA<span className="text-primary">.</span>
        </Link>

        {/* Desktop Nav Links (Role-Specific) */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
          {/* Public / Guest / Customer Common Link */}
          <Link
            to="/restaurants"
            className="text-on-surface hover:text-primary transition-colors font-bold"
          >
            Kitchens
          </Link>

          {/* Customer Specific Links */}
          {isAuthenticated && user?.userType === 'Customer' && (
            <>
              <Link
                to="/cart"
                className="text-on-surface hover:text-primary transition-colors flex items-center gap-1 font-bold"
              >
                <ShoppingBag size={14} /> Dabba Cart
              </Link>
              <Link
                to="/orders"
                className="text-on-surface hover:text-primary transition-colors font-bold"
              >
                My Orders
              </Link>
            </>
          )}

          {/* Restaurant Owner Specific Links */}
          {isAuthenticated && user?.userType === 'Restaurant' && (
            <>
              <Link
                to="/restaurant/dashboard"
                className="text-primary hover:bg-primary/10 border border-primary px-2.5 py-1 transition-all font-bold flex items-center gap-1"
              >
                <ChefHat size={14} /> Kitchen Hub
              </Link>
              <Link
                to="/restaurant/dashboard?tab=orders"
                className="text-on-surface hover:text-primary transition-colors font-bold"
              >
                Live Orders
              </Link>
              <Link
                to="/restaurant/dashboard?tab=menu"
                className="text-on-surface hover:text-primary transition-colors font-bold"
              >
                Menu Items
              </Link>
            </>
          )}

          {/* Rider Specific Links */}
          {isAuthenticated && user?.userType === 'Rider' && (
            <Link
              to="/rider"
              className="text-primary hover:bg-primary/10 border border-primary px-2.5 py-1 transition-all font-bold flex items-center gap-1"
            >
              <Bike size={14} /> Delivery Hub
            </Link>
          )}

          {/* Admin Specific Links */}
          {isAuthenticated && user?.userType === 'Admin' && (
            <Link
              to="/admin"
              className="text-primary hover:bg-primary/10 border border-primary px-2.5 py-1 transition-all font-bold flex items-center gap-1"
            >
              <ShieldCheck size={14} /> Admin Console
            </Link>
          )}
        </div>

        {/* Desktop Auth / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Profile Badge Link */}
              <Link
                to="/profile"
                className="flex items-center gap-2 border border-on-background bg-surface-container-low px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider hover:border-primary transition-colors"
              >
                <User size={13} className="text-primary" />
                <span className="font-bold max-w-[120px] truncate">{user.fullName}</span>
                <span className="text-[9px] bg-primary text-on-primary px-1.5 py-0.2 font-bold ml-1">
                  {user.userType}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="border border-outline hover:border-primary text-on-surface hover:text-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1 font-bold"
                aria-label="Logout"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="font-mono text-[12px] uppercase tracking-wider px-3.5 py-2 text-on-surface hover:bg-primary-container/10 transition-all font-bold"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="bg-primary text-on-primary px-5 py-2 font-mono text-[12px] uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 font-bold"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="lg:hidden p-2 text-on-surface hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b-2 border-on-background px-4 py-6 flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
          <Link
            to="/restaurants"
            className="py-2 text-on-surface border-b border-outline-variant/30 font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Kitchens
          </Link>

          {/* Customer Mobile Links */}
          {isAuthenticated && user?.userType === 'Customer' && (
            <>
              <Link
                to="/cart"
                className="py-2 text-on-surface border-b border-outline-variant/30 font-bold flex items-center gap-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag size={14} /> My Dabba Cart
              </Link>
              <Link
                to="/orders"
                className="py-2 text-on-surface border-b border-outline-variant/30 font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            </>
          )}

          {/* Restaurant Mobile Links */}
          {isAuthenticated && user?.userType === 'Restaurant' && (
            <Link
              to="/restaurant/dashboard"
              className="py-2 text-primary border-b border-outline-variant/30 font-bold flex items-center gap-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ChefHat size={14} /> Kitchen Dashboard
            </Link>
          )}

          {/* Rider Mobile Links */}
          {isAuthenticated && user?.userType === 'Rider' && (
            <Link
              to="/rider"
              className="py-2 text-primary border-b border-outline-variant/30 font-bold flex items-center gap-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bike size={14} /> Rider Console
            </Link>
          )}

          {/* Admin Mobile Links */}
          {isAuthenticated && user?.userType === 'Admin' && (
            <Link
              to="/admin"
              className="py-2 text-primary border-b border-outline-variant/30 font-bold flex items-center gap-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={14} /> Admin Console
            </Link>
          )}

          {/* Auth links on mobile */}
          {isAuthenticated ? (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/profile"
                className="py-2 border border-on-background text-center font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile ({user.fullName} • {user.userType})
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-primary text-on-primary font-bold uppercase flex items-center justify-center gap-1"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                to="/register"
                className="flex-1 py-2 text-center border border-on-background font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="flex-1 py-2 text-center bg-primary text-on-primary font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
