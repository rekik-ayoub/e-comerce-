import { Component, inject } from '@angular/core';
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
    <header class="bayou-header sticky top-0 z-50">
      <!-- Top banner for loyalty teaser -->
      <div class="loyalty-strip py-1 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <i class="bi bi-gift-fill text-gold"></i>
        <span>{{ t('loyalty.badge') }} : 10 pts / commande — Atteignez 50 pts pour un café offert !</span>
      </div>

      <nav class="navbar-main flex items-center justify-between px-6 py-3">
        <!-- Logo Brand -->
        <a routerLink="/" class="brand-link flex items-center gap-3">
          <img src="/logo.jpg" alt="Le Bayou Logo" class="brand-logo" />
        </a>

        <!-- Main Navigation Links -->
        <div class="nav-links hidden md:flex items-center gap-6">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ t('nav.home') }}</a>
          <a routerLink="/catalog" routerLinkActive="active">{{ t('nav.menu') }}</a>
          <a routerLink="/reservations" routerLinkActive="active">{{ t('nav.reservations') }}</a>
          <a routerLink="/birthday-menu" routerLinkActive="active">{{ t('nav.birthday') }}</a>
          <a routerLink="/events" routerLinkActive="active">{{ t('nav.events') }}</a>
          <a routerLink="/reviews" routerLinkActive="active">{{ t('nav.reviews') }}</a>
          <a routerLink="/contact" routerLinkActive="active">{{ t('nav.contact') }}</a>
        </div>

        <!-- Actions & Profile -->
        <div class="nav-actions flex items-center gap-4">
          <!-- Language Switcher -->
          <button (click)="ts.toggleLanguage()" class="lang-btn" title="Changer de langue">
            <span class="font-bold">{{ ts.currentLang() === 'fr' ? 'EN 🇬🇧' : 'FR 🇫🇷' }}</span>
          </button>

          <!-- Cart Icon with badge -->
          <a routerLink="/cart" class="cart-btn relative">
            <i class="bi bi-bag-fill text-xl"></i>
            <span *ngIf="api.cartCount() > 0" class="cart-badge animate-bounce">
              {{ api.cartCount() }}
            </span>
          </a>

          <!-- User Menu -->
          <ng-container *ngIf="auth.currentUser() as user; else guestTpl">
            <div class="user-chip flex items-center gap-2">
              <a routerLink="/profile" class="user-name flex items-center gap-1.5" title="Mon Profil">
                <i class="bi bi-person-circle text-gold text-lg"></i>
                <span class="font-semibold text-sm">{{ user.name }}</span>
                <span class="points-pill">{{ user.points }} pts</span>
              </a>

              <a *ngIf="user.role === 'admin'" routerLink="/admin" class="admin-badge" title="Dashboard Admin">
                <i class="bi bi-shield-lock-fill"></i> Admin
              </a>

              <button (click)="logout()" class="logout-btn" title="Déconnexion">
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </ng-container>

          <ng-template #guestTpl>
            <div class="auth-btns flex items-center gap-2">
              <a routerLink="/auth/login" class="btn-login text-sm font-semibold">{{ t('nav.login') }}</a>
              <a routerLink="/auth/register" class="btn-bayou-gold text-xs py-2 px-4">{{ t('nav.register') }}</a>
            </div>
          </ng-template>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .bayou-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(217, 196, 169, 0.35);
      box-shadow: 0 4px 20px rgba(63, 13, 12, 0.04);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .loyalty-strip {
      background: var(--bayou-burgundy);
      color: #FDFAF6;
    }

    .brand-logo {
      height: 48px;
      object-fit: contain;
      border-radius: 6px;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--bayou-text-main);
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
      position: relative;
      padding-bottom: 4px;

      &:hover, &.active {
        color: var(--bayou-burgundy);
        font-weight: 600;
      }

      &.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--bayou-gold);
        border-radius: 2px;
      }
    }

    .lang-btn {
      background: var(--bayou-cream-soft);
      border: 1px solid var(--bayou-cream-light);
      padding: 6px 12px;
      border-radius: 99px;
      cursor: pointer;
      font-size: 0.82rem;
      color: var(--bayou-burgundy);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bayou-gold-light);
        border-color: var(--bayou-gold);
      }
    }

    .cart-btn {
      color: var(--bayou-burgundy);
      padding: 6px 8px;
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
      top: -4px;
      right: -6px;
      background: var(--bayou-burgundy);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    .user-chip {
      background: var(--bayou-cream-soft);
      padding: 4px 12px;
      border-radius: 99px;
      border: 1px solid rgba(217, 196, 169, 0.5);
    }

    .user-name {
      text-decoration: none;
      color: var(--bayou-burgundy);
    }

    .points-pill {
      background: var(--bayou-gold);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 99px;
    }

    .admin-badge {
      background: var(--bayou-burgundy);
      color: #fff;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 99px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .logout-btn {
      background: none;
      border: none;
      color: var(--bayou-brown);
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--bayou-burgundy);
      }
    }

    .btn-login {
      text-decoration: none;
      color: var(--bayou-burgundy);
      padding: 6px 12px;
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

  t(key: string) {
    return this.ts.translate(key);
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
