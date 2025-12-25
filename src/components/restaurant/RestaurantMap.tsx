import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '@/data/mockData';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  selectedId?: string;
  center?: [number, number];
  zoom?: number;
}

// Custom marker icons
const createMarkerIcon = (isByob: boolean, isSelected: boolean) => {
  const color = isByob ? '#22C55E' : '#F59E0B';
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px ${color}66;
        border: 3px solid white;
        transition: all 0.2s ease;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isSelected ? '16px' : '14px'};
        ">${isByob ? '🍾' : '🍸'}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const RestaurantMap = ({
  restaurants,
  onRestaurantSelect,
  selectedId,
  center = [6.9271, 79.8612],
  zoom = 13,
}: RestaurantMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map.current);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map.current);

    setIsMapReady(true);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add markers for each restaurant
    restaurants.forEach(restaurant => {
      const isSelected = restaurant.id === selectedId;
      const marker = L.marker(
        [restaurant.latitude, restaurant.longitude],
        { icon: createMarkerIcon(restaurant.isByob, isSelected) }
      );

      // Create popup content
      const popupContent = `
        <div style="
          padding: 8px;
          min-width: 180px;
          font-family: system-ui, sans-serif;
        ">
          <img 
            src="${restaurant.photos[0]}" 
            alt="${restaurant.name}"
            style="
              width: 100%;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 8px;
            "
          />
          <h3 style="
            font-weight: 600;
            font-size: 14px;
            color: white;
            margin: 0 0 4px 0;
          ">${restaurant.name}</h3>
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #9CA3AF;
          ">
            <span style="
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              background: ${restaurant.isByob ? '#22C55E' : '#F59E0B'};
              color: ${restaurant.isByob ? 'white' : '#1F2937'};
            ">${restaurant.isByob ? 'BYOB' : 'Bar'}</span>
            <span>⭐ ${restaurant.rating}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'dark-popup',
      });

      marker.on('click', () => {
        onRestaurantSelect?.(restaurant);
      });

      marker.addTo(map.current!);
      markersRef.current.set(restaurant.id, marker);
    });

    // If selected, open popup and center
    if (selectedId) {
      const selectedMarker = markersRef.current.get(selectedId);
      const selectedRestaurant = restaurants.find(r => r.id === selectedId);
      if (selectedMarker && selectedRestaurant) {
        map.current.setView(
          [selectedRestaurant.latitude, selectedRestaurant.longitude],
          15,
          { animate: true }
        );
        selectedMarker.openPopup();
      }
    }
  }, [restaurants, selectedId, isMapReady, onRestaurantSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map legend */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3 z-[1000]">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-drink-green" />
            <span className="text-foreground">BYOB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-foreground">Bar/Drinks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
