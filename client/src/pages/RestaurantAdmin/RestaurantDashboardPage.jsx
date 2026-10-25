import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  getMyRestaurant,
  createRestaurant,
  toggleRestaurantStatus,
  getRestaurantMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../services/restaurant.service';
import {
  getRestaurantOrders,
  updateRestaurantOrderStatus,
} from '../../services/order.service';
import toast from 'react-hot-toast';
import {
  ChefHat,
  ShoppingBag,
  Plus,
  Trash2,
  Clock,
  MapPin,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  AlertCircle,
  Ban,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function RestaurantDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview'; // 'overview' | 'orders' | 'menu'

  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time WebSocket connection & notification states
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('dabba_kitchen_sound') !== 'false';
  });
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  // New restaurant registration form state
  const [regForm, setRegForm] = useState({
    name: '',
    description: '',
    address: '',
    cuisine: 'North Indian, Thali',
  });
  const [creatingRest, setCreatingRest] = useState(false);

  // New dish modal/form state
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    image: '',
  });
  const [submittingDish, setSubmittingDish] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const restData = await getMyRestaurant();
      if (restData?.restaurant) {
        setRestaurant(restData.restaurant);
        const [ordersData, menuData] = await Promise.all([
          getRestaurantOrders().catch(() => ({ orders: [] })),
          getRestaurantMenu(restData.restaurant._id).catch(() => ({ menu: [] })),
        ]);
        setOrders(ordersData?.orders || []);
        setMenu(menuData?.menu || []);
      } else {
        setRestaurant(null);
      }
    } catch (err) {
      console.error('Error loading restaurant dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  // Web Audio API POS kitchen bell chime
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: Triangle oscillator D5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: Sine oscillator A5 chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.16);
      gain2.gain.setValueAtTime(0.45, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.75);
    } catch (err) {
      console.warn('Audio chime playback issue:', err);
    }
  };

  // WebSocket real-time order listener for this restaurant
  useEffect(() => {
    if (!restaurant?._id) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
      socket.emit('join-restaurant', restaurant._id);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    // Real-time incoming order from customer
    socket.on('new-order', (newOrder) => {
      if (!newOrder) return;

      if (soundEnabled) {
        playOrderChime();
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-surface-container-lowest border-2 border-primary ticket-shadow p-4 flex items-start gap-3`}
          >
            <div className="bg-primary text-on-primary p-2 border border-on-background shrink-0 mt-0.5">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary uppercase">
                  🔔 New Order Received!
                </span>
                <span className="font-mono text-xs font-bold text-on-background">
                  ₹{newOrder.totalAmount}
                </span>
              </div>
              <p className="font-headline font-bold text-sm text-on-background mt-1">
                Order #{newOrder._id.slice(-4).toUpperCase()} from {newOrder.customer?.fullName || 'Customer'}
              </p>
              <p className="font-body text-xs text-secondary mt-0.5 line-clamp-1">
                {newOrder.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
              </p>
            </div>
          </div>
        ),
        { duration: 7000 }
      );

      // Prepend newly received order to state (avoid duplicates)
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === newOrder._id);
        if (exists) return prev;
        return [newOrder, ...prev];
      });

      // Highlight this order visually in the list
      setHighlightOrderId(newOrder._id);
      setTimeout(() => {
        setHighlightOrderId((current) => (current === newOrder._id ? null : current));
      }, 8000);
    });

    // Real-time status updates (e.g. rider assigned, out for delivery, delivered)
    socket.on('order-status-update', (updatedOrder) => {
      if (!updatedOrder) return;
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
    });

    return () => {
      socket.emit('leave-restaurant', restaurant._id);
      socket.disconnect();
    };
  }, [restaurant?._id, soundEnabled]);

  const handleToggleStatus = async () => {
    if (!restaurant) return;
    if (restaurant.isActive === false) {
      toast.error('Cannot open a deactivated kitchen. Please contact admin support.');
      return;
    }
    try {
      const res = await toggleRestaurantStatus(restaurant._id);
      setRestaurant((prev) => ({ ...prev, isOpen: res.isOpen }));
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.address.trim()) {
      toast.error('Name and address are required');
      return;
    }

    try {
      setCreatingRest(true);
      const res = await createRestaurant({
        name: regForm.name.trim(),
        description: regForm.description.trim(),
        address: regForm.address.trim(),
        cuisine: regForm.cuisine.split(',').map((c) => c.trim()),
      });
      toast.success('Restaurant registered successfully!');
      setRestaurant(res.restaurant);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setCreatingRest(false);
    }
  };

  const handleOrderStatus = async (orderId, nextStatus) => {
    try {
      await updateRestaurantOrderStatus(orderId, nextStatus);
      toast.success(`Order updated to: ${nextStatus.replace(/_/g, ' ')}`);
      const ordersData = await getRestaurantOrders();
      setOrders(ordersData?.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!dishForm.name.trim() || !dishForm.price) {
      toast.error('Dish name and price are required');
      return;
    }

    try {
      setSubmittingDish(true);
      await addMenuItem(restaurant._id, {
        name: dishForm.name.trim(),
        description: dishForm.description.trim(),
        price: Number(dishForm.price),
        category: dishForm.category,
        isVeg: dishForm.isVeg,
        image: dishForm.image.trim(),
      });
      toast.success('Dish added to menu!');
      setShowAddDish(false);
      setDishForm({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        isVeg: true,
        image: '',
      });
      const menuData = await getRestaurantMenu(restaurant._id);
      setMenu(menuData?.menu || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add dish');
    } finally {
      setSubmittingDish(false);
    }
  };

  const handleToggleDishAvailability = async (item) => {
    try {
      await updateMenuItem(item._id, { isAvailable: !item.isAvailable });
      setMenu((prev) =>
        prev.map((d) => (d._id === item._id ? { ...d, isAvailable: !d.isAvailable } : d))
      );
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDeleteDish = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;
    try {
      await deleteMenuItem(item._id);
      setMenu((prev) => prev.filter((d) => d._id !== item._id));
      toast.success('Dish removed from menu');
    } catch (err) {
      toast.error('Failed to delete dish');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center font-mono text-xs uppercase text-secondary">
        Loading kitchen dashboard...
      </div>
    );
  }

  // If user does not have a registered restaurant yet
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[800px] mx-auto">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Kitchen Onboarding
          </span>
          <h1 className="font-headline font-black text-3xl sm:text-4xl mt-1 tracking-tight">
            Register Your Kitchen<span className="text-primary">.</span>
          </h1>
          <p className="font-body text-secondary mt-1 text-sm">
            Set up your commercial kitchen or home-style tiffin service on DABBA.
          </p>
        </div>

        <div className="bg-surface-container-lowest border-2 border-on-background p-6 sm:p-8 ticket-shadow tear-off">
          <form onSubmit={handleCreateRestaurant} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-secondary mb-2">
                Kitchen Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dabba Kitchen Central"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                className="w-full bg-surface-container-low border border-on-background p-3 font-body text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-secondary mb-2">
                Description / Bio
              </label>
              <textarea
                placeholder="Describe your homestyle recipes, ingredients, and specialties..."
                value={regForm.description}
                onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                rows={3}
                className="w-full bg-surface-container-low border border-on-background p-3 font-body text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-secondary mb-2">
                Pickup Address
              </label>
              <input
                type="text"
                placeholder="Complete street address for rider pickups"
                value={regForm.address}
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                className="w-full bg-surface-container-low border border-on-background p-3 font-body text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-secondary mb-2">
                Cuisine Categories (comma separated)
              </label>
              <input
                type="text"
                placeholder="North Indian, Thali, Punjabi, Snacks"
                value={regForm.cuisine}
                onChange={(e) => setRegForm({ ...regForm, cuisine: e.target.value })}
                className="w-full bg-surface-container-low border border-on-background p-3 font-body text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-4 border-t border-dashed border-outline-variant flex justify-end">
              <button
                type="submit"
                disabled={creatingRest}
                className="bg-primary text-on-primary px-8 py-3.5 font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all"
              >
                {creatingRest ? 'Registering...' : 'Register Kitchen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
      {/* Deactivated Kitchen Warning Banner */}
      {restaurant.isActive === false && (
        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-600 ticket-shadow flex items-start sm:items-center gap-3">
          <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <h3 className="font-mono text-xs font-bold uppercase text-red-700 dark:text-red-300">
              Platform Notice: Kitchen Deactivated
            </h3>
            <p className="font-body text-xs text-secondary mt-0.5">
              Your kitchen has been deactivated by platform administrators. It cannot accept orders or be opened until reactivated. Please contact support.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-surface-container-lowest border-2 border-on-background p-6 sm:p-8 ticket-shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-primary">
                ● Owner Console
              </span>
              <span className="text-secondary text-xs">•</span>
              <span className="font-mono text-xs text-secondary uppercase">
                ID: {restaurant._id.slice(-6).toUpperCase()}
              </span>
              {restaurant.isActive === false && (
                <span className="ml-2 font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-red-600 text-white border border-red-700">
                  ✕ Deactivated
                </span>
              )}
            </div>
            <h1 className="font-headline font-black text-3xl sm:text-4xl text-on-background mt-1">
              {restaurant.name}
            </h1>
            <p className="font-mono text-xs text-secondary uppercase tracking-wider mt-1">
              {Array.isArray(restaurant.cuisine)
                ? restaurant.cuisine.join(' • ')
                : restaurant.cuisine}
            </p>
            <p className="font-body text-xs text-on-surface-variant flex items-center gap-1.5 mt-2">
              <MapPin size={13} className="text-primary shrink-0" /> {restaurant.address}
            </p>
          </div>

          {/* Quick Actions & Live Stream Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            {/* Live Socket Status Badge */}
            <span
              className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1.5 border flex items-center gap-1.5 ${
                isSocketConnected
                  ? 'bg-green-500/15 border-green-700 text-green-700 dark:text-green-300'
                  : 'bg-surface-container-high border-outline text-secondary'
              }`}
              title={isSocketConnected ? 'Live WebSocket Connected' : 'Connecting to WebSocket'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? 'bg-green-600 animate-pulse' : 'bg-secondary'
                }`}
              />
              {isSocketConnected ? 'Live Stream Active' : 'Connecting...'}
            </span>

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                localStorage.setItem('dabba_kitchen_sound', next ? 'true' : 'false');
                if (next) playOrderChime();
                toast(next ? '🔔 Order chime enabled' : '🔕 Order chime muted');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase font-bold border border-on-background bg-surface-container-low hover:bg-surface-container-high transition-colors"
              title={soundEnabled ? 'Mute kitchen order chime' : 'Enable kitchen order chime'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {soundEnabled ? 'Chime ON' : 'Muted'}
            </button>

            <button
              onClick={handleToggleStatus}
              disabled={restaurant.isActive === false}
              title={restaurant.isActive === false ? 'Cannot open a deactivated kitchen' : ''}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase font-bold border-2 border-on-background transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                restaurant.isActive === false
                  ? 'bg-surface-container-highest text-secondary border-dashed'
                  : restaurant.isOpen
                  ? 'bg-green-700 text-white'
                  : 'bg-surface-container-high text-on-surface'
              }`}
            >
              {restaurant.isActive === false ? (
                <Ban size={18} />
              ) : restaurant.isOpen ? (
                <ToggleRight size={18} />
              ) : (
                <ToggleLeft size={18} />
              )}
              {restaurant.isActive === false
                ? 'Deactivated by Admin'
                : restaurant.isOpen
                ? 'Kitchen Open (Accepting Orders)'
                : 'Kitchen Closed'}
            </button>

            <Link
              to={`/restaurants/${restaurant._id}`}
              className="bg-primary text-on-primary px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90"
            >
              View Public Page →
            </Link>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 mt-8 border-b border-on-background font-mono text-xs uppercase font-bold">
          <button
            onClick={() => setSearchParams({ tab: 'overview' })}
            className={`pb-3 border-b-2 transition-all ${
              currentTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`pb-3 border-b-2 transition-all ${
              currentTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            Kitchen Orders ({orders.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'menu' })}
            className={`pb-3 border-b-2 transition-all ${
              currentTab === 'menu'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            Menu Catalog ({menu.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm">
            <span className="font-mono text-xs text-secondary uppercase">Active Orders</span>
            <p className="font-headline font-black text-4xl text-primary mt-2">
              {orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm">
            <span className="font-mono text-xs text-secondary uppercase">Menu Items</span>
            <p className="font-headline font-black text-4xl text-on-background mt-2">
              {menu.length}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm">
            <span className="font-mono text-xs text-secondary uppercase">Kitchen Status</span>
            <p className="font-headline font-black text-2xl uppercase mt-3">
              {restaurant.isOpen ? (
                <span className="text-green-700">● Open & Live</span>
              ) : (
                <span className="text-red-700">○ Paused / Closed</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {currentTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow font-mono text-xs text-secondary uppercase">
              No orders placed for this kitchen yet.
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className={`bg-surface-container-lowest border-2 transition-all duration-500 p-6 ticket-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative ${
                  highlightOrderId === ord._id
                    ? 'border-primary ring-2 ring-primary/40 bg-primary/5 animate-pulse'
                    : 'border-on-background'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary border border-primary px-2 py-0.5 bg-surface-container-low">
                      #{ord._id.slice(-4).toUpperCase()}
                    </span>
                    {highlightOrderId === ord._id && (
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-primary text-on-primary animate-bounce">
                        ⚡ LIVE INCOMING ORDER
                      </span>
                    )}
                    <span className="font-mono text-xs text-secondary uppercase flex items-center gap-1">
                      <Clock size={12} /> {new Date(ord.createdAt).toLocaleTimeString()}
                    </span>
                    {ord.status === 'placed' ? (
                      <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/40">
                        ● Awaiting Acceptance
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 border border-on-background bg-surface-container-high">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline font-bold text-xl text-on-background mt-2">
                    Customer: {ord.customer?.fullName || 'Customer'} ({ord.customer?.phone || 'N/A'})
                  </h3>

                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    <strong>Items:</strong>{' '}
                    {ord.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                  <p className="font-body text-xs text-secondary mt-1">
                    <strong>Delivery Address:</strong> {ord.deliveryAddress}
                  </p>
                  {ord.rider ? (
                    <p className="font-body text-xs text-primary mt-1 font-bold">
                      <strong>Assigned Rider:</strong> {ord.rider.fullName} ({ord.rider.phone || 'N/A'})
                    </p>
                  ) : ord.status === 'placed' ? (
                    <p className="font-body text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                      Hidden from riders until kitchen accepts the order
                    </p>
                  ) : ord.status !== 'cancelled' ? (
                    <p className="font-body text-xs text-secondary mt-1 italic">
                      Dispatched to fleet • Waiting for a rider to claim
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 border-dashed border-outline-variant pt-4 md:pt-0">
                  <span className="font-mono text-xl font-black text-primary">
                    ₹{ord.totalAmount}
                  </span>

                  {/* Status Progression Actions */}
                  <div className="flex items-center gap-2">
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => handleOrderStatus(ord._id, 'confirmed')}
                        className="bg-primary text-on-primary px-3.5 py-1.5 font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                        title="Accept order and notify riders for pickup"
                      >
                        <CheckCircle size={14} /> Accept & Dispatch to Riders
                      </button>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => handleOrderStatus(ord._id, 'preparing')}
                        className="bg-primary text-on-primary px-3.5 py-1.5 font-mono text-xs uppercase font-bold hover:opacity-90"
                      >
                        Start Preparing
                      </button>
                    )}

                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleOrderStatus(ord._id, 'out_for_delivery')}
                        className="bg-green-700 text-white px-3.5 py-1.5 font-mono text-xs uppercase font-bold hover:opacity-90"
                      >
                        Ready for Pickup
                      </button>
                    )}

                    <Link
                      to={`/receipt/${ord._id}`}
                      className="border border-on-background px-3 py-1.5 font-mono text-xs uppercase font-bold hover:bg-surface-container-high"
                    >
                      KOT Ticket
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Menu Catalog */}
      {currentTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline font-bold text-2xl uppercase">Kitchen Dishes</h2>
            <button
              onClick={() => setShowAddDish(true)}
              className="bg-primary text-on-primary px-4 py-2 font-mono text-xs uppercase font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95"
            >
              <Plus size={15} /> Add New Dish
            </button>
          </div>

          {/* Add Dish Inline Modal / Form */}
          {showAddDish && (
            <div className="bg-surface-container-lowest border-2 border-primary p-6 ticket-shadow mb-8 tear-off">
              <h3 className="font-headline font-bold text-xl uppercase mb-4 text-primary">
                Add Dish to Menu
              </h3>
              <form onSubmit={handleAddDish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="block uppercase text-secondary font-bold mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paneer Tikka Masala"
                      value={dishForm.name}
                      onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                      className="w-full bg-surface-container-low border border-on-background p-2.5 font-body text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-secondary font-bold mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="280"
                      value={dishForm.price}
                      onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                      className="w-full bg-surface-container-low border border-on-background p-2.5 font-body text-sm focus:outline-none focus:border-primary"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-secondary font-bold mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="Main Course, Breads, Thali..."
                      value={dishForm.category}
                      onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                      className="w-full bg-surface-container-low border border-on-background p-2.5 font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-secondary font-bold mb-1">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={dishForm.image}
                      onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                      className="w-full bg-surface-container-low border border-on-background p-2.5 font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-secondary font-bold mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Short description of taste and portion size..."
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    rows={2}
                    className="w-full bg-surface-container-low border border-on-background p-2.5 font-body text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 font-mono text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isVeg}
                      onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                    />
                    <span>Vegetarian Dish</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-dashed border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowAddDish(false)}
                    className="px-4 py-2 font-mono text-xs uppercase border border-on-background"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDish}
                    className="bg-primary text-on-primary px-6 py-2 font-mono text-xs uppercase font-bold"
                  >
                    {submittingDish ? 'Adding...' : 'Save Dish'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu.map((dish) => (
              <div
                key={dish._id}
                className="bg-surface-container-lowest border border-on-background p-5 ticket-shadow-sm flex justify-between gap-4"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block w-2.5 h-2.5 border ${
                          dish.isVeg ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'
                        }`}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                        {dish.category}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-lg">{dish.name}</h3>
                    {dish.description && (
                      <p className="font-body text-xs text-secondary mt-1 line-clamp-2">
                        {dish.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-outline-variant pt-3">
                    <span className="font-mono text-base font-bold text-primary">
                      ₹{dish.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDishAvailability(dish)}
                        className={`font-mono text-[11px] uppercase font-bold px-2.5 py-1 border ${
                          dish.isAvailable
                            ? 'bg-green-700 text-white border-green-700'
                            : 'bg-surface-container-high text-secondary border-outline'
                        }`}
                      >
                        {dish.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>

                      <button
                        onClick={() => handleDeleteDish(dish)}
                        className="p-1 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete dish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
