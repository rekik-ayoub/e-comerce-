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
    <div class="container-bayou py-16 flex justify-center">
      <div class="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full space-y-6 shadow-xl border border-gold/30">
        <div class="text-center space-y-2">
          <img src="/logo.jpg" alt="Le Bayou" class="h-12 mx-auto rounded" />
          <h2 class="font-serif font-bold text-2xl text-burgundy">Connexion Espace Client</h2>
          <p class="text-xs text-muted-custom">Accédez à votre compte, vos commandes et vos points fidélité.</p>
        </div>

        <form (ngSubmit)="login()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="nom@exemple.com" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="input-bayou" />
          </div>

          <div *ngIf="errorMessage()" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3 text-sm font-bold">
            <i class="bi" [class.bi-box-arrow-in-right]="!submitting()" [class.bi-arrow-repeat]="submitting()" [class.animate-spin]="submitting()"></i>
            <span>{{ submitting() ? 'Connexion en cours...' : 'Se connecter' }}</span>
          </button>
        </form>

        <!-- Quick Demo Accounts Helper -->
        <div class="p-3 rounded-xl bg-bayou-cream-soft border border-beige-mid text-xs space-y-1 text-muted-custom">
          <strong class="text-burgundy block">Comptes de test :</strong>
          <div>Admin: <code>admin&#64;lebayou.com</code> / <code>admin123456</code></div>
          <div>Client: <code>ayoub&#64;example.com</code> / <code>password123</code></div>
        </div>

        <div class="text-center text-xs text-muted-custom">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-gold font-bold hover:underline">Créer un compte</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      }
    }
  `]
})
export class LoginComponent {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  router = inject(Router);

  email: string = 'ayoub@example.com';
  password: string = 'password123';
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
        this.errorMessage.set(err.error?.message || 'Identifiants invalides.');
      }
    });
  }
}
