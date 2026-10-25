import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ShoppingBag, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRestaurantById, getRestaurantMenu } from '../../services/restaurant.service';
import { addToCart } from '../../services/cart.service';
import { useAuth } from '../../context/AuthContext';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [restData, menuData] = await Promise.all([
        getRestaurantById(id),
        getRestaurantMenu(id),
      ]);

      if (restData?.restaurant) {
        setRestaurant(restData.restaurant);
      } else {
        setRestaurant(null);
      }

      setMenu(menuData?.menu || []);
    } catch (err) {
      console.error('Error loading restaurant details', err);
      setRestaurant(null);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    // 1. If unauthenticated guest, redirect to login with return destination
    if (!isAuthenticated || !user) {
      toast.error('Please log in as a customer to add items to your cart.');
      const returnTarget = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${returnTarget}`);
      return;
    }

    // 2. Only Customers can add items to cart
    if (user.userType !== 'Customer') {
      toast.error(
        `Accounts with role '${user.userType}' cannot add food items to cart. Please log in with a Customer account.`
      );
      return;
    }

    // 3. Check if kitchen is active on platform
    if (restaurant.isActive === false) {
      toast.error('This kitchen is currently deactivated and not accepting orders.');
      return;
    }

    // 4. Check if dish is available
    if (!item.isAvailable) {
      toast.error('This item is currently out of stock.');
      return;
    }

    try {
      setAddingId(item._id);
      setConflictError(null);
      await addToCart(item._id, 1);
      toast.success(`Added ${item.name} to cart!`);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || 'Could not add item to cart. Please try again.';
      toast.error(backendMessage);

      // Handle multi-restaurant conflict explicitly
      if (backendMessage.toLowerCase().includes('another restaurant')) {
        setConflictError(backendMessage);
      }
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center font-mono text-sm uppercase text-secondary">
        Loading kitchen menu...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-[440px] w-full bg-surface-container-lowest border-2 border-on-background p-8 ticket-shadow text-center">
          <AlertCircle size={36} className="mx-auto text-primary mb-3" />
          <h2 className="font-headline font-bold text-2xl uppercase">Kitchen Not Found</h2>
          <p className="font-body text-xs text-secondary mt-2">
            The requested kitchen ID does not exist or may have been removed.
          </p>
          <Link
            to="/restaurants"
            className="inline-block mt-6 bg-primary text-on-primary px-6 py-2.5 font-mono text-xs uppercase font-bold"
          >
            Explore All Kitchens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/restaurants"
          className="inline-flex items-center text-primary font-mono text-xs uppercase tracking-wider hover:opacity-80"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Kitchens
        </Link>
      </div>

      {/* Multi-restaurant conflict warning banner */}
      {conflictError && (
        <div className="mb-6 p-4 bg-primary/10 border-2 border-primary ticket-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-primary shrink-0" />
            <p className="font-mono text-xs font-bold text-primary">{conflictError}</p>
          </div>
          <Link
            to="/cart"
            className="bg-primary text-on-primary px-4 py-1.5 font-mono text-xs uppercase font-bold hover:opacity-90 self-start sm:self-auto"
          >
            Go to Cart & Clear
          </Link>
        </div>
      )}

      {/* Deactivated Kitchen Banner */}
      {restaurant.isActive === false && (
        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-600 ticket-shadow-sm flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="font-mono text-xs font-bold text-red-700 dark:text-red-300 uppercase">
              Notice: Kitchen Deactivated
            </p>
            <p className="font-body text-xs text-secondary mt-0.5">
              This kitchen is currently deactivated by platform administrators and is not accepting orders.
            </p>
          </div>
        </div>
      )}

      {/* Restaurant Header Card */}
      <div className="bg-surface-container-lowest border-2 border-on-background p-6 sm:p-8 ticket-shadow mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              ● Certified Kitchen
            </span>
            <h1 className="font-headline font-black text-3xl sm:text-4xl text-on-background mt-1">
              {restaurant.name}
            </h1>
            <p className="font-mono text-xs uppercase tracking-wider text-secondary mt-1">
              {Array.isArray(restaurant.cuisine)
                ? restaurant.cuisine.join(' • ')
                : restaurant.cuisine}
            </p>
            <p className="font-body text-sm text-on-surface-variant flex items-center gap-1.5 mt-3">
              <MapPin size={15} className="text-primary shrink-0" /> {restaurant.address}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <span
              className={`font-mono text-xs font-bold uppercase px-3 py-1 border border-on-background ${
                restaurant.isOpen
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              {restaurant.isOpen ? 'Accepting Orders' : 'Currently Closed'}
            </span>

            {/* Cart link: show if customer is logged in */}
            {isAuthenticated && user?.userType === 'Customer' && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2 font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={14} /> View My Cart
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu Header */}
      <div className="border-b-2 border-on-background pb-3 mb-8 flex justify-between items-end">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tight">
          Today's Kitchen Menu
        </h2>
        <span className="font-mono text-xs uppercase text-secondary">
          {menu.length} Items Available
        </span>
      </div>

      {/* Empty Menu State */}
      {menu.length === 0 ? (
        <div className="bg-surface-container-lowest border border-on-background p-12 text-center ticket-shadow-sm font-mono text-xs uppercase text-secondary">
          No menu dishes currently listed for this kitchen.
        </div>
      ) : (
        /* Menu Items Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menu.map((dish) => (
            <div
              key={dish._id}
              className="bg-surface-container-lowest border border-on-background p-5 flex justify-between gap-4 ticket-shadow-sm hover:translate-x-1 transition-transform"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block w-2.5 h-2.5 border ${
                        dish.isVeg
                          ? 'border-green-600 bg-green-600'
                          : 'border-red-600 bg-red-600'
                      }`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {dish.category || 'Special'}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-background">
                    {dish.name}
                  </h3>
                  {dish.description && (
                    <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-primary">
                    ₹{dish.price}
                  </span>

                  {dish.isAvailable ? (
                    <button
                      onClick={() => handleAddToCart(dish)}
                      disabled={addingId === dish._id || restaurant.isActive === false}
                      title={restaurant.isActive === false ? 'Kitchen is currently deactivated' : ''}
                      className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} /> Add to Dabba
                    </button>
                  ) : (
                    <span className="font-mono text-[11px] uppercase text-secondary border border-outline px-2 py-1">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {dish.image && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 border border-on-background overflow-hidden shrink-0 bg-surface-container-low">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
