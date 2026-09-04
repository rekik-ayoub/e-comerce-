import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { BirthdaySlot, BirthdayMenu, Reservation } from '../../core/models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
        <div class="inline-flex flex-wrap justify-center p-1.5 rounded-2xl bg-bayou-cream-soft border border-beige-mid mt-6 gap-2 shadow-sm">
          <button
            (click)="activeTab.set('table')"
            [class.active]="activeTab() === 'table'"
            class="tab-btn"
          >
            <i class="bi bi-cup-hot-fill text-base"></i> ☕ Table Café
          </button>
          <button
            (click)="activeTab.set('birthday')"
            [class.active]="activeTab() === 'birthday'"
            class="tab-btn"
          >
            <i class="bi bi-cake2-fill text-gold text-base"></i> 🎂 Anniversaire Privé
          </button>
          <button
            *ngIf="auth.isLoggedIn()"
            (click)="activeTab.set('my_reservations')"
            [class.active]="activeTab() === 'my_reservations'"
            class="tab-btn"
          >
            <i class="bi bi-calendar2-check-fill text-emerald-600 text-base"></i> 📋 Mes Réservations ({{ myReservations().length }})
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

      <!-- 3. MY RESERVATIONS LIST -->
      <div *ngIf="activeTab() === 'my_reservations'" class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800">
          <div class="flex items-center gap-2">
            <i class="bi bi-shield-check text-emerald-600 text-lg"></i>
            <span><strong>Vos Réservations Enregistrées :</strong> Suivez ici l'état de validation en temps réel.</span>
          </div>
          <button (click)="loadMyReservations()" class="text-xs font-bold text-emerald-900 underline hover:no-underline cursor-pointer">
            <i class="bi bi-arrow-clockwise"></i> Actualiser
          </button>
        </div>

        <div *ngIf="myReservations().length === 0" class="glass-card text-center py-12 rounded-2xl">
          <i class="bi bi-calendar-x text-4xl text-gold mb-3 block"></i>
          <h4 class="font-serif font-bold text-burgundy text-lg">Vous n'avez pas encore de réservation</h4>
          <p class="text-xs text-muted-custom mt-1 mb-4">Réservez une table café lounge ou un anniversaire privé dès maintenant.</p>
          <div class="flex justify-center gap-3">
            <button (click)="activeTab.set('table')" class="btn-bayou-gold text-xs py-2 px-4">Réserver une table</button>
            <button (click)="activeTab.set('birthday')" class="btn-bayou-outline text-xs py-2 px-4">Réserver un anniversaire</button>
          </div>
        </div>

        <div *ngFor="let res of myReservations()" class="glass-card rounded-2xl p-6 space-y-4 hover:shadow-md transition-all">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-beige-mid/40 pb-3">
            <div class="flex items-center gap-3">
              <span class="w-11 h-11 rounded-xl bg-bayou-cream flex items-center justify-center text-xl font-bold shadow-sm">
                {{ res.type === 'birthday' ? '🎂' : '☕' }}
              </span>
              <div>
                <div class="font-serif font-bold text-lg text-burgundy">
                  {{ res.type === 'birthday' ? 'Anniversaire Privatisé' : 'Table Café Lounge' }}
                </div>
                <div class="text-xs text-muted-custom">
                  <i class="bi bi-calendar-event"></i> {{ res.date | date:'EEEE d MMMM y' }} à <strong class="text-burgundy">{{ res.time }}</strong>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <div>
              <span class="text-xs font-bold px-3.5 py-1.5 rounded-full uppercase inline-flex items-center gap-1.5 shadow-sm" [ngClass]="{
                'bg-amber-100 text-amber-800 border border-amber-300': res.status === 'pending',
                'bg-emerald-100 text-emerald-800 border border-emerald-300': res.status === 'confirmed',
                'bg-rose-100 text-rose-800 border border-rose-300': res.status === 'rejected' || res.status === 'cancelled'
              }">
                <i class="bi" [ngClass]="{
                  'bi-hourglass-split text-amber-600': res.status === 'pending',
                  'bi-check2-circle text-emerald-600': res.status === 'confirmed',
                  'bi-x-circle text-rose-600': res.status === 'rejected' || res.status === 'cancelled'
                }"></i>
                {{ res.status === 'pending' ? 'En attente de confirmation' : (res.status === 'confirmed' ? 'Réservation Acceptée ✅' : 'Réservation Refusée ❌') }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div class="p-3 bg-bayou-cream-soft rounded-xl">
              <strong class="text-burgundy block mb-1">Nombre d'invités :</strong>
              <span class="text-muted-custom font-semibold">{{ res.guests }} personnes</span>
            </div>

            <div *ngIf="res.birthday_person_name || res.birthday_menu" class="p-3 bg-bayou-cream-soft rounded-xl">
              <strong class="text-burgundy block mb-1">Formule & Fêté(e) :</strong>
              <span *ngIf="res.birthday_person_name" class="text-gold font-bold block">Fêté(e) : {{ res.birthday_person_name }}</span>
              <span *ngIf="res.birthday_menu" class="text-muted-custom">{{ res.birthday_menu.name_fr }}</span>
            </div>

            <div class="p-3 bg-bayou-cream-soft rounded-xl" [ngClass]="{'sm:col-span-2': !res.birthday_person_name && !res.birthday_menu, 'sm:col-span-1': res.birthday_person_name || res.birthday_menu}">
              <strong class="text-burgundy block mb-1">Votre note / description :</strong>
              <span *ngIf="res.notes" class="text-burgundy italic">"{{ res.notes }}"</span>
              <span *ngIf="!res.notes" class="text-muted-custom italic">Aucune note particulière</span>
            </div>
          </div>
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
  route = inject(ActivatedRoute);

  activeTab = signal<'table' | 'birthday' | 'my_reservations'>('table');

  birthdaySlots = signal<BirthdaySlot[]>([]);
  birthdayMenus = signal<BirthdayMenu[]>([]);
  myReservations = signal<Reservation[]>([]);
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
    this.loadMyReservations();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'my_reservations') {
        this.activeTab.set('my_reservations');
      }
    });
  }

  loadMyReservations() {
    if (this.auth.isLoggedIn()) {
      this.api.getMyReservations().subscribe(res => this.myReservations.set(res));
    }
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
        this.tableNotes = '';
        this.loadMyReservations();
        this.activeTab.set('my_reservations');
        alert('Votre réservation de table a été transmise ! Vous recevrez une confirmation.');
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
        this.selectedSlot.set(null);
        this.birthdayPersonName = '';
        this.birthdayNotes = '';
        this.loadMyReservations();
        this.activeTab.set('my_reservations');
        alert('Votre demande d\'anniversaire a été enregistrée avec succès !');
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Veuillez réessayer'));
      }
    });
  }
}
