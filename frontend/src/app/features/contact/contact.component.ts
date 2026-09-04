import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-bayou py-12">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">Échange & Disponibilité</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">Contactez Le Bayou Coffee Lounge</h1>
        <p class="text-sm text-muted-custom mt-2">
          Une question sur nos cafés, une demande de privatisation ou une suggestion ? Notre équipe vous répond avec grand plaisir.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
        <!-- Contact Info (Col 5) -->
        <div class="lg:col-span-5 glass-card rounded-2xl p-8 space-y-6 flex flex-col justify-between">
          <div class="space-y-6">
            <h3 class="font-serif font-bold text-2xl text-burgundy">Nos Coordonnées</h3>

            <div class="space-y-4 text-sm text-muted-custom">
              <div class="flex items-start gap-3">
                <i class="bi bi-geo-alt-fill text-gold text-lg mt-0.5"></i>
                <div>
                  <strong class="text-burgundy block">Adresse</strong>
                  <span>14 Avenue des Alizés, Lounge Bay</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <i class="bi bi-telephone-fill text-gold text-lg mt-0.5"></i>
                <div>
                  <strong class="text-burgundy block">Téléphone</strong>
                  <span>+33 1 23 45 67 89</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <i class="bi bi-envelope-fill text-gold text-lg mt-0.5"></i>
                <div>
                  <strong class="text-burgundy block">Email</strong>
                  <span>contact&#64;lebayoucoffee.com</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-bayou-gold-light/40 border border-gold/30 text-xs text-burgundy space-y-1">
            <strong>Privatisation & Événements Entreprises</strong>
            <p>Le salon lounge peut être privatisé sur demande pour vos séminaires ou anniversaires VIP.</p>
          </div>
        </div>

        <!-- Contact Form (Col 7) -->
        <div class="lg:col-span-7 glass-card rounded-2xl p-8">
          <form (ngSubmit)="submit()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Votre Nom</label>
                <input type="text" [(ngModel)]="name" name="name" required placeholder="Ayoub Rekik" class="input-bayou" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Votre Email</label>
                <input type="email" [(ngModel)]="email" name="email" required placeholder="ayoub@example.com" class="input-bayou" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">Sujet</label>
              <input type="text" [(ngModel)]="subject" name="subject" required placeholder="Demande d'information / Privatisation" class="input-bayou" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">Message</label>
              <textarea [(ngModel)]="message" name="message" rows="4" required placeholder="Votre message..." class="input-bayou"></textarea>
            </div>

            <button type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3 text-sm">
              <i class="bi bi-send"></i> {{ submitting() ? 'Envoi...' : 'Envoyer mon message' }}
            </button>
          </form>
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
export class ContactComponent {
  ts = inject(TranslationService);
  api = inject(ApiService);

  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';
  submitting = signal<boolean>(false);

  submit() {
    if (!this.name || !this.email || !this.message) return;

    this.submitting.set(true);
    this.api.submitContact({
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: res => {
        this.submitting.set(false);
        alert(res.message || 'Message envoyé avec succès !');
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Impossible d\'envoyer le message.'));
      }
    });
  }
}
