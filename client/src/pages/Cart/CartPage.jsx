import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../../services/cart.service';
import { createOrder } from '../../services/order.service';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('Flat 402, Sunshine Heights, Cyber City, Gurugram');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data?.cart || null);
    } catch (err) {
      toast.error('Failed to load your cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantity = async (menuItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      setActionLoading(true);
      if (newQty <= 0) {
        await removeCartItem(menuItemId);
        toast.success('Item removed');
      } else {
        await updateCartItem(menuItemId, newQty);
      }
      const data = await getCart();
      setCart(data?.cart || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setActionLoading(true);
      await clearCart();
      toast.success('Cart cleared');
      const data = await getCart();
      setCart(data?.cart || null);
    } catch (err) {
      toast.error('Failed to clear cart');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createOrder({
        deliveryAddress: address.trim(),
        paymentMethod: 'cod',
      });

      toast.success('Order placed successfully!');
      if (res?.order?._id) {
        navigate(`/receipt/${res.order._id}`);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      // Preserve cart and display real backend error message
      const errMsg = err.response?.data?.message || 'Checkout failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + (item.menuItem?.price || 0) * item.quantity,
    0
  );
  const taxes = items.length > 0 ? 50 : 0;
  const total = subtotal + taxes;

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center font-mono text-xs uppercase text-secondary">
        Loading cart ticket...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
          Checkout Ticket
        </span>
        <h1 className="font-headline font-black text-3xl sm:text-4xl mt-1 tracking-tight">
          Your Dabba Cart<span className="text-primary">.</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow">
          <ShoppingBag size={48} className="mx-auto text-secondary mb-3" />
          <h2 className="font-headline font-bold text-2xl uppercase">Your dabba is empty</h2>
          <p className="font-body text-secondary mt-1 text-sm">
            Browse our certified partner kitchens to add fresh, hot homestyle meals.
          </p>
          <Link
            to="/restaurants"
            className="inline-block mt-6 bg-primary text-on-primary px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold"
          >
            Explore Kitchens
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List (2 cols) */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-on-background p-6 sm:p-8 ticket-shadow-sm">
            <div className="border-b border-dashed border-outline-variant pb-4 mb-6 flex justify-between items-center">
              <div>
                <p className="font-mono text-xs text-secondary uppercase">Ordering from Kitchen</p>
                <h2 className="font-headline font-bold text-xl text-on-background">
                  {cart.restaurant?.name || 'Partner Kitchen'}
                </h2>
                {cart.restaurant?.address && (
                  <p className="font-body text-xs text-secondary mt-0.5">
                    {cart.restaurant.address}
                  </p>
                )}
              </div>
              <button
                onClick={handleClearCart}
                disabled={actionLoading}
                className="text-primary font-mono text-xs uppercase flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <Trash2 size={13} /> Clear Cart
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, idx) => (
                <div
                  key={item.menuItem?._id || idx}
                  className="flex items-center justify-between border-b border-outline-variant/40 pb-4"
                >
                  <div className="flex-1">
                    <h3 className="font-headline font-bold text-base uppercase">
                      {item.menuItem?.name || 'Meal Item'}
                    </h3>
                    <p className="font-mono text-xs text-primary font-bold mt-0.5">
                      ₹{item.menuItem?.price} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-on-background bg-surface-container-low font-mono text-xs">
                      <button
                        onClick={() =>
                          handleQuantity(item.menuItem?._id, item.quantity, -1)
                        }
                        disabled={actionLoading}
                        className="px-2.5 py-1 hover:bg-primary-container/20 transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 font-bold border-x border-on-background">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantity(item.menuItem?._id, item.quantity, 1)
                        }
                        disabled={actionLoading}
                        className="px-2.5 py-1 hover:bg-primary-container/20 transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-mono text-sm font-bold w-16 text-right">
                      ₹{(item.menuItem?.price || 0) * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Summary Column (1 col) */}
          <div className="flex flex-col gap-6">
            {/* Delivery Address Box */}
            <div className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm">
              <label className="font-mono text-xs uppercase tracking-wider text-primary font-bold flex items-center gap-1.5 mb-2">
                <MapPin size={14} /> Delivery Destination
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
                className="w-full bg-surface-container-low border border-on-background p-3 font-body text-xs focus:outline-none focus:border-primary"
                placeholder="Enter complete delivery address..."
              />
            </div>

            {/* Price Summary Box */}
            <div className="bg-surface-container-lowest border-2 border-on-background p-6 ticket-shadow">
              <h3 className="font-headline font-bold text-lg border-b border-dashed border-outline-variant pb-3 mb-4 uppercase">
                Receipt Estimate
              </h3>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-background">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Packaging & Taxes</span>
                  <span className="font-bold text-on-background">₹{taxes}</span>
                </div>
                <div className="border-t border-dashed border-outline-variant pt-3 flex justify-between text-sm font-bold text-primary">
                  <span>Total Due (COD)</span>
                  <span className="text-lg">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting || actionLoading}
                className="w-full mt-6 bg-primary text-on-primary py-3 font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : 'Place Order & View Receipt'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
