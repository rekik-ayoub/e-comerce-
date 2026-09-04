export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  points: number;
}

export interface Category {
  id: number;
  name_fr: string;
  name_en: string;
  image?: string;
  active: boolean;
  products_count?: number;
}

export interface Product {
  id: number;
  category_id: number;
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  price: number;
  image?: string;
  available: boolean;
  featured: boolean;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'delivered';
  total: number;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  notes?: string;
  points_earned: number;
  created_at: string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface BirthdaySlot {
  id: number;
  date: string;
  time: string;
  max_capacity: number;
  current_bookings: number;
  is_available: boolean;
}

export interface BirthdayMenu {
  id: number;
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  price: number;
  image?: string;
  active: boolean;
}

export interface Reservation {
  id: number;
  user_id: number;
  type: 'table' | 'birthday';
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  birthday_slot_id?: number;
  birthday_menu_id?: number;
  birthday_person_name?: string;
  created_at: string;
  birthday_slot?: BirthdaySlot;
  birthday_menu?: BirthdayMenu;
  user?: User;
}

export interface EventItem {
  id: number;
  title_fr: string;
  title_en: string;
  description_fr?: string;
  description_en?: string;
  event_date: string;
  image?: string;
  active: boolean;
}

export interface Review {
  id: number;
  user_id: number;
  product_id?: number;
  type: 'cafe' | 'product';
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  user?: { id: number; name: string };
  product?: { id: number; name_fr: string; name_en: string };
}

export interface LoyaltyStatus {
  current_points: number;
  target_score: number;
  points_per_order: number;
  percentage: number;
  has_reached: boolean;
  reward_fr: string;
  reward_en: string;
}
