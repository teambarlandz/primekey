'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Bed,
  Bath,
  ShieldCheck,
  Heart,
  Share2,
  Calendar,
  Phone,
  FileCheck,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthInterceptSheet } from '@/components/auth/AuthInterceptSheet';

// Extended Property Interface for Detail View
interface PropertyDetail {
  id: string;
  title: string;
  location: string;
  city: string;
  state: string;
  price: number;
  category: 'sale' | 'rent' | 'short_let';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  landSize?: string;
  titleDocument: string; // e.g., "Certificate of Occupancy (C of O)", "Governor's Consent"
  description: string;
  features: string[];
  images: string[];
  isVerified: boolean;
  agentName: string;
  agentPhone: string;
}

// Mock Data representing a realistic luxury listing
const MOCK_PROPERTY_DETAIL: PropertyDetail = {
  id: '1',
  title: 'Exquisite 5 Bedroom Fully Detached Duplex with BQ & Swimming Pool',
  location: 'Off Admiralty Way, Lekki Phase 1',
  city: 'Lagos',
  state: 'Lagos',
  price: 350000000,
  category: 'sale',
  propertyType: 'Fully Detached Duplex',
  bedrooms: 5,
  bathrooms: 6,
  toilets: 6,
  landSize: '450 sqm',
  titleDocument: "Certificate of Occupancy (C of O)",
  description:
    'This contemporary masterpiece is built to international standards, situated in a serene and secured neighborhood in Lekki Phase 1. Features high ceilings, fully fitted modern chef kitchen, integrated sound system, private swimming pool, smart home automation, and 24/7 power backup ready.',
  features: [
    'Private Swimming Pool',
    'Smart Home Automation',
    'Fully Fitted Chef Kitchen',
    'BQ (Boys Quarters)',
    'CCTV & Video Doorbell',
    'Ample Parking (4 Cars)',
    '24/7 Security Patrol',
    'Inverter / Solar Ready',
  ],
  images: [
    'https://images.nigeriapropertycentre.com/properties/images/3492303/06a0f994e7b0c7-exquisite-luxury-5-bedroom-fully-detached-duplex-detached-duplexes-for-sale-lekki-lagos.jpg',
    'https://images.nigeriapropertycentre.com/properties/images/3568303/06a538a1a7ffe7-luxury-4-bedroom-terrace-duplex-with-bq-terraced-duplexes-for-sale-lekki-phase-1-lekki-lagos.webp',
  ],
  isVerified: true,
  agentName: 'Adebayo Ogunlesi',
  agentPhone: '+234 802 345 6789',
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = MOCK_PROPERTY_DETAIL;
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (amount: number, category: string) => {
    const formatted = `₦${amount.toLocaleString()}`;
    if (category === 'rent') return `${formatted} / year`;
    if (category === 'short_let') return `${formatted} / night`;
    return formatted;
  };

  const handleProtectedAction = (actionName: string) => {
    setPendingAction(actionName);
    setIsAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f3f0ff] py-8 px-4 md:px-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header Controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#04164a] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Search Results
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProtectedAction('Save to Favorites')}
              className="bg-white border-slate-200 text-slate-700 hover:text-rose-600 rounded-xl"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="bg-white border-slate-200 text-slate-700 rounded-xl"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative w-full h-[380px] md:h-[500px] bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <Image
              src={property.images[selectedImage]}
              alt={property.title}
              fill
              priority
              className="object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-[#04164a] text-white font-heading text-xs px-3 py-1 uppercase">
                For {property.category}
              </Badge>
              {property.isVerified && (
                <Badge className="bg-emerald-600 text-white font-heading text-xs flex items-center gap-1 px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Title
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImage === idx ? 'border-[#04164a] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Left Column: Property Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Price */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#04164a]">
                  {property.title}
                </h1>
                <div className="text-2xl font-heading font-extrabold text-[#04164a]">
                  {formatPrice(property.price, property.category)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{property.location}, {property.city}, {property.state}</span>
              </div>
            </div>

            {/* Visual Interior Highlights */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-bold text-[#04164a] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#04164a]" /> Interior & Architectural Finish
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <Image
                      src="image_agent_tag_8652070550013213110"
                      alt="Luxurious Master Bedroom Interior"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium text-center">Spacious En-suite Master Bedroom</p>
                </div>
                <div className="space-y-2">
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <Image
                      src="image_agent_tag_8652070550013212851"
                      alt="Modern Fitted Chef Kitchen"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium text-center">Fully Fitted Chef Kitchen & Breakfast Bar</p>
                </div>
              </div>
            </div>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <Bed className="w-5 h-5 text-[#04164a] mx-auto" />
                <span className="block font-heading text-sm font-bold text-[#04164a]">{property.bedrooms} Beds</span>
                <span className="block text-[11px] text-slate-500">All En-Suite</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <Bath className="w-5 h-5 text-[#04164a] mx-auto" />
                <span className="block font-heading text-sm font-bold text-[#04164a]">{property.bathrooms} Baths</span>
                <span className="block text-[11px] text-slate-500">+ Visitor's Toilet</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="block font-heading text-sm font-bold text-[#04164a]">Title Doc</span>
                <span className="block text-[11px] text-emerald-700 font-semibold">{property.titleDocument}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#04164a] mx-auto" />
                <span className="block font-heading text-sm font-bold text-[#04164a]">{property.landSize || 'N/A'}</span>
                <span className="block text-[11px] text-slate-500">Land Footprint</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h2 className="font-heading text-lg font-bold text-[#04164a]">About This Property</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="font-heading text-lg font-bold text-[#04164a]">Property Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Inspection Booking Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Listing Price</span>
                <div className="text-2xl font-heading font-extrabold text-[#04164a]">
                  {formatPrice(property.price, property.category)}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <Button
                  onClick={() => handleProtectedAction('Book Physical Tour')}
                  className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-12 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calendar className="w-4 h-4" /> Book Physical Inspection
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleProtectedAction('Contact Agent Directly')}
                  className="w-full border-[#04164a] text-[#04164a] hover:bg-[#f3f0ff] font-heading h-12 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Contact Managing Agent
                </Button>
              </div>

              {/* Agent Representative Card */}
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f0ff] text-[#04164a] font-heading font-bold flex items-center justify-center text-sm">
                  AO
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-[#04164a]">{property.agentName}</h4>
                  <p className="text-[11px] text-slate-500">Primekey Verified Representative</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Auth Interception Sheet Component */}
        <AuthInterceptSheet
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          pendingActionName={pendingAction}
          onSuccess={() => console.log('Action authenticated & executed on Detail Page!')}
        />

      </div>
    </main>
  );
}
