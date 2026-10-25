import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, UtensilsCrossed } from 'lucide-react';
import { getRestaurants } from '../../services/restaurant.service';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fallback sample restaurants if backend database has none yet
  const sampleRestaurants = [
    {
      _id: 'sample-1',
      name: 'Dabba Kitchen Central',
      address: 'Cyber City, Sector 24, Gurugram',
      cuisine: ['North Indian', 'Thali', 'Biryani'],
      isOpen: true,
      image: [{ url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop' }],
    },
    {
      _id: 'sample-2',
      name: 'Mumbai Dabbawala Express',
      address: 'Connaught Place, New Delhi',
      cuisine: ['Maharashtrian', 'Street Food'],
      isOpen: true,
      image: [{ url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop' }],
    },
    {
      _id: 'sample-3',
      name: 'South Tiffin Co.',
      address: 'Indiranagar, Bangalore',
      cuisine: ['South Indian', 'Dosa', 'Filter Coffee'],
      isOpen: false,
      image: [{ url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop' }],
    },
  ];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data?.restaurants || []);
    } catch (err) {
      console.error('Failed to load restaurants from server', err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const nameMatch = r.name?.toLowerCase().includes(query);
    const addressMatch = r.address?.toLowerCase().includes(query);
    const cuisineMatch = Array.isArray(r.cuisine)
      ? r.cuisine.some((c) => c.toLowerCase().includes(query))
      : r.cuisine?.toLowerCase().includes(query);
    return nameMatch || addressMatch || cuisineMatch;
  });

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
      {/* Page Header */}
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
          Kitchen Directory
        </span>
        <h1 className="font-headline font-black text-3xl sm:text-5xl mt-2 tracking-tight">
          Partner Restaurants<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-secondary mt-3 text-base">
          Precision-packed tiffins and hot meals from certified partner kitchens.
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search kitchens, cuisine, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border-2 border-on-background px-4 py-3 pl-11 font-mono text-sm focus:outline-none focus:border-primary ticket-shadow-sm transition-all"
          />
          <Search className="absolute left-3.5 top-3.5 text-on-surface-variant" size={18} />
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-sm uppercase text-secondary">
          Loading Kitchens...
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow font-mono text-xs text-secondary uppercase max-w-md mx-auto">
          No kitchens found matching "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((rest) => (
            <Link
              key={rest._id}
              to={`/restaurants/${rest._id}`}
              className="group bg-surface-container-lowest border border-on-background transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 ticket-shadow flex flex-col overflow-hidden"
            >
              {/* Image */}
              <div className="h-48 w-full border-b border-on-background overflow-hidden relative bg-surface-container-low">
                <img
                  src={rest.image?.[0]?.url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Open/Closed or Deactivated Badge */}
                <div
                  className={`absolute top-3 right-3 font-mono text-[11px] font-bold uppercase px-2 py-0.5 border border-on-background ${
                    rest.isActive === false
                      ? 'bg-red-600 text-white border-red-700'
                      : rest.isOpen !== false
                      ? 'bg-white text-primary'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {rest.isActive === false
                    ? '✕ DEACTIVATED'
                    : rest.isOpen !== false
                    ? '● OPEN NOW'
                    : '○ CLOSED'}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-background group-hover:text-primary transition-colors">
                    {rest.name}
                  </h2>
                  <p className="font-mono text-xs uppercase tracking-wider text-secondary mt-1">
                    {Array.isArray(rest.cuisine) ? rest.cuisine.join(' • ') : rest.cuisine}
                  </p>
                </div>

                <div className="border-t border-dashed border-outline-variant pt-4 mt-4 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    <span className="truncate max-w-[180px]">{rest.address}</span>
                  </span>
                  <span className="font-bold text-primary uppercase">View Menu →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
