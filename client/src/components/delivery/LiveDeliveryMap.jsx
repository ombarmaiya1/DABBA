import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bike,
  ChefHat,
  MapPin,
  Navigation,
  Phone,
  Maximize2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Compass,
} from 'lucide-react';

// Deterministic coordinate generator based on string (to give distinct realistic coordinates in NCR / Gurugram)
function getAddressCoords(str, baseLat = 28.4925, baseLng = 77.0870) {
  if (!str) return [baseLat, baseLng];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 200) - 100) / 10000;
  const lngOffset = ((Math.abs(hash >> 3) % 200) - 100) / 10000;
  return [baseLat + latOffset, baseLng + lngOffset];
}

// Haversine formula to compute distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function LiveDeliveryMap({ order, riderLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const restaurantMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [etaMinutes, setEtaMinutes] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  // Derive coordinates
  const restaurantCoords = getAddressCoords(
    order?.restaurant?.name || order?.restaurant?.address || 'Restaurant',
    28.4980,
    77.0850
  );
  const customerCoords = getAddressCoords(
    order?.deliveryAddress || 'Customer',
    28.4840,
    77.0990
  );

  // Active rider coordinate: prioritize real-time socket coordinate, fallback to status-based position
  const currentRiderCoords = riderLocation?.latitude && riderLocation?.longitude
    ? [riderLocation.latitude, riderLocation.longitude]
    : order?.status === 'delivered'
    ? customerCoords
    : order?.status === 'out_for_delivery'
    ? [
        (restaurantCoords[0] + customerCoords[0]) / 2,
        (restaurantCoords[1] + customerCoords[1]) / 2,
      ]
    : restaurantCoords;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Create Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(currentRiderCoords, 14);

    mapRef.current = map;

    // Use OpenStreetMap CartoDB Positron / OSM tiles for clean high-contrast map style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Icon Creators using pure HTML divIcons (100% immune to asset 404s)
    const createRestaurantIcon = () =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                <line x1="6" y1="17" x2="18" y2="17"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 whitespace-nowrap bg-black/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              Kitchen
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

    const createCustomerIcon = () =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 whitespace-nowrap bg-black/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              Destination
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

    const createRiderIcon = () =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-12 h-12 rounded-full bg-primary/40 animate-ping"></span>
            <div class="relative w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl border-2 border-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="15" cy="5" r="1"/>
                <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 whitespace-nowrap bg-primary text-white font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
              Live Rider
            </span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

    // Add Restaurant Marker
    restaurantMarkerRef.current = L.marker(restaurantCoords, {
      icon: createRestaurantIcon(),
    })
      .addTo(map)
      .bindPopup(
        `<div class="font-sans text-xs"><strong>${order?.restaurant?.name || 'Kitchen'}</strong><br/>Pickup location</div>`
      );

    // Add Customer Marker
    customerMarkerRef.current = L.marker(customerCoords, {
      icon: createCustomerIcon(),
    })
      .addTo(map)
      .bindPopup(
        `<div class="font-sans text-xs"><strong>Your Delivery Address</strong><br/>${order?.deliveryAddress}</div>`
      );

    // Add Rider Marker
    riderMarkerRef.current = L.marker(currentRiderCoords, {
      icon: createRiderIcon(),
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(
        `<div class="font-sans text-xs"><strong>${order?.rider?.fullName || 'Assigned Rider'}</strong><br/>Live GPS Location</div>`
      );

    // Draw Route Polyline
    routeLineRef.current = L.polyline([restaurantCoords, currentRiderCoords, customerCoords], {
      color: '#b02d15',
      weight: 4,
      opacity: 0.75,
      dashArray: '8, 8',
    }).addTo(map);

    // Fit map bounds to view all points comfortably
    const bounds = L.latLngBounds([restaurantCoords, customerCoords, currentRiderCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Handle container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Rider Marker position and route line dynamically when coordinates change
  useEffect(() => {
    if (!mapRef.current || !riderMarkerRef.current) return;

    const newLatLng = L.latLng(currentRiderCoords[0], currentRiderCoords[1]);
    riderMarkerRef.current.setLatLng(newLatLng);

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([restaurantCoords, newLatLng, customerCoords]);
    }

    // Calculate distance and ETA to customer
    const dist = calculateDistance(
      currentRiderCoords[0],
      currentRiderCoords[1],
      customerCoords[0],
      customerCoords[1]
    );
    setDistanceKm(dist);

    // Approx 25 km/h urban speed -> minutes = (dist / 25) * 60
    const minutes = Math.max(2, Math.round((parseFloat(dist) / 25) * 60));
    setEtaMinutes(minutes);
  }, [currentRiderCoords[0], currentRiderCoords[1], customerCoords[0], customerCoords[1]]);

  // Recenter map button handler
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const bounds = L.latLngBounds([
      restaurantCoords,
      customerCoords,
      [currentRiderCoords[0], currentRiderCoords[1]],
    ]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const isDelivered = order?.status === 'delivered';
  const isOutForDelivery = order?.status === 'out_for_delivery';
  const hasLiveGps = !!riderLocation?.latitude;

  return (
    <div className="w-full bg-surface-container-lowest border-2 border-on-background ticket-shadow overflow-hidden my-6">
      {/* Top Map Status Banner */}
      <div className="p-4 bg-surface-container border-b-2 border-on-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isDelivered
                ? 'bg-green-600'
                : hasLiveGps
                ? 'bg-green-500 animate-ping'
                : 'bg-primary animate-pulse'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-primary tracking-wider">
                {isDelivered
                  ? 'Delivery Completed'
                  : isOutForDelivery
                  ? 'Rider En Route (Live Radar)'
                  : 'Kitchen Dispatch Tracker'}
              </span>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border border-on-background bg-surface-container-high">
                {order?.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="font-body text-xs text-secondary mt-0.5">
              {isDelivered ? (
                <span className="text-green-700 dark:text-green-300 font-bold">
                  ✓ Order reached destination • GPS tracking terminated
                </span>
              ) : hasLiveGps ? (
                <span>
                  Receiving continuous real-time GPS stream from rider's device
                </span>
              ) : (
                <span>
                  Tracking order fulfillment path between kitchen and destination
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Recenter */}
        <div className="flex items-center gap-2">
          {order?.rider?.phone && (
            <a
              href={`tel:${order.rider.phone}`}
              className="flex items-center gap-1.5 bg-surface-container-high border border-on-background px-3 py-1 font-mono text-xs font-bold uppercase text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <Phone size={12} className="text-primary" />
              Call Rider
            </a>
          )}
          <button
            onClick={handleRecenter}
            title="Recenter and zoom to show full route"
            className="flex items-center gap-1 bg-surface-container-lowest border border-on-background px-3 py-1 font-mono text-xs font-bold uppercase hover:bg-surface-container-high transition-colors"
          >
            <Maximize2 size={12} />
            Fit Map
          </button>
        </div>
      </div>

      {/* The Leaflet Map Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] sm:h-[420px] bg-surface-dim z-0"
        />

        {/* Floating ETA & Distance Card */}
        <div className="absolute top-4 left-4 z-[500] bg-surface-container-lowest/95 backdrop-blur-sm border-2 border-on-background p-3.5 ticket-shadow-sm max-w-[260px]">
          <div className="flex items-center gap-2 border-b border-dashed border-outline-variant pb-2 mb-2">
            <Bike size={18} className="text-primary shrink-0" />
            <div>
              <p className="font-headline font-bold text-sm leading-tight text-on-background">
                {order?.rider?.fullName || 'Assigned Fleet Rider'}
              </p>
              <p className="font-mono text-[10px] text-secondary">
                {order?.rider?.phone || 'Contact available upon dispatch'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-surface-container-low p-2 border border-outline-variant/60">
              <span className="font-mono text-[9px] uppercase tracking-wider text-secondary block">
                Distance
              </span>
              <span className="font-mono text-sm font-black text-primary">
                {isDelivered ? '0.0 km' : distanceKm ? `${distanceKm} km` : '~1.5 km'}
              </span>
            </div>

            <div className="bg-surface-container-low p-2 border border-outline-variant/60">
              <span className="font-mono text-[9px] uppercase tracking-wider text-secondary block">
                Est. Time
              </span>
              <span className="font-mono text-sm font-black text-on-surface">
                {isDelivered ? 'Arrived' : etaMinutes ? `${etaMinutes} mins` : '10-15m'}
              </span>
            </div>
          </div>

          {riderLocation?.updatedAt && (
            <p className="font-mono text-[9px] text-secondary text-center mt-2 flex items-center justify-center gap-1">
              <Clock size={10} />
              GPS Ping:{' '}
              {new Date(riderLocation.updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* Floating Legend Badge */}
        <div className="absolute bottom-4 right-4 z-[500] bg-surface-container-lowest/95 backdrop-blur-sm border border-on-background px-3 py-2 text-[10px] font-mono flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            Kitchen
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            Rider
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block"></span>
            Dropoff
          </span>
        </div>
      </div>

      {/* Map Bottom Delivery Highlights */}
      <div className="p-3 bg-surface-bright border-t border-dashed border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
        <div className="flex items-start gap-2">
          <ChefHat size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-mono uppercase text-[10px] text-secondary block">
              Pickup From Kitchen:
            </strong>
            <span className="text-on-surface font-medium">
              {order?.restaurant?.name || 'Partner Kitchen'} (
              {order?.restaurant?.address || 'Address on file'})
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-red-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-mono uppercase text-[10px] text-secondary block">
              Drop-off Destination:
            </strong>
            <span className="text-on-surface font-medium">
              {order?.deliveryAddress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
