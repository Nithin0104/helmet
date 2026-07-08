export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface SizeOption {
  id: string;
  label: string;
  available: boolean;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified?: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  tagline?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  description?: string;
  highlights?: string[];
  colors?: ColorOption[];
  sizes?: SizeOption[];
  views?: string[];
  specs?: Spec[];
  faqs?: Faq[];
  reviews?: Review[];
}
