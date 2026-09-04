import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { Product, Category, Order, Reservation, BirthdaySlot, BirthdayMenu, EventItem, Review } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-bayou py-10">
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-beige-mid mb-8 gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-gold">Espace d'Administration</span>
          <h1 class="font-serif font-bold text-3xl text-burgundy">Panneau de Contrôle Le Bayou</h1>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs bg-bayou-burgundy text-white px-3 py-1 rounded-full font-semibold">
            <i class="bi bi-shield-check"></i> Connecté en Administrateur
          </span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 mb-8 bg-bayou-cream-soft p-2 rounded-2xl border border-beige-mid">
        <button (click)="tab.set('stats')" [class.active]="tab() === 'stats'" class="admin-tab">
          <i class="bi bi-speedometer2"></i> Tableau de bord
        </button>
        <button (click)="tab.set('orders')" [class.active]="tab() === 'orders'" class="admin-tab">
          <i class="bi bi-bag-check"></i> Commandes & Livraisons
        </button>
        <button (click)="tab.set('reservations')" [class.active]="tab() === 'reservations'" class="admin-tab">
          <i class="bi bi-calendar2-heart"></i> Réservations & Anniversaires
        </button>
        <button (click)="tab.set('products')" [class.active]="tab() === 'products'" class="admin-tab">
          <i class="bi bi-cup-hot"></i> Produits & Carte
        </button>
        <button (click)="tab.set('birthday_slots')" [class.active]="tab() === 'birthday_slots'" class="admin-tab">
          <i class="bi bi-cake2"></i> Créneaux Anniversaire
        </button>
        <button (click)="tab.set('events')" [class.active]="tab() === 'events'" class="admin-tab">
          <i class="bi bi-calendar-event"></i> Événements
        </button>
        <button (click)="tab.set('reviews')" [class.active]="tab() === 'reviews'" class="admin-tab">
          <i class="bi bi-star"></i> Avis Clients
        </button>
        <button (click)="tab.set('loyalty')" [class.active]="tab() === 'loyalty'" class="admin-tab">
          <i class="bi bi-gift"></i> Programme Fidélité
        </button>
      </div>

      <!-- 1. STATS OVERVIEW -->
      <div *ngIf="tab() === 'stats'" class="space-y-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-6 rounded-2xl">
            <div class="text-xs text-muted-custom font-bold uppercase">Total Commandes</div>
            <div class="text-3xl font-serif font-bold text-burgundy mt-2">{{ stats()?.total_orders || 0 }}</div>
            <div class="text-xs text-gold mt-1">{{ stats()?.pending_orders || 0 }} en attente de livraison</div>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <div class="text-xs text-muted-custom font-bold uppercase">Chiffre d'Affaires</div>
            <div class="text-3xl font-serif font-bold text-burgundy mt-2">{{ (stats()?.total_revenue || 0) | currency:'EUR':'symbol':'1.2-2' }}</div>
            <div class="text-xs text-green-700 mt-1">Paiements validés</div>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <div class="text-xs text-muted-custom font-bold uppercase">Clients Enregistrés</div>
            <div class="text-3xl font-serif font-bold text-burgundy mt-2">{{ stats()?.total_customers || 0 }}</div>
            <div class="text-xs text-muted-custom mt-1">Cumulant des points</div>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <div class="text-xs text-muted-custom font-bold uppercase">Réservations en attente</div>
            <div class="text-3xl font-serif font-bold text-burgundy mt-2">{{ stats()?.pending_reservations || 0 }}</div>
            <div class="text-xs text-gold mt-1">Tables & Anniversaires</div>
          </div>
        </div>
      </div>

      <!-- 2. ORDERS MANAGEMENT -->
      <div *ngIf="tab() === 'orders'" class="space-y-4">
        <h3 class="font-serif font-bold text-xl text-burgundy">Gestion des Commandes & Livraisons</h3>

        <div class="overflow-x-auto glass-card rounded-2xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-bayou-cream-soft text-burgundy font-bold uppercase border-b border-beige-mid">
              <tr>
                <th class="p-3.5">ID</th>
                <th class="p-3.5">Client & Contact</th>
                <th class="p-3.5">Articles</th>
                <th class="p-3.5">Total</th>
                <th class="p-3.5">Adresse & Coordonnées GPS</th>
                <th class="p-3.5">Statut Actuel</th>
                <th class="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-beige-mid/40">
              <tr *ngFor="let ord of adminOrders()">
                <td class="p-3.5 font-bold">#{{ ord.id }}</td>
                <td class="p-3.5">
                  <strong class="text-burgundy block">{{ ord.user?.name }}</strong>
                  <span class="text-muted-custom">{{ ord.user?.phone || ord.user?.email }}</span>
                </td>
                <td class="p-3.5">
                  <div *ngFor="let item of ord.items">
                    {{ item.quantity }}x {{ item.product?.name_fr }}
                  </div>
                </td>
                <td class="p-3.5 font-serif font-bold text-sm text-burgundy">
                  {{ ord.total | currency:'EUR':'symbol':'1.2-2' }}
                </td>
                <td class="p-3.5 max-w-xs">
                  <div>{{ ord.delivery_address || 'Sur place' }}</div>
                  <div *ngIf="ord.delivery_lat" class="font-mono text-[10px] text-gold mt-0.5">
                    Lat: {{ ord.delivery_lat }}, Lng: {{ ord.delivery_lng }}
                  </div>
                </td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-full font-bold uppercase text-[10px]" [ngClass]="{
                    'bg-yellow-100 text-yellow-800': ord.status === 'pending',
                    'bg-blue-100 text-blue-800': ord.status === 'accepted' || ord.status === 'preparing',
                    'bg-green-100 text-green-800': ord.status === 'delivered',
                    'bg-red-100 text-red-800': ord.status === 'rejected'
                  }">
                    {{ ord.status }}
                  </span>
                </td>
                <td class="p-3.5">
                  <div class="flex gap-1.5">
                    <button *ngIf="ord.status === 'pending'" (click)="updateOrderStatus(ord.id, 'accepted')" class="btn-action bg-blue-600 text-white" title="Accepter la livraison">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button *ngIf="ord.status === 'accepted'" (click)="updateOrderStatus(ord.id, 'delivered')" class="btn-action bg-green-600 text-white" title="Marquer comme Livré">
                      <i class="bi bi-truck"></i>
                    </button>
                    <button *ngIf="ord.status === 'pending'" (click)="updateOrderStatus(ord.id, 'rejected')" class="btn-action bg-red-600 text-white" title="Refuser">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. RESERVATIONS MANAGEMENT -->
      <div *ngIf="tab() === 'reservations'" class="space-y-4">
        <h3 class="font-serif font-bold text-xl text-burgundy">Gestion des Réservations</h3>

        <div class="overflow-x-auto glass-card rounded-2xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-bayou-cream-soft text-burgundy font-bold uppercase border-b border-beige-mid">
              <tr>
                <th class="p-3.5">Type</th>
                <th class="p-3.5">Client</th>
                <th class="p-3.5">Date & Heure</th>
                <th class="p-3.5">Invités / Formule</th>
                <th class="p-3.5">Statut</th>
                <th class="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-beige-mid/40">
              <tr *ngFor="let res of adminReservations()">
                <td class="p-3.5">
                  <span class="font-bold" [class.text-gold]="res.type === 'birthday'">
                    {{ res.type === 'birthday' ? '🎂 Anniversaire' : '☕ Table' }}
                  </span>
                </td>
                <td class="p-3.5">
                  <strong class="text-burgundy block">{{ res.user?.name }}</strong>
                  <span class="text-muted-custom">{{ res.user?.phone }}</span>
                </td>
                <td class="p-3.5">{{ res.date | date:'mediumDate' }} à {{ res.time }}</td>
                <td class="p-3.5">
                  <div>{{ res.guests }} personnes</div>
                  <div *ngIf="res.birthday_person_name" class="text-gold font-bold">Fêté(e): {{ res.birthday_person_name }}</div>
                  <div *ngIf="res.birthday_menu" class="text-muted-custom">{{ res.birthday_menu.name_fr }}</div>
                </td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-full font-bold uppercase text-[10px]" [ngClass]="{
                    'bg-yellow-100 text-yellow-800': res.status === 'pending',
                    'bg-green-100 text-green-800': res.status === 'confirmed',
                    'bg-red-100 text-red-800': res.status === 'rejected'
                  }">
                    {{ res.status }}
                  </span>
                </td>
                <td class="p-3.5">
                  <div class="flex gap-1.5">
                    <button *ngIf="res.status === 'pending'" (click)="updateReservationStatus(res.id, 'confirmed')" class="btn-action bg-green-600 text-white" title="Confirmer">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button *ngIf="res.status === 'pending'" (click)="updateReservationStatus(res.id, 'rejected')" class="btn-action bg-red-600 text-white" title="Refuser">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. PRODUCTS CRUD -->
      <div *ngIf="tab() === 'products'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-serif font-bold text-xl text-burgundy">Catalogue Produits</h3>
          <button (click)="showNewProductForm.set(!showNewProductForm())" class="btn-bayou-gold text-xs py-2 px-4">
            <i class="bi bi-plus-lg"></i> Ajouter un Produit
          </button>
        </div>

        <!-- New product form modal/strip -->
        <div *ngIf="showNewProductForm()" class="glass-card p-6 rounded-2xl border border-gold/50 space-y-4">
          <h4 class="font-bold text-burgundy text-sm">Nouveau Produit</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <input type="text" [(ngModel)]="newProd.name_fr" placeholder="Nom (FR) *" class="p-2 border rounded-lg" />
            <input type="text" [(ngModel)]="newProd.name_en" placeholder="Nom (EN) *" class="p-2 border rounded-lg" />
            <input type="number" [(ngModel)]="newProd.price" placeholder="Prix (€) *" class="p-2 border rounded-lg" />
            <select [(ngModel)]="newProd.category_id" class="p-2 border rounded-lg">
              <option [ngValue]="1">Cafés & Espressos</option>
              <option [ngValue]="2">Boissons Fraîches</option>
              <option [ngValue]="3">Pâtisseries</option>
              <option [ngValue]="4">Grains & Merch</option>
            </select>
            <input type="text" [(ngModel)]="newProd.image" placeholder="URL Image" class="p-2 border rounded-lg" />
            <input type="text" [(ngModel)]="newProd.description_fr" placeholder="Description courte (FR)" class="p-2 border rounded-lg" />
          </div>
          <button (click)="saveProduct()" class="btn-bayou-burgundy text-xs py-2 px-6">Enregistrer</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let p of adminProducts()" class="glass-card p-4 rounded-xl flex items-center gap-4">
            <img [src]="p.image" class="w-16 h-16 object-cover rounded-lg" />
            <div class="flex-grow text-xs">
              <strong class="text-burgundy block font-serif text-sm">{{ p.name_fr }}</strong>
              <span class="text-gold font-bold">{{ p.price }} €</span> &bull; 
              <span class="text-muted-custom">{{ p.category?.name_fr }}</span>
            </div>
            <button (click)="deleteProduct(p.id)" class="text-red-600 hover:text-red-800 p-2" title="Supprimer">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 5. BIRTHDAY SLOTS MANAGEMENT -->
      <div *ngIf="tab() === 'birthday_slots'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-serif font-bold text-xl text-burgundy">Créneaux Anniversaire Disponibles</h3>
          <div class="flex gap-2">
            <input type="date" [(ngModel)]="newSlotDate" class="text-xs p-2 border rounded-lg" />
            <select [(ngModel)]="newSlotTime" class="text-xs p-2 border rounded-lg">
              <option value="14:30:00">14:30</option>
              <option value="17:00:00">17:00</option>
              <option value="19:30:00">19:30</option>
            </select>
            <button (click)="addBirthdaySlot()" class="btn-bayou-gold text-xs py-2 px-4">
              Ajouter Créneau
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div *ngFor="let slot of adminSlots()" class="glass-card p-3 rounded-xl text-center text-xs relative">
            <button (click)="deleteBirthdaySlot(slot.id)" class="absolute top-1 right-1 text-red-500 hover:text-red-700">
              <i class="bi bi-x"></i>
            </button>
            <div class="font-bold text-burgundy">{{ slot.date | date:'EEE d MMM' }}</div>
            <div class="font-serif font-bold text-gold mt-1">{{ slot.time.substring(0, 5) }}</div>
            <span class="text-[10px] block mt-1" [class.text-green-600]="slot.is_available" [class.text-red-600]="!slot.is_available">
              {{ slot.is_available ? 'Disponible' : 'Complet' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 6. REVIEWS MODERATION -->
      <div *ngIf="tab() === 'reviews'" class="space-y-4">
        <h3 class="font-serif font-bold text-xl text-burgundy">Modération des Avis</h3>

        <div class="space-y-3">
          <div *ngFor="let rev of adminReviews()" class="glass-card p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div>
              <div class="flex items-center gap-2">
                <strong class="text-burgundy">{{ rev.user?.name || 'Client' }}</strong>
                <span class="text-gold font-bold">★ {{ rev.rating }}/5</span>
                <span class="text-muted-custom">&bull; {{ rev.type === 'cafe' ? 'Lounge' : 'Produit' }}</span>
              </div>
              <p class="text-muted-custom mt-1">"{{ rev.comment }}"</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleReview(rev.id)"
                class="px-3 py-1 rounded-full font-bold text-[11px]"
                [class.bg-green-100]="rev.approved"
                [class.text-green-800]="rev.approved"
                [class.bg-yellow-100]="!rev.approved"
                [class.text-yellow-800]="!rev.approved"
              >
                {{ rev.approved ? 'Approuvé (Visible)' : 'En attente (Masqué)' }}
              </button>

              <button (click)="deleteReview(rev.id)" class="text-red-600 hover:text-red-800 p-1">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. LOYALTY SETTINGS -->
      <div *ngIf="tab() === 'loyalty'" class="max-w-xl mx-auto glass-card rounded-2xl p-8 space-y-6">
        <h3 class="font-serif font-bold text-2xl text-burgundy">Configuration du Programme Fidélité</h3>
        <p class="text-xs text-muted-custom">
          Personnalisez le barème de points attribués par commande et le seuil requis pour déclencher la récompense café offert et l'animation de célébration.
        </p>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-burgundy mb-1">Points attribués par commande</label>
            <input type="number" [(ngModel)]="loyaltySettings.points_per_order" class="w-full p-2.5 border rounded-lg" />
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Score cible pour débloquer le café offert</label>
            <input type="number" [(ngModel)]="loyaltySettings.target_score" class="w-full p-2.5 border rounded-lg" />
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Message récompense (FR)</label>
            <input type="text" [(ngModel)]="loyaltySettings.reward_description_fr" class="w-full p-2.5 border rounded-lg" />
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Message récompense (EN)</label>
            <input type="text" [(ngModel)]="loyaltySettings.reward_description_en" class="w-full p-2.5 border rounded-lg" />
          </div>

          <button (click)="saveLoyaltySettings()" class="btn-bayou-gold w-full py-3 text-sm">
            Mettre à jour les paramètres de fidélité
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-tab {
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--bayou-text-main);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: var(--bayou-gold-light);
        color: var(--bayou-burgundy);
      }

      &.active {
        background: var(--bayou-burgundy);
        color: #fff;
      }
    }

    .btn-action {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);

  tab = signal<string>('stats');
  stats = signal<any>(null);
  adminOrders = signal<Order[]>([]);
  adminReservations = signal<Reservation[]>([]);
  adminProducts = signal<Product[]>([]);
  adminSlots = signal<BirthdaySlot[]>([]);
  adminReviews = signal<Review[]>([]);

  showNewProductForm = signal<boolean>(false);
  newProd: any = { category_id: 1, name_fr: '', name_en: '', price: 4.5, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop', description_fr: '' };

  newSlotDate: string = new Date().toISOString().split('T')[0];
  newSlotTime: string = '17:00:00';

  loyaltySettings: any = {
    points_per_order: 10,
    target_score: 50,
    reward_description_fr: 'Un café offert !',
    reward_description_en: 'A free coffee!'
  };

  ngOnInit() {
    this.loadStats();
    this.loadOrders();
    this.loadReservations();
    this.loadProducts();
    this.loadBirthdaySlots();
    this.loadReviews();
    this.loadLoyalty();
  }

  loadStats() {
    this.api.getAdminStats().subscribe(res => this.stats.set(res));
  }

  loadOrders() {
    this.api.getAdminOrders().subscribe(res => this.adminOrders.set(res));
  }

  loadReservations() {
    this.api.getAdminReservations().subscribe(res => this.adminReservations.set(res));
  }

  loadProducts() {
    this.api.getAdminProducts().subscribe(res => this.adminProducts.set(res));
  }

  loadBirthdaySlots() {
    this.api.getBirthdaySlots().subscribe(res => this.adminSlots.set(res));
  }

  loadReviews() {
    this.api.getAdminReviews().subscribe(res => this.adminReviews.set(res));
  }

  loadLoyalty() {
    this.api.getAdminLoyaltySettings().subscribe(res => {
      if (res) this.loyaltySettings = res;
    });
  }

  updateOrderStatus(id: number, status: string) {
    this.api.updateOrderStatus(id, status).subscribe(() => {
      this.loadOrders();
      this.loadStats();
    });
  }

  updateReservationStatus(id: number, status: string) {
    this.api.updateReservationStatus(id, status).subscribe(() => {
      this.loadReservations();
      this.loadStats();
    });
  }

  saveProduct() {
    this.api.createAdminProduct(this.newProd).subscribe(() => {
      this.showNewProductForm.set(false);
      this.loadProducts();
    });
  }

  deleteProduct(id: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.api.deleteAdminProduct(id).subscribe(() => this.loadProducts());
    }
  }

  addBirthdaySlot() {
    this.api.getBirthdaySlots(); // or create endpoint
    const payload = {
      date: this.newSlotDate,
      time: this.newSlotTime,
      max_capacity: 1,
      is_available: true
    };
    // Direct call via custom endpoint if needed, or update
    this.loadBirthdaySlots();
  }

  deleteBirthdaySlot(id: number) {
    this.loadBirthdaySlots();
  }

  toggleReview(id: number) {
    this.api.toggleReviewApproval(id).subscribe(() => this.loadReviews());
  }

  deleteReview(id: number) {
    this.api.deleteReview(id).subscribe(() => this.loadReviews());
  }

  saveLoyaltySettings() {
    this.api.updateAdminLoyaltySettings(this.loyaltySettings).subscribe({
      next: () => alert('Paramètres du programme fidélité enregistrés !'),
      error: () => alert('Erreur lors de la sauvegarde.')
    });
  }
}
