import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { BirthdaySlot, BirthdayMenu, Reservation } from '../../core/models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-bayou py-12">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">Lounge & Convivialité</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">{{ ts.translate('res.title') }}</h1>
        <p class="text-sm text-muted-custom mt-2">
          Réservez une table pour votre dégustation ou planifiez un anniversaire d'exception au lounge.
        </p>

        <!-- Toggle Type -->
        <div class="inline-flex p-1.5 rounded-2xl bg-bayou-cream-soft border border-beige-mid mt-6 gap-2 shadow-sm">
          <button
            (click)="activeTab.set('table')"
            [class.active]="activeTab() === 'table'"
            class="tab-btn"
          >
            <i class="bi bi-cup-hot-fill text-base"></i> ☕ Réservation Normale (Table Café)
          </button>
          <button
            (click)="activeTab.set('birthday')"
            [class.active]="activeTab() === 'birthday'"
            class="tab-btn"
          >
            <i class="bi bi-cake2-fill text-gold text-base"></i> 🎂 Réservation Anniversaire Privé
          </button>
        </div>
      </div>

      <!-- 1. TABLE RESERVATION FORM -->
      <div *ngIf="activeTab() === 'table'" class="max-w-xl mx-auto glass-card rounded-2xl p-8 space-y-6">
        <h3 class="font-serif font-bold text-2xl text-burgundy text-center">
          Dégustation & Table Lounge
        </h3>

        <form (ngSubmit)="submitTableReservation()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('res.date') }}</label>
              <input type="date" [(ngModel)]="tableDate" name="date" required [min]="minDate" class="input-bayou" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('res.time') }}</label>
              <select [(ngModel)]="tableTime" name="time" required class="input-bayou">
                <option value="09:00">09:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="16:30">16:30</option>
                <option value="18:30">18:30</option>
                <option value="20:00">20:00</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('res.guests') }}</label>
            <input type="number" [(ngModel)]="tableGuests" name="guests" min="1" max="20" required class="input-bayou" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('res.notes') }}</label>
            <textarea [(ngModel)]="tableNotes" name="notes" rows="3" placeholder="Préférences de table, occasion particulière..." class="input-bayou"></textarea>
          </div>

          <div class="pt-2">
            <button *ngIf="auth.isLoggedIn()" type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3 text-sm">
              <i class="bi bi-calendar2-check"></i> {{ submitting() ? 'Envoi...' : ts.translate('res.submit') }}
            </button>

            <a *ngIf="!auth.isLoggedIn()" routerLink="/auth/login" class="btn-bayou-burgundy w-full py-2.5 text-xs text-center block">
              Se connecter pour réserver
            </a>
          </div>
        </form>
      </div>

      <!-- 2. BIRTHDAY RESERVATION & AVAILABLE SLOTS -->
      <div *ngIf="activeTab() === 'birthday'" class="space-y-10">
        <!-- Available Slots Calendar List -->
        <div>
          <h3 class="font-serif font-bold text-2xl text-burgundy mb-4 text-center">
            {{ ts.translate('bday.slots_title') }}
          </h3>
          <p class="text-xs text-muted-custom text-center mb-6">
            Sélectionnez un créneau disponible (dates et heures où le salon lounge est libre) :
          </p>

          <div *ngIf="birthdaySlots().length === 0" class="text-center text-sm text-muted-custom py-8">
            Aucun créneau disponible pour le moment.
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div
              *ngFor="let slot of birthdaySlots()"
              (click)="selectedSlot.set(slot)"
              [class.selected]="selectedSlot()?.id === slot.id"
              class="slot-card p-3 rounded-xl text-center cursor-pointer transition-all"
            >
              <div class="text-xs font-bold text-burgundy">{{ slot.date | date:'EEE d MMM' }}</div>
              <div class="text-sm font-bold text-gold font-serif mt-1">{{ slot.time.substring(0, 5) }}</div>
              <span class="text-[10px] text-green-600 font-semibold block mt-1">Disponible</span>
            </div>
          </div>
        </div>

        <!-- Birthday Form with Menu Package Selection -->
        <div class="max-w-2xl mx-auto glass-card rounded-2xl p-8 space-y-6">
          <h4 class="font-serif font-bold text-xl text-burgundy">Détails de l'Anniversaire</h4>

          <form (ngSubmit)="submitBirthdayReservation()" class="space-y-4">
            <div *ngIf="selectedSlot()" class="p-3 bg-bayou-gold-light/40 border border-gold rounded-xl flex items-center justify-between text-xs">
              <div>
                <strong>Créneau choisi :</strong> {{ selectedSlot()?.date | date:'fullDate' }} à {{ selectedSlot()?.time?.substring(0, 5) }}
              </div>
              <button type="button" (click)="selectedSlot.set(null)" class="text-red-600 hover:underline">Changer</button>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('bday.person_name') }}</label>
              <input type="text" [(ngModel)]="birthdayPersonName" name="personName" required placeholder="Ex: Sarah, 25 ans" class="input-bayou" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Nombre d'invités</label>
                <input type="number" [(ngModel)]="birthdayGuests" name="guests" min="2" max="30" required class="input-bayou" />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Formule Menu Choisie</label>
                <select [(ngModel)]="selectedMenuId" name="menuId" class="input-bayou">
                  <option [ngValue]="null">Sans formule (à la carte)</option>
                  <option *ngFor="let menu of birthdayMenus()" [ngValue]="menu.id">
                    {{ ts.getField(menu, 'name') }} — {{ menu.price }} DT
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-burgundy mb-1">{{ ts.translate('res.notes') }}</label>
              <textarea [(ngModel)]="birthdayNotes" name="bNotes" rows="2" placeholder="Goût du gâteau, musique souhaitée, bougies..." class="input-bayou"></textarea>
            </div>

            <div class="pt-2">
              <button *ngIf="auth.isLoggedIn()" type="submit" [disabled]="submitting() || !selectedSlot()" class="btn-bayou-gold w-full py-3 text-sm">
                <i class="bi bi-stars"></i> Confirmer la réservation anniversaire
              </button>

              <a *ngIf="!auth.isLoggedIn()" routerLink="/auth/login" class="btn-bayou-burgundy w-full py-2.5 text-xs text-center block">
                Se connecter pour réserver
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn {
      padding: 8px 20px;
      border-radius: 99px;
      border: none;
      background: transparent;
      color: var(--bayou-text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;

      &.active {
        background: var(--bayou-burgundy);
        color: #fff;
      }
    }

    .input-bayou {
      width: 100%;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--bayou-greige);
      background: #fff;
      font-size: 0.85rem;
      font-family: inherit;
      color: var(--bayou-text-main);

      &:focus {
        outline: none;
        border-color: var(--bayou-gold);
        box-shadow: 0 0 0 3px rgba(217, 176, 97, 0.2);
      }
    }

    .slot-card {
      background: #fff;
      border: 1px solid var(--bayou-cream-light);
      &:hover {
        border-color: var(--bayou-gold);
        transform: translateY(-2px);
      }
      &.selected {
        background: var(--bayou-gold-light);
        border-color: var(--bayou-gold);
        box-shadow: 0 4px 12px rgba(217, 176, 97, 0.3);
      }
    }
  `]
})
export class ReservationsComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  auth = inject(AuthService);

  activeTab = signal<'table' | 'birthday'>('table');

  birthdaySlots = signal<BirthdaySlot[]>([]);
  birthdayMenus = signal<BirthdayMenu[]>([]);
  selectedSlot = signal<BirthdaySlot | null>(null);

  minDate: string = new Date().toISOString().split('T')[0];

  // Table form
  tableDate: string = '';
  tableTime: string = '14:00';
  tableGuests: number = 2;
  tableNotes: string = '';

  // Birthday form
  birthdayPersonName: string = '';
  birthdayGuests: number = 6;
  selectedMenuId: number | null = null;
  birthdayNotes: string = '';

  submitting = signal<boolean>(false);

  ngOnInit() {
    this.tableDate = this.minDate;
    this.api.getBirthdaySlots().subscribe(slots => this.birthdaySlots.set(slots));
    this.api.getBirthdayMenus().subscribe(menus => this.birthdayMenus.set(menus));
  }

  submitTableReservation() {
    this.submitting.set(true);
    const payload = {
      type: 'table',
      date: this.tableDate,
      time: this.tableTime,
      guests: this.tableGuests,
      notes: this.tableNotes,
    };

    this.api.createReservation(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        alert('Votre réservation de table a été transmise ! Vous recevrez une confirmation.');
        this.tableNotes = '';
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Veuillez réessayer'));
      }
    });
  }

  submitBirthdayReservation() {
    const slot = this.selectedSlot();
    if (!slot) {
      alert('Veuillez sélectionner un créneau disponible sur le calendrier.');
      return;
    }

    this.submitting.set(true);
    const payload = {
      type: 'birthday',
      date: slot.date,
      time: slot.time,
      guests: this.birthdayGuests,
      birthday_slot_id: slot.id,
      birthday_menu_id: this.selectedMenuId,
      birthday_person_name: this.birthdayPersonName,
      notes: this.birthdayNotes,
    };

    this.api.createReservation(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        alert('Votre demande d\'anniversaire a été enregistrée avec succès !');
        this.selectedSlot.set(null);
        this.birthdayPersonName = '';
        this.birthdayNotes = '';
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Veuillez réessayer'));
      }
    });
  }
}
