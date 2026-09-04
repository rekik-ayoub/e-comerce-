import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bayou-header sticky top-0 z-50 shadow-sm">
      <!-- Top banner for loyalty teaser (Dynamic: only for clients and guests, not admin) -->
      <div *ngIf="auth.currentUser()?.role !== 'admin'" class="loyalty-strip py-1.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <i class="bi bi-gift-fill text-gold"></i>
        <span>
          {{ t('loyalty.badge') }} : 
          <strong>+{{ api.loyaltyInfo()?.points_per_order || 10 }} pts / commande</strong> — 
          Atteignez <strong>{{ api.loyaltyInfo()?.target_score || 50 }} pts</strong> pour {{ ts.currentLang() === 'fr' ? (api.loyaltyInfo()?.reward_description_fr || api.loyaltyInfo()?.reward_fr || 'un café offert !') : (api.loyaltyInfo()?.reward_description_en || api.loyaltyInfo()?.reward_en || 'a free coffee!') }}
        </span>
      </div>

      <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5">
        <!-- Logo Brand (Sharp & Crisp) -->
        <a routerLink="/" class="flex items-center gap-3 no-underline flex-shrink-0 group">
          <div class="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl overflow-hidden shadow-sm border border-gold/40 bg-white flex items-center justify-center p-1 group-hover:scale-105 transition-all">
            <img src="/logo.jpg" alt="Le Bayou Coffee Lounge Logo" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col">
            <span class="font-serif font-bold text-burgundy text-base sm:text-lg leading-none tracking-wide">LE BAYOU</span>
            <span class="text-[9px] tracking-widest text-gold uppercase font-bold mt-0.5">Coffee Lounge</span>
          </div>
        </a>

        <!-- Main Navigation Links (Spacious, Breathable & Clean) -->
        <div class="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6 text-xs xl:text-sm font-semibold whitespace-nowrap">
          <!-- Links for logged-in regular clients -->
          <ng-container *ngIf="auth.currentUser() && auth.currentUser()?.role !== 'admin'">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">{{ t('nav.home') }}</a>
            <a routerLink="/catalog" routerLinkActive="active" class="nav-link">{{ t('nav.menu') }}</a>
            <a routerLink="/reservations" routerLinkActive="active" class="nav-link">{{ t('nav.reservations') }}</a>
            <a routerLink="/birthday-menu" routerLinkActive="active" class="nav-link">{{ t('nav.birthday') }}</a>
            <a routerLink="/events" routerLinkActive="active" class="nav-link">{{ t('nav.events') }}</a>
            <a routerLink="/reviews" routerLinkActive="active" class="nav-link">{{ t('nav.reviews') }}</a>
            <a routerLink="/contact" routerLinkActive="active" class="nav-link">{{ t('nav.contact') }}</a>
          </ng-container>

          <!-- Links for guests: home + menu + contact -->
          <ng-container *ngIf="!auth.currentUser()">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">{{ t('nav.home') }}</a>
            <a routerLink="/catalog" routerLinkActive="active" class="nav-link">{{ t('nav.menu') }}</a>
            <a routerLink="/contact" routerLinkActive="active" class="nav-link">{{ t('nav.contact') }}</a>
          </ng-container>
        </div>

        <!-- Actions & Profile -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Language Switcher -->
          <button (click)="ts.toggleLanguage()" class="lang-btn" title="Changer de langue">
            <span class="font-bold">{{ ts.currentLang() === 'fr' ? 'EN 🇬🇧' : 'FR 🇫🇷' }}</span>
          </button>

          <!-- Cart Icon: only for guests and regular clients -->
          <a *ngIf="auth.currentUser()?.role !== 'admin'" routerLink="/cart" class="cart-btn relative p-2 text-bayou-burgundy hover:text-bayou-gold transition-colors" title="Panier">
            <i class="bi bi-bag-fill text-2xl"></i>
            <span *ngIf="api.cartCount() > 0" class="cart-badge animate-bounce">
              {{ api.cartCount() }}
            </span>
          </a>

          <!-- User Menu -->
          <ng-container *ngIf="auth.currentUser() as user; else guestTpl">
            <!-- Regular Client Pill -->
            <div *ngIf="user.role !== 'admin'" class="flex items-center gap-1 sm:gap-2">
              <a routerLink="/profile" class="user-chip flex items-center gap-2 no-underline text-bayou-burgundy hover:border-gold transition-colors" title="Mon Profil & Commandes">
                <i class="bi bi-person-circle text-bayou-gold text-base"></i>
                <span class="font-bold text-xs max-w-[90px] sm:max-w-none truncate">{{ user.name }}</span>
                <span class="points-pill">{{ user.points }} pts</span>
              </a>
              <button (click)="logout()" class="logout-btn p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Déconnexion">
                <i class="bi bi-box-arrow-right text-base"></i>
              </button>
            </div>

            <!-- Admin Action Group: only Dashboard and Logout -->
            <div *ngIf="user.role === 'admin'" class="flex items-center gap-2">
              <a routerLink="/admin" class="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-bayou-burgundy text-gold font-bold text-xs shadow-sm hover:opacity-95 no-underline" title="Accéder au panneau d'administration">
                <i class="bi bi-shield-lock-fill"></i>
                <span>Espace Administration</span>
              </a>
              <button (click)="logout()" class="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-bayou-burgundy text-xs font-bold flex items-center gap-1 border border-amber-200" title="Déconnexion">
                <i class="bi bi-box-arrow-right"></i>
                <span class="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </ng-container>

          <ng-template #guestTpl>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <a routerLink="/auth/login" class="btn-login text-xs font-bold px-3 py-1.5 rounded-full text-bayou-burgundy hover:bg-amber-50 no-underline">{{ t('nav.login') }}</a>
              <a routerLink="/auth/register" class="btn-bayou-gold text-xs py-1.5 px-3.5 shadow-sm no-underline">{{ t('nav.register') }}</a>
            </div>
          </ng-template>

          <!-- Mobile Hamburger Button -->
          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="lg:hidden p-2 rounded-xl text-bayou-burgundy hover:bg-bayou-cream-soft transition-colors" aria-label="Menu">
            <i class="bi" [class.bi-list]="!mobileMenuOpen()" [class.bi-x-lg]="mobileMenuOpen()" style="font-size: 1.4rem;"></i>
          </button>
        </div>
      </nav>

      <!-- Mobile Dropdown Menu -->
      <div *ngIf="mobileMenuOpen()" class="lg:hidden bg-white/98 border-t border-beige-mid/40 shadow-xl px-6 py-4 space-y-3">
        <ng-container *ngIf="auth.currentUser() && auth.currentUser()?.role !== 'admin'">
          <a (click)="mobileMenuOpen.set(false)" routerLink="/" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.home') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/catalog" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.menu') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/reservations" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.reservations') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/birthday-menu" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.birthday') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/events" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.events') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/reviews" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.reviews') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/contact" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.contact') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/profile" [queryParams]="{tab: 'orders'}" class="block py-2 text-sm font-bold text-gold hover:text-burgundy no-underline border-b border-beige-mid/20">🛍️ Mes Commandes</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/profile" [queryParams]="{tab: 'reservations'}" class="block py-2 text-sm font-bold text-gold hover:text-burgundy no-underline">📋 Mes Réservations</a>
        </ng-container>

        <ng-container *ngIf="!auth.currentUser()">
          <a (click)="mobileMenuOpen.set(false)" routerLink="/" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.home') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/catalog" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline border-b border-beige-mid/20">{{ t('nav.menu') }}</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/contact" class="block py-2 text-sm font-semibold text-burgundy hover:text-gold no-underline">{{ t('nav.contact') }}</a>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .bayou-header {
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(217, 196, 169, 0.4);
      box-shadow: 0 4px 20px rgba(63, 13, 12, 0.04);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .loyalty-strip {
      background: var(--bayou-burgundy);
      color: #FDFAF6;
    }

    .nav-link {
      text-decoration: none;
      color: var(--bayou-text-main);
      transition: all 0.2s ease;
      position: relative;
      padding: 6px 4px;
      display: inline-block;

      &:hover {
        color: var(--bayou-burgundy);
      }

      &.active {
        color: var(--bayou-burgundy);
        font-weight: 700;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 4px;
          right: 4px;
          height: 2.5px;
          background: var(--bayou-gold);
          border-radius: 99px;
        }
      }
    }

    .lang-btn {
      background: var(--bayou-cream-soft);
      border: 1px solid var(--bayou-cream-light);
      padding: 5px 10px;
      border-radius: 99px;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--bayou-burgundy);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bayou-gold-light);
        border-color: var(--bayou-gold);
      }
    }

    .cart-btn {
      color: var(--bayou-burgundy);
      padding: 4px 6px;
      display: flex;
      align-items: center;
      text-decoration: none;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.08);
      }
    }

    .cart-badge {
      position: absolute;
      top: -2px;
      right: -4px;
      background: var(--bayou-burgundy);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 17px;
      height: 17px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    .user-chip {
      background: var(--bayou-cream-soft);
      padding: 4px 10px;
      border-radius: 99px;
      border: 1px solid rgba(217, 196, 169, 0.6);
    }

    .points-pill {
      background: var(--bayou-gold);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1.5px 6px;
      border-radius: 99px;
    }

    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .btn-login {
      text-decoration: none;
      color: var(--bayou-burgundy);
      border-radius: 99px;

      &:hover {
        background: var(--bayou-cream-soft);
      }
    }
  `]
})
export class NavbarComponent {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  api = inject(ApiService);

  mobileMenuOpen = signal<boolean>(false);

  t(key: string) {
    return this.ts.translate(key);
  }

  logout() {
    this.auth.clearSession();
    this.auth.logout().subscribe();
  }
}

