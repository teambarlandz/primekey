export type ListingCategory = 'sale' | 'rent' | 'short_let';

export interface Property {
  id: string;
  title: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  price: number;
  category: ListingCategory;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  imageUrl: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  serviced?: boolean;
}
