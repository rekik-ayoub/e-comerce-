import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Order, Reservation } from '../../core/models';
import { CelebrationModalComponent } from '../../shared/components/celebration-modal.component';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, CelebrationModalComponent],
  template: `
    <div class="container-bayou py-12">
      <!-- Top Profile Card with Loyalty Meter -->
      <div class="glass-card rounded-3xl p-8 mb-10 border border-gold/30 shadow-sm">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-bayou-burgundy text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              {{ auth.currentUser()?.name?.charAt(0) || 'U' }}
            </div>
            <div>
              <h2 class="font-serif font-bold text-2xl text-burgundy">{{ auth.currentUser()?.name }}</h2>
              <div class="text-xs text-muted-custom">{{ auth.currentUser()?.email }} &bull; {{ auth.currentUser()?.phone || 'Sans téléphone' }}</div>
              <span class="inline-block mt-1 text-[11px] font-bold px-3 py-1 rounded-full bg-bayou-cream-soft text-burgundy border border-beige-mid/60">
                Statut : {{ auth.currentUser()?.role === 'admin' ? 'Administrateur' : 'Membre Lounge Privilège' }}
              </span>
            </div>
          </div>

          <!-- Points Counter & Celebration Trigger -->
          <div class="text-center md:text-right bg-bayou-gold-light/40 border border-gold/40 p-4 rounded-2xl min-w-[200px]">
            <div class="text-xs font-bold uppercase text-brown tracking-wider">Vos Points Fidélité</div>
            <div class="text-3xl font-serif font-bold text-burgundy mt-0.5">
              {{ auth.currentUser()?.points || 0 }} <span class="text-sm font-sans font-normal text-gold">/ {{ api.loyaltyInfo()?.target_score || 50 }} pts</span>
            </div>

            <button
              *ngIf="(auth.currentUser()?.points || 0) >= (api.loyaltyInfo()?.target_score || 50)"
              (click)="celebrate()"
              class="mt-2 btn-bayou-gold text-xs py-1.5 px-4 animate-bounce"
            >
              <i class="bi bi-gift-fill"></i> Réclamer mon Café Offert !
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs: Reservations vs Orders -->
      <div class="flex gap-4 border-b border-beige-mid pb-3 mb-8">
        <button
          (click)="tab.set('reservations')"
          [class.text-burgundy]="tab() === 'reservations'"
          [class.border-gold]="tab() === 'reservations'"
          class="font-serif font-bold text-lg pb-1 border-b-2 border-transparent transition-colors cursor-pointer flex items-center gap-2"
        >
          <i class="bi bi-calendar2-heart text-gold"></i> Mes Réservations ({{ reservations().length }})
        </button>
        <button
          (click)="tab.set('orders')"
          [class.text-burgundy]="tab() === 'orders'"
          [class.border-gold]="tab() === 'orders'"
          class="font-serif font-bold text-lg pb-1 border-b-2 border-transparent transition-colors cursor-pointer flex items-center gap-2"
        >
          <i class="bi bi-bag-check text-burgundy"></i> Mes Commandes ({{ orders().length }})
        </button>
      </div>

      <!-- 1. RESERVATIONS LIST -->
      <div *ngIf="tab() === 'reservations'" class="space-y-6">
        <!-- Banner if reservations exist -->
        <div *ngIf="reservations().length > 0" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="bi bi-check-circle-fill text-emerald-600 text-lg"></i>
            <span><strong>Réservations enregistrées :</strong> Vous avez {{ reservations().length }} réservation(s) dans votre compte. Consultez le statut ci-dessous.</span>
          </div>
          <a routerLink="/reservations" class="font-bold text-emerald-900 underline hover:no-underline">Nouvelle réservation &rarr;</a>
        </div>

        <div *ngIf="reservations().length === 0" class="glass-card text-center py-12 rounded-2xl">
          <i class="bi bi-calendar-heart text-4xl text-gold mb-3 block"></i>
          <h4 class="font-serif font-bold text-burgundy text-lg">Aucune réservation pour l'instant</h4>
          <p class="text-xs text-muted-custom mt-1 mb-4">Réservez une table lounge pour un café ou organisez un anniversaire inoubliable.</p>
          <a routerLink="/reservations" class="btn-bayou-gold text-xs py-2 px-6">Réserver une table ou un anniversaire</a>
        </div>

        <div *ngFor="let res of reservations()" class="glass-card rounded-2xl p-6 space-y-4 hover:shadow-md transition-all">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-beige-mid/40 pb-3">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-bayou-cream flex items-center justify-center text-gold text-xl font-bold">
                {{ res.type === 'birthday' ? '🎂' : '☕' }}
              </span>
              <div>
                <span class="font-serif font-bold text-lg text-burgundy">
                  {{ res.type === 'birthday' ? 'Anniversaire Privatisé' : 'Table Lounge Dégustation' }}
                </span>
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
                {{ res.status === 'pending' ? 'En attente de confirmation' : (res.status === 'confirmed' ? 'Réservation Confirmée & Acceptée' : 'Réservation Refusée') }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div class="p-3 bg-bayou-cream-soft rounded-xl">
              <strong class="text-burgundy block mb-1">Nombre d'invités :</strong>
              <span class="text-muted-custom">{{ res.guests }} personnes</span>
            </div>

            <div *ngIf="res.birthday_person_name || res.birthday_menu" class="p-3 bg-bayou-cream-soft rounded-xl">
              <strong class="text-burgundy block mb-1">Formule & Fêté(e) :</strong>
              <span *ngIf="res.birthday_person_name" class="text-gold font-bold block">{{ res.birthday_person_name }}</span>
              <span *ngIf="res.birthday_menu" class="text-muted-custom">{{ res.birthday_menu.name_fr }}</span>
            </div>

            <div class="p-3 bg-bayou-cream-soft rounded-xl sm:col-span-1" [ngClass]="{'sm:col-span-2': !res.birthday_person_name && !res.birthday_menu}">
              <strong class="text-burgundy block mb-1">Vos remarques & description :</strong>
              <span *ngIf="res.notes" class="text-burgundy italic">"{{ res.notes }}"</span>
              <span *ngIf="!res.notes" class="text-muted-custom italic">Aucune note particulière</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. ORDERS LIST -->
      <div *ngIf="tab() === 'orders'" class="space-y-4">
        <div *ngIf="orders().length === 0" class="glass-card text-center py-10 text-muted-custom rounded-2xl">
          Vous n'avez pas encore passé de commande.
          <div class="mt-4"><a routerLink="/catalog" class="btn-bayou-gold text-xs py-2 px-4">Commander un café</a></div>
        </div>

        <div *ngFor="let order of orders()" class="glass-card rounded-2xl p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-beige-mid/40 pb-3">
            <div>
              <span class="font-serif font-bold text-base text-burgundy">Commande #{{ order.id }}</span>
              <span class="text-xs text-muted-custom ml-2">{{ order.created_at | date:'medium' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold px-3 py-1 rounded-full uppercase" [ngClass]="{
                'bg-yellow-100 text-yellow-800': order.status === 'pending',
                'bg-blue-100 text-blue-800': order.status === 'accepted' || order.status === 'preparing',
                'bg-green-100 text-green-800': order.status === 'delivered',
                'bg-red-100 text-red-800': order.status === 'rejected'
              }">
                {{ order.status }}
              </span>
              <span class="text-lg font-bold font-serif text-burgundy">{{ order.total | number:'1.2-2' }} DT</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <strong class="text-burgundy block mb-1">Articles commandés :</strong>
              <ul class="space-y-1 text-muted-custom">
                <li *ngFor="let item of order.items">
                  &bull; {{ item.quantity }}x {{ ts.getField(item.product, 'name') }} ({{ item.unit_price }} DT)
                </li>
              </ul>
            </div>
            <div>
              <strong class="text-burgundy block mb-1">Livraison GPS & Notes :</strong>
              <p class="text-muted-custom">{{ order.delivery_address || 'Sur place' }}</p>
              <p *ngIf="order.delivery_lat" class="font-mono text-[11px] text-gold mt-1">
                GPS: {{ order.delivery_lat }}, {{ order.delivery_lng }}
              </p>
              <p *ngIf="order.notes" class="italic text-muted-custom mt-1">Note: {{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Celebration modal -->
      <app-celebration-modal
        [show]="showCelebrationModal()"
        [message]="celebrationMessage()"
        (close)="showCelebrationModal.set(false)"
      ></app-celebration-modal>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  api = inject(ApiService);

  tab = signal<'reservations' | 'orders'>('reservations');
  orders = signal<Order[]>([]);
  reservations = signal<Reservation[]>([]);

  showCelebrationModal = signal<boolean>(false);
  celebrationMessage = signal<string>('');

  ngOnInit() {
    this.api.getMyOrders().subscribe(res => this.orders.set(res));
    this.api.getMyReservations().subscribe(res => this.reservations.set(res));
  }

  celebrate() {
    this.celebrationMessage.set('Félicitations ! Vous avez atteint votre objectif de points. Dégustez votre café ou cappuccino Signature offert au lounge ou à la livraison !');
    this.showCelebrationModal.set(true);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D9B061', '#3F0D0C', '#D9C4A9', '#FDFAF6']
    });
  }
}
