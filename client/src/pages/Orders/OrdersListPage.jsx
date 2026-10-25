import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Receipt, Package, ArrowRight, Navigation } from 'lucide-react';
import { getMyOrders } from '../../services/order.service';
import toast from 'react-hot-toast';

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data?.orders || []);
    } catch (err) {
      toast.error('Failed to load your past orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
          Order Log
        </span>
        <h1 className="font-headline font-black text-3xl sm:text-4xl mt-1 tracking-tight">
          My Past Orders<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-secondary mt-1 text-sm">
          View your order history, delivery progress, and digital KOT receipts.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 font-mono text-xs uppercase text-secondary">
          Loading order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow">
          <Package size={48} className="mx-auto text-secondary mb-3" />
          <h2 className="font-headline font-bold text-2xl uppercase">No orders placed yet</h2>
          <p className="font-body text-secondary mt-1 text-sm">
            You haven't placed any orders with our partner kitchens.
          </p>
          <Link
            to="/restaurants"
            className="inline-block mt-6 bg-primary text-on-primary px-6 py-2.5 font-mono text-xs uppercase font-bold"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const shortId = ord._id.slice(-4).toUpperCase();
            return (
              <div
                key={ord._id}
                className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-primary border border-primary px-2 py-0.5 bg-surface-container-low">
                      #{shortId}
                    </span>
                    <span className="font-mono text-xs text-secondary uppercase flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 border border-on-background bg-surface-container-high">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-xl text-on-background mt-2">
                    {ord.restaurant?.name || 'Partner Kitchen'}
                  </h3>

                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    {ord.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 border-dashed border-outline-variant pt-3 md:pt-0">
                  <span className="font-mono text-lg font-black text-primary">
                    ₹{ord.totalAmount}
                  </span>

                  {['confirmed', 'preparing', 'out_for_delivery'].includes(ord.status) ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/receipt/${ord._id}#live-map`}
                        className="flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-2 font-mono text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all font-bold shadow-sm"
                      >
                        <Navigation size={13} className="text-white animate-spin" />
                        Track Live Map
                      </Link>
                      <Link
                        to={`/receipt/${ord._id}`}
                        className="flex items-center gap-1 border border-on-background px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors font-bold"
                      >
                        <Receipt size={13} /> Ticket
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/receipt/${ord._id}`}
                      className="flex items-center gap-1.5 bg-primary-container text-on-primary px-4 py-2 font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity font-bold"
                    >
                      <Receipt size={14} /> View Details & Map
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
