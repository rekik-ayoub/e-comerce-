import { Component, OnInit, AfterViewInit, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CelebrationModalComponent } from '../../shared/components/celebration-modal.component';
import * as L from 'leaflet';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, CelebrationModalComponent],
  template: `
    <div class="container-bayou py-12">
      <h1 class="font-serif text-3xl md:text-4xl font-bold text-burgundy mb-8">
        <i class="bi bi-bag-check text-gold"></i> {{ ts.translate('cart.title') }}
      </h1>

      <div *ngIf="api.cart().length === 0" class="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto">
        <i class="bi bi-cup-hot text-5xl text-beige-light"></i>
        <h3 class="font-serif font-bold text-xl text-burgundy mt-4">{{ ts.translate('cart.empty') }}</h3>
        <p class="text-sm text-muted-custom mt-2">Découvrez nos cafés gourmands et ajoutez-les à votre commande.</p>
        <div class="mt-6">
          <a routerLink="/catalog" class="btn-bayou-gold py-2.5 px-6 text-sm">Parcourir la carte</a>
        </div>
      </div>

      <div *ngIf="api.cart().length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Cart Items (Col 7) -->
        <div class="lg:col-span-7 space-y-4">
          <div *ngFor="let item of api.cart()" class="glass-card rounded-2xl p-4 flex items-center gap-4">
            <img [src]="item.product.image" [alt]="ts.getField(item.product, 'name')" class="w-20 h-20 object-cover rounded-xl shadow-sm" />

            <div class="flex-grow">
              <h4 class="font-serif font-bold text-base text-burgundy">{{ ts.getField(item.product, 'name') }}</h4>
              <div class="text-sm font-semibold text-gold mt-0.5">
                {{ item.product.price | number:'1.2-2' }} DT
              </div>
            </div>

            <!-- Quantity controls -->
            <div class="flex items-center gap-3 bg-bayou-cream-soft px-3 py-1.5 rounded-full border border-beige-mid">
              <button (click)="api.updateQuantity(item.product.id, item.quantity - 1)" class="text-burgundy hover:text-gold font-bold">
                <i class="bi bi-dash"></i>
              </button>
              <span class="text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
              <button (click)="api.updateQuantity(item.product.id, item.quantity + 1)" class="text-burgundy hover:text-gold font-bold">
                <i class="bi bi-plus"></i>
              </button>
            </div>

            <div class="text-right min-w-[70px]">
              <div class="font-bold text-burgundy font-serif">
                {{ (item.product.price * item.quantity) | number:'1.2-2' }} DT
              </div>
              <button (click)="api.removeFromCart(item.product.id)" class="text-xs text-red-500 hover:underline mt-1">
                Supprimer
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2">
            <button (click)="api.clearCart()" class="text-xs text-muted-custom hover:text-burgundy">
              <i class="bi bi-trash"></i> Vider le panier
            </button>
            <div class="text-xs font-semibold text-gold">
              <i class="bi bi-gift-fill"></i> Cette commande vous rapportera <strong>+10 points de fidélité</strong> !
            </div>
          </div>
        </div>

        <!-- Order & GPS Delivery Form (Col 5) -->
        <div class="lg:col-span-5">
          <div class="glass-card rounded-2xl p-6 space-y-6">
            <h3 class="font-serif font-bold text-xl text-burgundy border-b border-beige-mid pb-3">
              Informations de Livraison
            </h3>

            <!-- Order Total summary -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-muted-custom">
                <span>Sous-total articles :</span>
                <span>{{ api.cartTotal() | number:'1.2-2' }} DT</span>
              </div>
              <div class="flex justify-between text-muted-custom">
                <span>Livraison :</span>
                <span class="text-green-600 font-semibold">Offerte (Lounge Bay)</span>
              </div>
              <div class="flex justify-between text-base font-bold text-burgundy pt-2 border-t border-beige-mid">
                <span>Total à régler :</span>
                <span class="text-xl font-serif text-gold">{{ api.cartTotal() | number:'1.2-2' }} DT</span>
              </div>
              <div class="text-[11px] text-muted-custom italic">
                * Règlement à la livraison en espèces ou par carte bancaire.
              </div>
            </div>

            <!-- GPS Picker & Address -->
            <div class="space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-burgundy">
                {{ ts.translate('cart.delivery_address') }}
              </label>

              <!-- Locate Me Button -->
              <button
                type="button"
                (click)="getCurrentLocation()"
                [disabled]="locating()"
                class="w-full py-2 px-3 rounded-xl border border-gold text-burgundy bg-bayou-gold-light/40 hover:bg-bayou-gold-light text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <i class="bi" [class.bi-geo-alt-fill]="!locating()" [class.bi-arrow-repeat]="locating()" [class.animate-spin]="locating()"></i>
                <span>{{ locating() ? 'Recherche GPS en cours...' : ts.translate('cart.get_gps') }}</span>
              </button>

              <!-- Leaflet Map Container -->
              <div id="map-container" class="w-full h-44 rounded-xl border border-beige-mid overflow-hidden shadow-inner"></div>

              <div *ngIf="deliveryLat() && deliveryLng()" class="text-[11px] text-muted-custom flex items-center gap-1 font-mono">
                <i class="bi bi-pin-map text-gold"></i>
                <span>Coordonnées : {{ deliveryLat()?.toFixed(5) }}, {{ deliveryLng()?.toFixed(5) }}</span>
              </div>

              <div>
                <input
                  type="text"
                  [(ngModel)]="deliveryAddress"
                  placeholder="Rue, numéro de porte, quartier..."
                  class="w-full p-2.5 rounded-xl border border-beige-mid bg-white text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <textarea
                  [(ngModel)]="orderNotes"
                  rows="2"
                  [placeholder]="ts.translate('cart.notes')"
                  class="w-full p-2.5 rounded-xl border border-beige-mid bg-white text-xs focus:outline-none focus:border-gold"
                ></textarea>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                *ngIf="auth.isLoggedIn()"
                (click)="submitOrder()"
                [disabled]="submitting()"
                class="btn-bayou-gold w-full py-3 text-sm font-bold"
              >
                <i class="bi" [class.bi-bag-check-fill]="!submitting()" [class.bi-arrow-repeat]="submitting()" [class.animate-spin]="submitting()"></i>
                <span>{{ submitting() ? 'Traitement en cours...' : ts.translate('cart.checkout') }}</span>
              </button>

              <div *ngIf="!auth.isLoggedIn()" class="space-y-2">
                <p class="text-xs text-center text-muted-custom">
                  Connectez-vous pour finaliser la commande et cumuler vos points !
                </p>
                <a routerLink="/auth/login" class="btn-bayou-burgundy w-full py-2.5 text-xs text-center block">
                  Se connecter pour commander
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CELEBRATION MODAL (ON TARGET REACHED) -->
      <app-celebration-modal
        [show]="showCelebrationModal()"
        [message]="celebrationMessage()"
        (close)="onModalClose()"
      ></app-celebration-modal>
    </div>
  `,
  styles: [`
    #map-container {
      z-index: 1;
    }
  `]
})
export class CartComponent implements OnInit, AfterViewInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);

  deliveryAddress: string = '';
  deliveryLat = signal<number | null>(null);
  deliveryLng = signal<number | null>(null);
  orderNotes: string = '';

  submitting = signal<boolean>(false);
  locating = signal<boolean>(false);

  showCelebrationModal = signal<boolean>(false);
  celebrationMessage = signal<string>('');

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit() {
    // Default initial coordinates (Paris / Lounge City)
    this.deliveryLat.set(48.8566);
    this.deliveryLng.set(2.3522);
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 200);
  }

  initMap() {
    const el = document.getElementById('map-container');
    if (!el) return;

    const lat = this.deliveryLat() || 48.8566;
    const lng = this.deliveryLng() || 2.3522;

    this.map = L.map('map-container').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker!.getLatLng();
      this.deliveryLat.set(pos.lat);
      this.deliveryLng.set(pos.lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker?.setLatLng(e.latlng);
      this.deliveryLat.set(e.latlng.lat);
      this.deliveryLng.set(e.latlng.lng);
    });
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.deliveryLat.set(lat);
        this.deliveryLng.set(lng);
        this.locating.set(false);

        if (this.map && this.marker) {
          this.map.setView([lat, lng], 16);
          this.marker.setLatLng([lat, lng]);
        }
      },
      err => {
        this.locating.set(false);
        alert('Impossible de récupérer votre position GPS. Vous pouvez déplacer le repère sur la carte.');
      },
      { timeout: 10000 }
    );
  }

  submitOrder() {
    if (this.api.cart().length === 0) return;

    this.submitting.set(true);

    const payload = {
      items: this.api.cart().map(i => ({
        product_id: i.product.id,
        quantity: i.quantity
      })),
      delivery_address: this.deliveryAddress,
      delivery_lat: this.deliveryLat(),
      delivery_lng: this.deliveryLng(),
      notes: this.orderNotes
    };

    this.api.createOrder(payload).subscribe({
      next: res => {
        this.submitting.set(false);
        this.api.clearCart();

        if (res.current_points !== undefined) {
          this.auth.updatePoints(res.current_points);
        }

        // Check if loyalty target reached
        if (res.reached_target) {
          const reward = this.ts.currentLang() === 'fr'
            ? (res.reward_info?.fr || 'Félicitations ! Un café offert !')
            : (res.reward_info?.en || 'Congratulations! Free coffee unlocked!');

          this.celebrationMessage.set(reward);
          this.showCelebrationModal.set(true);

          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#D9B061', '#3F0D0C', '#D9C4A9', '#FDFAF6']
          });
        } else {
          alert('Commande passée avec succès ! Règlement à la livraison.');
          this.router.navigate(['/profile']);
        }
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur lors de la commande : ' + (err.error?.message || 'Veuillez réessayer.'));
      }
    });
  }

  onModalClose() {
    this.showCelebrationModal.set(false);
    this.router.navigate(['/profile']);
  }
}
