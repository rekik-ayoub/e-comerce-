import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, EventItem, LoyaltyStatus } from '../../core/models';
import { CelebrationModalComponent } from '../../shared/components/celebration-modal.component';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CelebrationModalComponent],
  template: `
    <div class="home-page">
      <!-- 1. HERO SECTION -->
      <section class="hero-section relative py-20 lg:py-28 overflow-hidden">
        <div class="container-bayou grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="hero-content space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bayou-gold-light text-burgundy text-xs font-bold uppercase tracking-wider">
              <i class="bi bi-stars text-gold"></i>
              <span>{{ ts.translate('hero.badge') }}</span>
            </div>

            <h1 class="font-serif text-4xl lg:text-6xl font-bold text-burgundy leading-tight">
              {{ ts.translate('hero.title') }} <br />
              <span class="text-gold italic font-normal">Le Bayou Coffee</span>
            </h1>

            <p class="text-base lg:text-lg text-muted-custom leading-relaxed max-w-xl">
              {{ ts.translate('hero.subtitle') }}
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-4">
              <a routerLink="/catalog" class="btn-bayou-gold text-sm lg:text-base py-3.5 px-8">
                <i class="bi bi-cup-hot"></i> {{ ts.translate('hero.btn_order') }}
              </a>
              <a routerLink="/reservations" class="btn-bayou-outline text-sm lg:text-base py-3 px-7">
                <i class="bi bi-calendar2-heart"></i> {{ ts.translate('hero.btn_reserve') }}
              </a>
            </div>

            <!-- Quick perks -->
            <div class="grid grid-cols-3 gap-4 pt-6 border-t border-beige-mid">
              <div>
                <div class="text-xl font-bold text-burgundy font-serif">100%</div>
                <div class="text-xs text-muted-custom">Cafés Pur Arabica</div>
              </div>
              <div>
                <div class="text-xl font-bold text-burgundy font-serif">10 pts</div>
                <div class="text-xs text-muted-custom">Par Commande</div>
              </div>
              <div>
                <div class="text-xl font-bold text-burgundy font-serif">GPS</div>
                <div class="text-xs text-muted-custom">Livraison Précise</div>
              </div>
            </div>
          </div>

          <!-- Hero Media / Card Visual -->
          <div class="hero-visual relative flex justify-center">
            <div class="visual-wrapper relative max-w-md w-full">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop"
                alt="Café Latte Artisanal Le Bayou"
                class="rounded-3xl shadow-xl w-full object-cover h-[420px]"
              />

              <!-- Floating Special Card -->
              <div class="floating-card glass-card p-4 rounded-2xl absolute -bottom-6 -left-6 max-w-[240px]">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-bayou-gold flex items-center justify-center text-white text-lg">
                    <i class="bi bi-award-fill"></i>
                  </div>
                  <div>
                    <div class="text-xs text-muted-custom font-semibold">Signature 2026</div>
                    <div class="text-sm font-bold text-burgundy">Nitro Cold Brew</div>
                  </div>
                </div>
              </div>

              <!-- Floating Points Card -->
              <div class="floating-card-2 glass-card p-3.5 rounded-2xl absolute -top-4 -right-4 flex items-center gap-2">
                <i class="bi bi-gift-fill text-gold text-lg"></i>
                <span class="text-xs font-bold text-burgundy">Café Offert à 50 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. LOYALTY PROGRESS STRIP (If logged in or teaser) -->
      <section class="container-bayou my-10">
        <div class="loyalty-card p-8 rounded-3xl relative overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div class="md:col-span-2 space-y-3">
              <div class="inline-flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
                <i class="bi bi-stars"></i> {{ ts.translate('loyalty.title') }}
              </div>
              <h3 class="text-2xl font-serif font-bold text-white">
                {{ loyalty()?.has_reached ? 'Vous avez débloqué votre café offert !' : 'Gagnez votre café offert en commandant chez nous' }}
              </h3>
              <p class="text-sm text-gray-300">
                {{ ts.translate('loyalty.target_desc') }}
              </p>

              <!-- Progress bar -->
              <div class="mt-4">
                <div class="flex justify-between text-xs text-gray-200 font-semibold mb-2">
                  <span>Score : {{ loyalty()?.current_points || (auth.currentUser()?.points || 0) }} / {{ loyalty()?.target_score || 50 }} points</span>
                  <span>{{ loyalty()?.percentage || 0 }}%</span>
                </div>
                <div class="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div
                    class="bg-bayou-gold h-full rounded-full transition-all duration-700"
                    [style.width.%]="loyalty()?.percentage || (auth.currentUser() ? (auth.currentUser()!.points / 50) * 100 : 0)"
                  ></div>
                </div>
              </div>
            </div>

            <div class="text-center md:text-right">
              <button
                *ngIf="loyalty()?.has_reached"
                (click)="triggerCelebration()"
                class="btn-bayou-gold text-sm py-3 px-6 animate-bounce"
              >
                <i class="bi bi-gift-fill"></i> Voir mon Cadeau !
              </button>
              <a
                *ngIf="!loyalty()?.has_reached && auth.isLoggedIn()"
                routerLink="/catalog"
                class="btn-bayou-gold text-sm py-3 px-6"
              >
                <i class="bi bi-bag-plus"></i> Commander (+10 pts)
              </a>
              <a
                *ngIf="!auth.isLoggedIn()"
                routerLink="/auth/register"
                class="btn-bayou-gold text-sm py-3 px-6"
              >
                Créer un compte & Gagner
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. FEATURED PRODUCTS PREVIEW -->
      <section class="container-bayou my-20">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span class="text-gold uppercase tracking-wider text-xs font-bold">Sélection Gourmet</span>
            <h2 class="font-serif text-3xl md:text-4xl font-bold text-burgundy mt-1">Nos Incontournables</h2>
          </div>
          <a routerLink="/catalog" class="text-brown hover:text-burgundy font-semibold text-sm inline-flex items-center gap-1 mt-4 md:mt-0">
            Voir toute la carte <i class="bi bi-arrow-right"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of featuredProducts()" class="product-card glass-card rounded-2xl overflow-hidden flex flex-col">
            <div class="product-img-wrap relative h-52 overflow-hidden">
              <img [src]="product.image" [alt]="ts.getField(product, 'name')" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <span *ngIf="product.featured" class="absolute top-3 left-3 bg-bayou-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Coup de cœur
              </span>
            </div>

            <div class="p-5 flex flex-col flex-grow">
              <h3 class="font-serif font-bold text-lg text-burgundy">{{ ts.getField(product, 'name') }}</h3>
              <p class="text-xs text-muted-custom mt-1.5 line-clamp-2 leading-relaxed">
                {{ ts.getField(product, 'description') }}
              </p>

              <div class="mt-auto pt-4 flex items-center justify-between">
                <span class="text-lg font-bold text-burgundy font-serif">{{ product.price | number:'1.2-2' }} DT</span>
                <button (click)="addToCart(product)" class="btn-bayou-gold text-xs py-2 px-3.5">
                  <i class="bi bi-bag-plus"></i> {{ ts.translate('catalog.add_to_cart') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. BIRTHDAY & PRIVATE EVENTS HIGHLIGHT -->
      <section class="py-20 bg-bayou-cream-soft my-16">
        <div class="container-bayou grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="rounded-3xl overflow-hidden shadow-lg h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
              alt="Fête d'anniversaire au Bayou"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="space-y-6">
            <span class="text-gold uppercase tracking-wider text-xs font-bold">Moments Magiques</span>
            <h2 class="font-serif text-3xl lg:text-4xl font-bold text-burgundy leading-tight">
              Célébrez Votre Anniversaire au Bayou Coffee Lounge
            </h2>
            <p class="text-sm text-muted-custom leading-relaxed">
              Réservez votre créneau dédié, profitez de nos formules tout compris avec gâteaux artisanaux, boissons chaudes et fraîches illimitées, et salon privatisable.
            </p>

            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <i class="bi bi-check-circle-fill text-gold text-lg mt-0.5"></i>
                <span class="text-sm text-burgundy font-medium">Calendrier de créneaux libres en temps réel</span>
              </div>
              <div class="flex items-start gap-3">
                <i class="bi bi-check-circle-fill text-gold text-lg mt-0.5"></i>
                <span class="text-sm text-burgundy font-medium">Formules gourmandes pour petits et grands groupes</span>
              </div>
              <div class="flex items-start gap-3">
                <i class="bi bi-check-circle-fill text-gold text-lg mt-0.5"></i>
                <span class="text-sm text-burgundy font-medium">Règlement en toute sérénité sur place le jour J</span>
              </div>
            </div>

            <div class="pt-2 flex gap-4">
              <a routerLink="/birthday-menu" class="btn-bayou-burgundy text-sm py-3 px-6">
                <i class="bi bi-cake2"></i> Découvrir les formules
              </a>
              <a routerLink="/reservations" class="btn-bayou-outline text-sm py-3 px-6">
                Voir les créneaux
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. UPCOMING EVENTS TEASER -->
      <section class="container-bayou my-20">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-gold uppercase tracking-wider text-xs font-bold">Agenda Culturel</span>
          <h2 class="font-serif text-3xl md:text-4xl font-bold text-burgundy mt-1">Événements & Soirées Jazz</h2>
          <p class="text-sm text-muted-custom mt-2">Dégustations exclusives, cupping masterclass et sessions acoustiques.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div *ngFor="let ev of events()" class="glass-card rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
            <img [src]="ev.image" [alt]="ts.getField(ev, 'title')" class="w-full sm:w-40 h-40 object-cover rounded-xl shadow" />
            <div class="space-y-2 flex-grow">
              <span class="inline-block text-xs font-bold text-gold">
                <i class="bi bi-calendar-event"></i> {{ ev.event_date | date:'mediumDate' }}
              </span>
              <h3 class="font-serif font-bold text-xl text-burgundy">{{ ts.getField(ev, 'title') }}</h3>
              <p class="text-xs text-muted-custom line-clamp-2 leading-relaxed">
                {{ ts.getField(ev, 'description') }}
              </p>
              <div class="pt-2">
                <a routerLink="/events" class="text-xs font-bold text-burgundy hover:text-gold transition-colors inline-flex items-center gap-1">
                  En savoir plus <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CELEBRATION MODAL -->
      <app-celebration-modal
        [show]="showCelebrationModal()"
        [message]="celebrationMessage()"
        (close)="showCelebrationModal.set(false)"
      ></app-celebration-modal>
    </div>
  `,
  styles: [`
    .loyalty-card {
      background: linear-gradient(135deg, var(--bayou-burgundy) 0%, #220606 100%);
      box-shadow: 0 16px 36px rgba(63, 13, 12, 0.25);
    }
  `]
})
export class HomeComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  auth = inject(AuthService);

  featuredProducts = signal<Product[]>([]);
  events = signal<EventItem[]>([]);
  loyalty = signal<LoyaltyStatus | null>(null);

  showCelebrationModal = signal<boolean>(false);
  celebrationMessage = signal<string>('');

  ngOnInit() {
    this.api.getProducts({ featured: true }).subscribe(res => {
      this.featuredProducts.set(res.slice(0, 4));
    });

    this.api.getEvents().subscribe(res => {
      this.events.set(res.slice(0, 2));
    });

    if (this.auth.isLoggedIn()) {
      this.api.getLoyaltyStatus().subscribe(res => {
        this.loyalty.set(res);
        if (res.has_reached) {
          // Trigger confetti automatically on load if score reached
          this.triggerCelebration();
        }
      });
    }
  }

  addToCart(product: Product) {
    this.api.addToCart(product, 1);
  }

  triggerCelebration() {
    this.celebrationMessage.set(
      this.ts.currentLang() === 'fr'
        ? (this.loyalty()?.reward_fr || 'Bravo ! Vous avez atteint votre objectif de points.')
        : (this.loyalty()?.reward_en || 'Congratulations! You reached your loyalty goal.')
    );
    this.showCelebrationModal.set(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D9B061', '#3F0D0C', '#D9C4A9', '#FDFAF6']
    });
  }
}
