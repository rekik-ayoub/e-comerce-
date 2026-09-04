import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page-bg min-h-screen flex items-center justify-center py-12 px-4">
      <div class="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full space-y-6 shadow-2xl border border-gold/30">

        <!-- Logo + Welcome -->
        <div class="text-center space-y-3">
          <div class="logo-wrapper mx-auto">
            <img src="/logo.jpg" alt="Le Bayou Coffee Lounge" class="logo-img" />
          </div>
          <div class="space-y-1">
            <h1 class="font-serif font-bold text-3xl text-burgundy">Bienvenue !</h1>
            <p class="text-sm text-muted-custom">Connectez-vous pour accéder à votre espace Le Bayou Coffee Lounge.</p>
          </div>
        </div>

        <!-- Decorative divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
          <span class="text-gold text-lg">☕</span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
        </div>

        <form (ngSubmit)="login()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="votre@email.com" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="input-bayou" />
          </div>

          <div *ngIf="errorMessage()" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <i class="bi bi-exclamation-circle-fill"></i>
            {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3.5 text-sm font-bold">
            <i class="bi" [class.bi-box-arrow-in-right]="!submitting()" [class.bi-arrow-repeat]="submitting()" [class.animate-spin]="submitting()"></i>
            <span>{{ submitting() ? 'Connexion en cours...' : 'Se connecter' }}</span>
          </button>
        </form>

        <div class="text-center text-xs text-muted-custom">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-gold font-bold hover:underline">Créer un compte gratuitement</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page-bg {
      background: linear-gradient(135deg, #fdfaf6 0%, #f5ece0 40%, #ede0d0 100%);
      min-height: 100vh;
    }

    .logo-wrapper {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--bayou-gold);
      box-shadow: 0 8px 32px rgba(63,13,12,0.18), 0 0 0 6px rgba(217,176,97,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .input-bayou {
      width: 100%;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--bayou-greige);
      background: #fff;
      font-size: 0.85rem;
      color: var(--bayou-text-main);
      &:focus {
        outline: none;
        border-color: var(--bayou-gold);
        box-shadow: 0 0 0 3px rgba(217,176,97,0.2);
      }
    }
  `]
})
export class LoginComponent {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  router = inject(Router);

  email: string = '';
  password: string = '';
  errorMessage = signal<string>('');
  submitting = signal<boolean>(false);

  login() {
    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.submitting.set(false);
        if (res.user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'Identifiants invalides. Vérifiez votre email et mot de passe.');
      }
    });
  }
}
