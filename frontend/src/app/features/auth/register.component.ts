import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-bayou py-16 flex justify-center">
      <div class="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full space-y-6 shadow-xl border border-gold/30">
        <div class="text-center space-y-2">
          <img src="/logo.jpg" alt="Le Bayou" class="h-12 mx-auto rounded" />
          <h2 class="font-serif font-bold text-2xl text-burgundy">Créer un Compte</h2>
          <p class="text-xs text-muted-custom">Rejoignez le club Le Bayou et commencez à cumuler vos points fidélité !</p>
        </div>

        <form (ngSubmit)="register()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Nom Complet</label>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Ayoub Rekik" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="ayoub@exemple.com" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Téléphone</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+33 6 12 34 56 78" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Minimum 6 caractères" class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">Confirmer mot de passe</label>
            <input type="password" [(ngModel)]="passwordConfirmation" name="password_confirmation" required placeholder="••••••••" class="input-bayou" />
          </div>

          <div *ngIf="errorMessage()" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3 text-sm font-bold">
            <i class="bi" [class.bi-person-plus-fill]="!submitting()" [class.bi-arrow-repeat]="submitting()" [class.animate-spin]="submitting()"></i>
            <span>{{ submitting() ? 'Création en cours...' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <div class="text-center text-xs text-muted-custom">
          Déjà un compte ?
          <a routerLink="/auth/login" class="text-gold font-bold hover:underline">Se connecter</a>
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
export class RegisterComponent {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  router = inject(Router);

  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  errorMessage = signal<string>('');
  submitting = signal<boolean>(false);

  register() {
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.register({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      password_confirmation: this.passwordConfirmation
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de l\'inscription.');
      }
    });
  }
}
