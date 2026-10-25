import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Bike,
  MapPin,
  CheckCircle,
  Navigation,
  Clock,
  PackageCheck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  getAvailableOrders,
  assignRider,
  getMyDeliveries,
  updateDeliveryStatus,
  getRiderAvailability,
  toggleRiderAvailability,
} from '../../services/rider.service';

export default function RiderDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('available'); // 'available' | 'my-deliveries'
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [lastBroadcastLocation, setLastBroadcastLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  // Active deliveries that require live GPS broadcasting
  const activeDeliveries = myDeliveries.filter(
    (ord) => ord.status !== 'delivered' && ord.status !== 'cancelled'
  );

  // Pleasant notification chime when a newly confirmed order becomes available for delivery
  const playDeliveryChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Initialize Socket.IO connection and join the fleet pool room
  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });
    setSocket(s);

    s.on('connect', () => {
      s.emit('join-riders');
    });

    // Real-time: Restaurant accepted an order, dispatching it to riders
    s.on('delivery-available', (newOrder) => {
      setAvailableOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      playDeliveryChime();
      toast.success(
        `New Delivery Available! ${newOrder.restaurant?.name || 'Restaurant'} (₹${newOrder.totalAmount})`,
        { icon: '🛵', duration: 5000 }
      );
    });

    // Real-time: Another rider claimed the order, remove it immediately from available list
    s.on('order-claimed', ({ orderId }) => {
      setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
    });

    // Real-time: Order status change (e.g., cancelled or delivered)
    s.on('order-status-update', (updatedOrder) => {
      if (updatedOrder.status === 'cancelled' || updatedOrder.status === 'delivered') {
        setAvailableOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      }
      setMyDeliveries((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
    });

    return () => {
      s.emit('leave-riders');
      s.disconnect();
    };
  }, []);

  // AUTOMATIC LIVE LOCATION BROADCAST: Shares rider location by default for all active deliveries
  useEffect(() => {
    if (!socket || !isAvailable || activeDeliveries.length === 0) return;

    let isSubscribed = true;
    let intervalId = null;

    // NCR / Gurugram fallback baseline
    let currentLat = 28.4950;
    let currentLng = 77.0890;

    const broadcast = (lat, lng) => {
      activeDeliveries.forEach((ord) => {
        socket.emit('update-location', {
          orderId: ord._id,
          latitude: lat,
          longitude: lng,
          updatedAt: new Date(),
        });
      });
      setLastBroadcastLocation({ latitude: lat, longitude: lng, time: new Date() });
    };

    const pollLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isSubscribed) return;
            broadcast(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            if (!isSubscribed) return;
            // Micro-nudge for testing/demo without mobile hardware
            currentLat += (Math.random() - 0.48) * 0.0003;
            currentLng += (Math.random() - 0.48) * 0.0003;
            broadcast(currentLat, currentLng);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
        );
      } else {
        currentLat += (Math.random() - 0.48) * 0.0003;
        currentLng += (Math.random() - 0.48) * 0.0003;
        broadcast(currentLat, currentLng);
      }
    };

    // Immediately broadcast once, then continuously every 4 seconds
    pollLocation();
    intervalId = setInterval(pollLocation, 4000);

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [socket, isAvailable, activeDeliveries.map((d) => d._id + d.status).join(',')]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const data = await getRiderAvailability();
      if (typeof data?.isAvailable === 'boolean') {
        setIsAvailable(data.isAvailable);
      }
    } catch (err) {
      console.error('Error loading rider availability', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === 'available') {
        const data = await getAvailableOrders();
        setAvailableOrders(data?.orders || []);
      } else {
        const data = await getMyDeliveries();
        setMyDeliveries(data?.orders || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch delivery orders');
      if (tab === 'available') setAvailableOrders([]);
      else setMyDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (user?.isActive === false) {
      toast.error('Cannot change delivery status. Your account has been deactivated by administrator.');
      return;
    }

    try {
      setTogglingAvailability(true);
      const res = await toggleRiderAvailability(!isAvailable);
      setIsAvailable(res.isAvailable);
      toast.success(res.message || 'Delivery status updated');
      if (refreshUser) refreshUser();
      if (tab === 'available') {
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleAccept = async (orderId) => {
    if (!isAvailable) {
      toast.error('You are currently closed for delivery. Turn your status to Open to accept orders.');
      return;
    }

    try {
      await assignRider(orderId);
      toast.success('Order claimed! Live location sharing is now active by default.');
      setTab('my-deliveries');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim delivery');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      toast.success(`Delivery status updated to ${newStatus.replace(/_/g, ' ')}`);

      // If marked as delivered, stop location sharing immediately for this order
      if (newStatus === 'delivered' && socket) {
        socket.emit('stop-location', { orderId });
        toast.success('Order delivered! Live GPS sharing stopped.');
      }

      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery status');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1000px] mx-auto">
      {/* Rider Console Card (Top Banner with Availability Toggle) */}
      <div className="bg-surface-container-lowest border-2 border-on-background p-6 sm:p-8 ticket-shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase text-primary">
                ● Fleet Operator
              </span>
              <span className="text-secondary text-xs">•</span>
              <span className="font-mono text-xs text-secondary uppercase">
                {user?.fullName || 'Rider Partner'}
              </span>
              {user?.isActive === false ? (
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-red-600 text-white border border-red-700">
                  ✕ Account Deactivated
                </span>
              ) : isAvailable ? (
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-green-700 text-white border border-green-800 animate-pulse">
                  ● OPEN TO DELIVERY
                </span>
              ) : (
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-surface-container-highest text-secondary border border-outline">
                  ○ CLOSED / OFFLINE
                </span>
              )}
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-on-background mt-1 tracking-tight">
              Rider Delivery Hub<span className="text-primary">.</span>
            </h1>
            <p className="font-body text-secondary mt-1 text-sm">
              {isAvailable
                ? 'You are currently open for delivery. Pick up orders, track live dropoffs, and broadcast GPS coordinates.'
                : 'You are currently off-duty / closed for delivery. You will not accept pickups until toggled back open.'}
            </p>
          </div>

          {/* Availability Toggle Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleToggleAvailability}
              disabled={togglingAvailability || user?.isActive === false}
              title={
                user?.isActive === false
                  ? 'Account deactivated by admin'
                  : isAvailable
                  ? 'Click to go offline (stop taking orders)'
                  : 'Click to go online (start taking orders)'
              }
              className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase font-bold border-2 border-on-background transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                user?.isActive === false
                  ? 'bg-surface-container-highest text-secondary border-dashed'
                  : isAvailable
                  ? 'bg-green-700 text-white shadow-sm hover:bg-green-800'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              {user?.isActive === false ? (
                <Ban size={18} />
              ) : isAvailable ? (
                <ToggleRight size={20} />
              ) : (
                <ToggleLeft size={20} />
              )}
              {user?.isActive === false
                ? 'Deactivated by Admin'
                : togglingAvailability
                ? 'Updating...'
                : isAvailable
                ? 'Open to Delivery (Online)'
                : 'Closed to Delivery (Offline)'}
            </button>
          </div>
        </div>

        {/* Live GPS Default Broadcasting Status Banner */}
        {activeDeliveries.length > 0 && isAvailable && (
          <div className="mt-6 p-4 bg-green-500/10 border-2 border-green-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
              </span>
              <div>
                <p className="font-mono text-xs font-bold text-green-700 dark:text-green-300 uppercase">
                  Live GPS Broadcasting: Active by Default
                </p>
                <p className="font-body text-xs text-secondary mt-0.5">
                  Streaming your live GPS coordinates to customer map for {activeDeliveries.length} active delivery(ies).
                  {lastBroadcastLocation && (
                    <span className="font-mono text-[11px] ml-1 font-bold text-on-surface">
                      (Lat: {lastBroadcastLocation.latitude.toFixed(4)}, Lng: {lastBroadcastLocation.longitude.toFixed(4)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-green-800 dark:text-green-200 border border-green-600/40 px-2.5 py-1 bg-green-500/20 uppercase shrink-0">
              Auto-Stops When Delivered
            </span>
          </div>
        )}

        {/* Account Deactivated Warning */}
        {user?.isActive === false && (
          <div className="mt-6 p-4 bg-red-500/10 border-2 border-red-600 flex items-start sm:items-center gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-mono text-xs font-bold text-red-700 dark:text-red-300 uppercase">
                Notice: Account Deactivated
              </p>
              <p className="font-body text-xs text-secondary mt-0.5">
                Your rider account is currently deactivated by platform administrators. You cannot go online or claim deliveries.
              </p>
            </div>
          </div>
        )}

        {/* Closed/Offline Warning Banner */}
        {!isAvailable && user?.isActive !== false && (
          <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/40 flex items-start sm:items-center gap-3">
            <AlertCircle size={20} className="text-primary shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-mono text-xs font-bold text-primary uppercase">
                Notice: You Are Closed for Delivery
              </p>
              <p className="font-body text-xs text-secondary mt-0.5">
                You are currently offline. You cannot claim new customer orders until you click <strong>Open to Delivery</strong> above.
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-6 mt-8 border-b border-on-background font-mono text-xs uppercase font-bold">
          <button
            onClick={() => setTab('available')}
            className={`pb-3 border-b-2 transition-all ${
              tab === 'available'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            Available Orders ({availableOrders.length})
          </button>
          <button
            onClick={() => setTab('my-deliveries')}
            className={`pb-3 border-b-2 transition-all ${
              tab === 'my-deliveries'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            My Deliveries ({myDeliveries.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 font-mono text-xs uppercase text-secondary">
          Loading fleet data...
        </div>
      ) : tab === 'available' ? (
        /* Tab 1: Available Orders */
        <div className="space-y-6">
          {availableOrders.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow font-mono text-xs text-secondary uppercase">
              No pending orders ready for pickup right now.
            </div>
          ) : (
            availableOrders.map((ord) => (
              <div
                key={ord._id}
                className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold text-primary border border-primary px-2 py-0.5 bg-surface-container-low uppercase">
                    Order #{ord._id.slice(-4).toUpperCase()}
                  </span>
                  <h3 className="font-headline font-bold text-xl text-on-background mt-2">
                    {ord.restaurant?.name || 'Partner Kitchen'}
                  </h3>
                  <p className="font-body text-xs text-secondary flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-primary shrink-0" /> Pick up:{' '}
                    {ord.restaurant?.address || 'Kitchen address'}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-primary shrink-0" /> Deliver to:{' '}
                    {ord.deliveryAddress}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-black text-on-background">
                    ₹{ord.totalAmount}
                  </span>
                  <button
                    onClick={() => handleAccept(ord._id)}
                    disabled={!isAvailable}
                    title={!isAvailable ? 'Toggle your status to Open to accept orders' : ''}
                    className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Bike size={14} /> Accept Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Tab 2: My Deliveries */
        <div className="space-y-6">
          {myDeliveries.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow font-mono text-xs text-secondary uppercase">
              You haven't claimed any deliveries yet.
            </div>
          ) : (
            myDeliveries.map((ord) => (
              <div
                key={ord._id}
                className="bg-surface-container-lowest border-2 border-on-background p-6 ticket-shadow flex flex-col gap-4"
              >
                <div className="flex justify-between items-start border-b border-dashed border-outline-variant pb-3">
                  <div>
                    <span className="font-mono text-xs text-primary font-bold">
                      DELIVERY #{ord._id.slice(-4).toUpperCase()}
                    </span>
                    <h3 className="font-headline font-bold text-xl text-on-background mt-0.5">
                      {ord.restaurant?.name || 'Partner Kitchen'}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-bold uppercase border border-on-background px-2.5 py-1 bg-surface-container-high">
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs font-body text-on-surface-variant space-y-1">
                  <p className="flex items-center gap-1">
                    <MapPin size={14} className="text-primary shrink-0" />{' '}
                    <strong>Pickup From:</strong> {ord.restaurant?.address || 'Kitchen address'}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin size={14} className="text-primary shrink-0" />{' '}
                    <strong>Deliver To:</strong> {ord.deliveryAddress}
                  </p>
                  <p>
                    <strong>Customer:</strong> {ord.customer?.fullName} ({ord.customer?.phone || 'N/A'})
                  </p>
                </div>

                {/* Rider Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40">
                  <div className="flex flex-wrap items-center gap-2">
                    {ord.status !== 'out_for_delivery' && ord.status !== 'delivered' && (
                      <button
                        onClick={() => handleStatusUpdate(ord._id, 'out_for_delivery')}
                        className="bg-primary text-on-primary px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                      >
                        <Bike size={14} /> Start Delivery (Out For Delivery)
                      </button>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleStatusUpdate(ord._id, 'delivered')}
                        className="bg-green-700 text-white px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                      >
                        <PackageCheck size={14} /> Mark as Delivered
                      </button>
                    )}
                  </div>

                  {/* Automatic Live GPS Status Indicator */}
                  {ord.status !== 'delivered' ? (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-green-700 dark:text-green-300 bg-green-500/10 border border-green-600/30 px-3 py-1.5 font-bold uppercase">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      <Navigation size={13} className="text-green-600" />
                      Live GPS Streaming by Default
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-secondary bg-surface-container-high border border-outline-variant px-3 py-1.5 font-bold uppercase">
                      <CheckCircle size={13} className="text-green-600" />
                      Delivered • GPS Stopped
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
