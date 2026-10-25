import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ArrowLeft,
  Printer,
  MapPin,
  User,
  ChefHat,
  Bike,
  PackageCheck,
  CheckCircle2,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { getOrderById } from '../../services/order.service';
import toast from 'react-hot-toast';
import LiveDeliveryMap from '../../components/delivery/LiveDeliveryMap';

export default function OrderReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate('/orders', { replace: true });
      return;
    }

    setLoading(true);
    setError(null);
    getOrderById(id)
      .then((res) => {
        if (res?.order) {
          setOrder(res.order);
        } else {
          setError('Order details could not be retrieved.');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load order receipt';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Connect to WebSocket for live rider location
  useEffect(() => {
    if (!id || !order) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    socket.emit('join-order', id);

    socket.on('rider-location', (loc) => {
      setRiderLocation(loc);
    });

    socket.on('rider-location-stopped', () => {
      setRiderLocation((prev) => (prev ? { ...prev, stopped: true } : null));
      toast('Rider has completed delivery! Live GPS tracking closed.', { icon: '🏁' });
    });

    socket.on('order-status-update', (updated) => {
      if (updated && (updated._id === id || updated._id?.toString() === id?.toString())) {
        setOrder((prev) => ({ ...prev, ...updated }));
        toast.success(`Order status updated to: ${updated.status.replace(/_/g, ' ')}`);
      }
    });

    return () => {
      socket.emit('leave-order', id);
      socket.disconnect();
    };
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center font-mono text-xs uppercase text-secondary">
        Printing KOT digital receipt...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-[460px] w-full bg-surface-container-lowest border-2 border-on-background p-8 ticket-shadow text-center">
          <AlertCircle size={36} className="mx-auto text-primary mb-3" />
          <h2 className="font-headline font-bold text-2xl uppercase">Receipt Unavailable</h2>
          <p className="font-body text-xs text-secondary mt-2">
            {error || 'The requested order could not be found or you are not authorized to view it.'}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/orders"
              className="bg-primary text-on-primary px-6 py-2.5 font-mono text-xs uppercase font-bold"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    order.totalAmount;
  const taxes = 50;
  const finalTotal = subtotal + taxes;
  const orderNum = order._id.slice(-4).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full max-w-[660px] flex justify-between items-center mb-6 print:hidden">
        <Link
          to="/orders"
          className="flex items-center text-primary font-mono text-xs uppercase tracking-wider hover:opacity-80 transition-opacity font-bold"
        >
          <ArrowLeft size={16} className="mr-1" />
          My Orders
        </Link>

        <div className="flex items-center gap-2.5">
          <a
            href="#live-map"
            className="flex items-center gap-1.5 bg-primary/10 border border-primary px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors font-bold"
          >
            <Navigation size={13} className="text-primary" />
            Live Map
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-surface-container-high border border-outline px-3 py-1 font-mono text-xs uppercase tracking-wider text-on-surface hover:bg-surface-container-highest transition-colors font-bold"
          >
            <Printer size={14} />
            Print Ticket
          </button>
        </div>
      </div>

      {/* Live Map Section (Interactive Leaflet Delivery Radar) */}
      <div id="live-map" className="w-full max-w-[660px] print:hidden">
        <LiveDeliveryMap order={order} riderLocation={riderLocation} />
      </div>

      {/* The Printable Receipt Ticket */}
      <div className="w-full max-w-[660px] bg-surface-container-lowest border-2 border-on-background ticket-shadow tear-off relative flex flex-col mb-10">
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 border-b border-dashed border-outline-variant bg-surface-bright">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-tertiary mb-1">
                Kitchen Order Ticket (KOT)
              </p>
              <h2 className="font-headline text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
                #{orderNum}
              </h2>
              <p className="font-mono text-xs text-secondary mt-1">
                From: {order.restaurant?.name || 'Partner Kitchen'}
              </p>
            </div>

            <div className="text-right">
              <p className="font-mono text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Status
              </p>
              <span className="font-mono text-sm font-bold uppercase text-primary border border-primary px-2.5 py-0.5 bg-surface-container-low">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Customer & Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                <User size={12} /> Customer
              </p>
              <p className="font-body text-base font-bold text-on-surface">
                {order.customer?.fullName || 'Valued Customer'}
              </p>
              {order.customer?.phone && (
                <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                  {order.customer.phone}
                </p>
              )}
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                <MapPin size={12} /> Destination
              </p>
              <p className="font-body text-xs text-on-surface leading-relaxed">
                {order.deliveryAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Live Rider Location Tracker (WebSocket) */}
        {order.status === 'out_for_delivery' && (
          <div className="p-4 bg-primary/10 border-b border-dashed border-primary flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span className="font-bold text-primary uppercase flex items-center gap-1">
                <Navigation size={13} /> Rider Live GPS Tracking
              </span>
            </div>

            <div className="text-right font-mono text-[11px] text-on-surface">
              {riderLocation ? (
                <a href="#live-map" className="text-primary font-bold underline hover:opacity-80">
                  Tracking Live • View Map Above ↑
                </a>
              ) : (
                <span className="text-secondary italic">Connecting to rider GPS...</span>
              )}
            </div>
          </div>
        )}

        {/* Fulfillment Status Stepper */}
        <div className="p-6 border-b border-dashed border-outline-variant bg-surface-container-lowest">
          <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant mb-4 text-center">
            Order Fulfillment Progress
          </p>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Step 1: Placed */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary bg-primary text-on-primary flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-on-surface mt-1.5">
                Placed
              </span>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 border-2 ${
                  ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-low text-outline-variant'
                } flex items-center justify-center`}
              >
                <ChefHat size={16} />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-primary mt-1.5">
                Preparing
              </span>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 border-2 ${
                  ['out_for_delivery', 'delivered'].includes(order.status)
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-low text-outline-variant'
                } flex items-center justify-center`}
              >
                <Bike size={16} />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-on-surface mt-1.5">
                On Way
              </span>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 border-2 ${
                  order.status === 'delivered'
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-low text-outline-variant'
                } flex items-center justify-center`}
              >
                <PackageCheck size={16} />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant mt-1.5">
                Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div className="p-6 sm:p-8 bg-surface-container-lowest">
          <p className="font-mono text-xs uppercase tracking-widest text-tertiary mb-4 border-b border-outline pb-2 font-bold">
            Dish Items
          </p>

          <ul className="space-y-4">
            {order.items?.map((item, index) => (
              <li key={index} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="font-mono text-xs font-bold text-primary border border-primary w-6 h-6 flex items-center justify-center bg-surface-container-low shrink-0 mt-0.5">
                    {item.quantity}
                  </div>
                  <div>
                    <h3 className="font-body text-base font-bold text-on-surface uppercase">
                      {item.name}
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-on-surface">
                  ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals Summary */}
        <div className="px-6 sm:px-8 pb-6 bg-surface-container-lowest">
          <div className="border-t-2 border-outline-variant pt-4 flex flex-col gap-2 items-end">
            <div className="flex justify-between w-full max-w-[220px]">
              <span className="font-mono text-xs uppercase text-on-surface-variant">Subtotal</span>
              <span className="font-mono text-xs font-bold text-on-surface">₹{subtotal}</span>
            </div>

            <div className="flex justify-between w-full max-w-[220px]">
              <span className="font-mono text-xs uppercase text-on-surface-variant">Packaging & Taxes</span>
              <span className="font-mono text-xs font-bold text-on-surface">₹{taxes}</span>
            </div>

            <div className="flex justify-between w-full max-w-[220px] border-t border-dashed border-outline-variant pt-2 mt-1">
              <span className="font-mono text-sm uppercase text-primary font-bold">Total Bill</span>
              <span className="font-mono text-lg font-black text-primary">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Footer Notice */}
        <div className="p-4 bg-surface-container-low border-t border-outline flex justify-between items-center text-xs font-mono">
          <span className="text-on-surface-variant uppercase">
            Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus?.toUpperCase()})
          </span>
          <span className="text-primary font-bold uppercase">
            DABBA LOGISTICS
          </span>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="text-center font-mono text-[11px] text-on-surface-variant mt-2 uppercase tracking-widest">
        © 2026 DABBA LOGISTICS & KITCHENS • PRINTED VIA KOT-SYSTEM
      </p>
    </div>
  );
}
