'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Building2, Car, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Landmark {
  name: string;
  distance: string;
  driveTime: string;
  category: 'business' | 'transit' | 'recreation';
}

interface PropertyMapProps {
  title: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  landmarks?: Landmark[];
}

const DEFAULT_LANDMARKS: Landmark[] = [
  { name: 'Admiralty Way Hub', distance: '1.2 km', driveTime: '4 mins', category: 'transit' },
  { name: 'Victoria Island CBD', distance: '4.8 km', driveTime: '12 mins', category: 'business' },
  { name: 'Lekki Conservation Centre', distance: '6.5 km', driveTime: '15 mins', category: 'recreation' },
  { name: 'Ikoyi Link Bridge', distance: '3.1 km', driveTime: '8 mins', category: 'transit' },
];

export const PropertyMap: React.FC<PropertyMapProps> = ({
  title,
  location,
  coordinates,
  landmarks = DEFAULT_LANDMARKS,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Simulate dynamic map tile engine initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#04164a] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#04164a]" /> Location & Neighborhood Analytics
          </h2>
          <p className="text-xs text-slate-500 font-body mt-0.5">{location}</p>
        </div>
        <Badge variant="outline" className="w-fit border-[#04164a]/20 text-[#04164a] bg-[#f3f0ff]">
          GPS Verified Location
        </Badge>
      </div>

      {/* Map Surface Viewport */}
      <div className="relative w-full h-[320px] md:h-[380px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        {!isLoaded && !mapError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-slate-400 animate-bounce" />
            <span className="text-xs text-slate-500 font-body font-medium">
              Loading interactive map...
            </span>
          </div>
        )}

        {isLoaded && !mapError && (
          <div className="relative w-full h-full bg-[#e5e9f0] flex items-center justify-center overflow-hidden">
            {/* Styled Map Background Representation */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#04164a_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Road Networks Overlay Simulation */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/2 left-0 right-0 h-12 bg-slate-400 -rotate-12 transform scale-125" />
              <div className="absolute top-0 bottom-0 left-1/3 w-10 bg-slate-400 rotate-45 transform scale-125" />
            </div>

            {/* Pinpoint Custom Marker in Brand Navy */}
            <div className="relative z-10 flex flex-col items-center group cursor-pointer">
              <div className="bg-[#04164a] text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-heading font-bold flex items-center gap-1.5 transition-transform group-hover:-translate-y-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{title.slice(0, 24)}...</span>
              </div>
              <div className="w-4 h-4 bg-[#04164a] rotate-45 -mt-2 rounded-sm shadow-md" />
              <div className="w-8 h-2 bg-black/20 rounded-full blur-xs mt-1" />
            </div>

            {/* Map Controls Floating Badge */}
            {coordinates && (
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-body text-slate-600 flex items-center gap-2 shadow-xs">
                <Navigation className="w-3.5 h-3.5 text-[#04164a]" />
                <span>{coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E</span>
              </div>
            )}
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <MapPin className="w-8 h-8 text-rose-500" />
            <p className="text-xs text-slate-600 font-body">Unable to render map tiles at this moment.</p>
          </div>
        )}
      </div>

      {/* Proximity Metrics Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="font-heading text-xs font-bold text-[#04164a] uppercase tracking-wider">
          Nearby Hubs & Drive Times
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {landmarks.map((hub, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#f3f0ff]/40 hover:bg-[#f3f0ff] transition-colors"
            >
              <div className="space-y-0.5">
                <span className="font-heading text-xs font-semibold text-[#04164a] block">
                  {hub.name}
                </span>
                <span className="text-[11px] text-slate-500 font-body flex items-center gap-1">
                  <Car className="w-3 h-3 text-slate-400" /> {hub.driveTime} drive
                </span>
              </div>
              <Badge className="bg-white border-slate-200 text-[#04164a] font-heading text-[11px]">
                {hub.distance}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
