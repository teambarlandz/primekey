'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthInterceptSheet } from '@/components/auth/AuthInterceptSheet';
import { useToast } from '@/components/ui/toast';
import { isUserLoggedIn, toggleFavorite, checkFavorite } from '@/lib/api-client';
import { PropertyMap } from '@/components/map/PropertyMap';
import { InspectionBookingModal } from '@/components/booking/InspectionBookingModal';
import { PropertyInquiryForm } from '@/components/property/PropertyInquiryForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import { BookingSchemaType } from '@/lib/validations/bookingSchema';
import { fetchPropertyDetail, PropertyDetailData } from '@/lib/api-client';

const FALLBACK_IMAGE = '/assets/hero-primekey-homes.jpg';

const formatPrice = (amount: number, propertyType: string) => {
  const formatted = `₦${Math.round(amount).toLocaleString()}`;
  if (propertyType === 'short_let') return `${formatted} / night`;
  return formatted;
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  const loadProperty = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchPropertyDetail(params.id);
      if (response?.data) {
        setProperty(response.data);
        setSelectedImage(0);
      } else {
        setError('This listing could not be loaded.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'This listing could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  // Check favorite status if logged in
  useEffect(() => {
    if (isUserLoggedIn() && params.id) {
      checkFavorite(params.id)
        .then((fav) => setIsFavorited(fav))
        .catch(() => {});
    }
  }, [params.id]);

  const handleProtectedAction = (actionName: string) => {
    setPendingAction(actionName);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    if (pendingAction === 'Save to Favorites') {
      setIsFavorited((prev) => {
        const next = !prev;
        toast(next ? 'Property saved to favorites' : 'Property removed from favorites');
        return next;
      });
    }
  };

  const handleBookingSuccess = (data: BookingSchemaType) => {
    console.log('Inspection tour scheduled successfully:', data);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-secondary/40 py-8 px-4 md:px-8 font-body">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="w-full h-[380px] md:h-[500px] bg-slate-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-secondary/40 py-8 px-4 md:px-8 font-body">
        <div className="max-w-2xl mx-auto mt-20 bg-background p-8 rounded-2xl border border-border text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="font-heading text-xl font-bold text-primary">
            Listing not found
          </h1>
          <p className="text-sm text-muted-foreground">
            {error || 'This property may have been sold, rented, or is no longer available.'}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Search Results
          </Link>
        </div>
      </main>
    );
  }

  const gallery = property.images.length > 0 ? property.images.map((img) => img.image_url) : [FALLBACK_IMAGE];
  const locationLine = [property.address, property.area, property.city, property.state]
    .filter(Boolean)
    .join(', ');
  const amenities = [
    property.is_serviced && 'Serviced Property',
    property.is_furnished && 'Fully Furnished',
    property.is_negotiable && 'Price Negotiable',
    property.is_featured && 'Featured Listing',
  ].filter(Boolean) as string[];
  const priceAmount = typeof property.price === 'string' ? Number(property.price) : property.price;

  return (
    <main className="min-h-screen bg-secondary/40 py-8 px-4 md:px-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Buy & Rent', href: '/search' },
            { label: property.title },
          ]}
        />

        {/* Navigation & Header Controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Search Results
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProtectedAction('Save to Favorites')}
              className="bg-background border-border text-foreground hover:text-rose-600 rounded-xl"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span className="hidden sm:inline">{isFavorited ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="bg-background border-border text-foreground rounded-xl"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative w-full h-[380px] md:h-[500px] bg-muted rounded-2xl overflow-hidden shadow-xs">
            <Image
              src={gallery[selectedImage]}
              alt={property.title}
              fill
              priority
              unoptimized
              className="object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-primary text-primary-foreground font-heading text-xs px-3 py-1 uppercase">
                {property.property_type_display}
              </Badge>
              <Badge className="bg-emerald-600 text-white font-heading text-xs flex items-center gap-1 px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {property.status_display}
              </Badge>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === idx ? 'border-primary scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

          {/* Left Column: Property Information */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Price */}
            <div className="bg-background p-6 rounded-2xl border border-border space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
                  {property.title}
                </h1>
                <div className="text-2xl font-heading font-extrabold text-primary">
                  {formatPrice(priceAmount, property.property_type)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{locationLine}</span>
              </div>
            </div>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-background p-4 rounded-xl border border-border text-center space-y-1">
                <Bed className="w-5 h-5 text-primary mx-auto" />
                <span className="block font-heading text-sm font-bold text-primary">{property.bedrooms} Beds</span>
                <span className="block text-[11px] text-muted-foreground">Bedrooms</span>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border text-center space-y-1">
                <Bath className="w-5 h-5 text-primary mx-auto" />
                <span className="block font-heading text-sm font-bold text-primary">{property.bathrooms} Baths</span>
                <span className="block text-[11px] text-muted-foreground">Bathrooms</span>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border text-center space-y-1">
                <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="block font-heading text-sm font-bold text-primary">{property.toilets}</span>
                <span className="block text-[11px] text-muted-foreground">Toilets</span>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
                <span className="block font-heading text-sm font-bold text-primary">{property.is_serviced ? 'Serviced' : 'Self-Use'}</span>
                <span className="block text-[11px] text-muted-foreground">Management</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-background p-6 rounded-2xl border border-border space-y-3">
              <h2 className="font-heading text-lg font-bold text-primary">About This Property</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {property.description || 'No description provided for this listing.'}
              </p>
            </div>

            {/* Features Checklist */}
            {amenities.length > 0 && (
              <div className="bg-background p-6 rounded-2xl border border-border space-y-4">
                <h2 className="font-heading text-lg font-bold text-primary">Property Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Integration Module */}
            <PropertyMap
              title={property.title}
              location={locationLine}
            />

          </div>

          {/* Right Column: Sticky Inspection Booking Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-6 bg-background p-6 rounded-2xl border border-border shadow-xs space-y-5">

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Listing Price</span>
                <div className="text-2xl font-heading font-extrabold text-primary">
                  {formatPrice(priceAmount, property.property_type)}
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-3">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading h-12 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <Calendar className="w-4 h-4" /> Book Physical Inspection
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleProtectedAction('Contact Agent Directly')}
                  className="w-full border-primary text-primary hover:bg-secondary font-heading h-12 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Contact Managing Agent
                </Button>
              </div>

              {/* Primekey Verified Representative */}
              <div className="border-t border-border/60 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary text-primary font-heading font-bold flex items-center justify-center text-sm">
                  PK
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-primary">Primekey Concierge Team</h4>
                  <p className="text-[11px] text-muted-foreground">Verified & Registered Property</p>
                </div>
              </div>

            </div>

            {/* Buyer Inquiry Form */}
            <PropertyInquiryForm propertyId={property.id} propertyTitle={property.title} />
          </div>

        </div>

        {/* Auth Interception Sheet Component */}
        <AuthInterceptSheet
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          pendingActionName={pendingAction}
          onSuccess={handleAuthSuccess}
        />

        {/* Unit 2.1: Inspection Booking Modal */}
        <InspectionBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          propertyTitle={property.title}
          propertyLocation={locationLine}
          onBookingSuccess={handleBookingSuccess}
        />

      </div>
    </main>
  );
}
