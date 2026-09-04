import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category,
  Product,
  Order,
  Reservation,
  BirthdaySlot,
  BirthdayMenu,
  EventItem,
  Review,
  LoyaltyStatus,
  CartItem
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  // Reactive Cart state
  cart = signal<CartItem[]>([]);

  cartCount = computed(() =>
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  cartTotal = computed(() =>
    this.cart().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  constructor(private http: HttpClient) {
    const savedCart = localStorage.getItem('bayou_cart');
    if (savedCart) {
      try {
        this.cart.set(JSON.parse(savedCart));
      } catch (e) {}
    }
  }

  // Cart actions
  addToCart(product: Product, quantity: number = 1) {
    const current = [...this.cart()];
    const index = current.findIndex(item => item.product.id === product.id);

    if (index > -1) {
      current[index].quantity += quantity;
    } else {
      current.push({ product, quantity });
    }

    this.cart.set(current);
    localStorage.setItem('bayou_cart', JSON.stringify(current));
  }

  removeFromCart(productId: number) {
    const current = this.cart().filter(item => item.product.id !== productId);
    this.cart.set(current);
    localStorage.setItem('bayou_cart', JSON.stringify(current));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const current = this.cart().map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cart.set(current);
    localStorage.setItem('bayou_cart', JSON.stringify(current));
  }

  clearCart() {
    this.cart.set([]);
    localStorage.removeItem('bayou_cart');
  }

  // Catalog API
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getProducts(params?: any): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Orders API
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, orderData);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  // Reservations API
  getBirthdaySlots(): Observable<BirthdaySlot[]> {
    return this.http.get<BirthdaySlot[]>(`${this.apiUrl}/birthday-slots`);
  }

  getBirthdayMenus(): Observable<BirthdayMenu[]> {
    return this.http.get<BirthdayMenu[]>(`${this.apiUrl}/birthday-menus`);
  }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservations`, reservationData);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`);
  }

  // Events, Reviews, Contact, Loyalty API
  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.apiUrl}/events`);
  }

  getReviews(params?: any): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`, { params });
  }

  submitReview(reviewData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews`, reviewData);
  }

  submitContact(contactData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contact`, contactData);
  }

  getLoyaltyStatus(): Observable<LoyaltyStatus> {
    return this.http.get<LoyaltyStatus>(`${this.apiUrl}/loyalty`);
  }

  // Admin API
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/products`);
  }

  createAdminProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, product);
  }

  updateAdminProduct(id: number, product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}`, product);
  }

  deleteAdminProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/products/${id}`);
  }

  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/orders/${orderId}/status`, { status });
  }

  getAdminReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/admin/reservations`);
  }

  updateReservationStatus(resId: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/reservations/${resId}/status`, { status });
  }

  getAdminLoyaltySettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/loyalty-settings`);
  }

  updateAdminLoyaltySettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/loyalty-settings`, settings);
  }

  getAdminCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/customers`);
  }

  getAdminReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/admin/reviews`);
  }

  toggleReviewApproval(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/reviews/${id}/toggle`, {});
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/reviews/${id}`);
  }

  getAdminContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/contacts`);
  }
}
