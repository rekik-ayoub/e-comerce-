import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category, Order, Reservation, BirthdaySlot, BirthdayMenu, EventItem, Review } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-shell">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <!-- Brand Header -->
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon"><i class="bi bi-shield-lock-fill"></i></div>
          <div>
            <div class="sidebar-brand-title">Le Bayou</div>
            <div class="sidebar-brand-sub">Administration</div>
          </div>
        </div>

        <!-- Nav Items -->
        <nav class="sidebar-nav">
          <div class="sidebar-section-label">GESTION</div>

          <button (click)="tab.set('stats')" [class.active]="tab() === 'stats'" class="sidebar-item">
            <i class="bi bi-speedometer2"></i>
            <span>Tableau de bord</span>
          </button>

          <button (click)="tab.set('reservations')" [class.active]="tab() === 'reservations'" class="sidebar-item">
            <i class="bi bi-calendar2-heart"></i>
            <span>Réservations</span>
            <span *ngIf="pendingReservationsCount() > 0" class="sidebar-badge">{{ pendingReservationsCount() }}</span>
          </button>

          <button (click)="tab.set('orders')" [class.active]="tab() === 'orders'" class="sidebar-item">
            <i class="bi bi-bag-check"></i>
            <span>Commandes</span>
          </button>

          <div class="sidebar-section-label">MENU & CONTENU</div>

          <button (click)="tab.set('products')" [class.active]="tab() === 'products'" class="sidebar-item">
            <i class="bi bi-cup-hot"></i>
            <span>Produits & Carte</span>
          </button>

          <button (click)="tab.set('events')" [class.active]="tab() === 'events'" class="sidebar-item">
            <i class="bi bi-calendar-event"></i>
            <span>Événements</span>
          </button>

          <div class="sidebar-section-label">ANNIVERSAIRES</div>

          <button (click)="tab.set('birthday_menus')" [class.active]="tab() === 'birthday_menus'" class="sidebar-item">
            <i class="bi bi-cake2-fill"></i>
            <span>Formules Anniversaire</span>
          </button>

          <button (click)="tab.set('birthday_slots')" [class.active]="tab() === 'birthday_slots'" class="sidebar-item">
            <i class="bi bi-calendar-check"></i>
            <span>Créneaux Disponibles</span>
          </button>

          <div class="sidebar-section-label">PARAMÈTRES</div>

          <button (click)="tab.set('reviews')" [class.active]="tab() === 'reviews'" class="sidebar-item">
            <i class="bi bi-star"></i>
            <span>Avis Clients</span>
          </button>

          <button (click)="tab.set('loyalty')" [class.active]="tab() === 'loyalty'" class="sidebar-item">
            <i class="bi bi-gift"></i>
            <span>Programme Fidélité</span>
          </button>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer flex items-center justify-between">
          <div class="sidebar-admin-chip">
            <i class="bi bi-shield-check"></i>
            <span>{{ auth.currentUser()?.name || 'Administrateur' }}</span>
          </div>
          <button (click)="logout()" class="p-2 text-rose-300 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer" title="Déconnexion">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="admin-content">
        <!-- Page title bar -->
        <div class="admin-topbar">
          <div>
            <h1 class="admin-topbar-title">
              <ng-container *ngIf="tab() === 'stats'">Tableau de bord</ng-container>
              <ng-container *ngIf="tab() === 'reservations'">Réservations</ng-container>
              <ng-container *ngIf="tab() === 'orders'">Commandes & Livraisons</ng-container>
              <ng-container *ngIf="tab() === 'products'">Produits & Carte</ng-container>
              <ng-container *ngIf="tab() === 'events'">Événements</ng-container>
              <ng-container *ngIf="tab() === 'birthday_menus'">Formules Anniversaire</ng-container>
              <ng-container *ngIf="tab() === 'birthday_slots'">Créneaux Anniversaire</ng-container>
              <ng-container *ngIf="tab() === 'reviews'">Avis Clients</ng-container>
              <ng-container *ngIf="tab() === 'loyalty'">Programme Fidélité</ng-container>
            </h1>
            <p class="admin-topbar-sub">Panneau de contrôle · Le Bayou Coffee Lounge</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-muted-custom hidden sm:inline">Connecté : <strong>{{ auth.currentUser()?.email || 'admin@lebayou.com' }}</strong></span>
            <button (click)="logout()" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer" title="Déconnexion">
              <i class="bi bi-box-arrow-right"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        <div class="admin-content-inner">

      <!-- 1. STATS OVERVIEW -->
      <div *ngIf="tab() === 'stats'" class="space-y-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <!-- Total Commandes -->
          <div class="glass-card p-5 rounded-2xl border-l-4 border-l-burgundy">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xs text-muted-custom font-bold uppercase">Total Commandes</div>
                <div class="text-3xl font-serif font-bold text-burgundy mt-2">{{ adminOrders().length }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-bayou-cream flex items-center justify-center text-burgundy">
                <i class="bi bi-bag-check text-lg"></i>
              </div>
            </div>
            <div class="text-xs text-amber-700 font-semibold mt-2">{{ stats()?.pending_orders || 0 }} en cours</div>
          </div>

          <!-- Réservations En Attente -->
          <div class="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xs text-amber-800 font-bold uppercase">En Attente</div>
                <div class="text-3xl font-serif font-bold text-amber-600 mt-2">{{ pendingReservationsCount() }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <i class="bi bi-clock-history text-lg"></i>
              </div>
            </div>
            <div class="text-xs text-muted-custom mt-2">À traiter rapidement</div>
          </div>

          <!-- Réservations Acceptées -->
          <div class="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-600">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xs text-emerald-800 font-bold uppercase">Acceptées</div>
                <div class="text-3xl font-serif font-bold text-emerald-600 mt-2">{{ confirmedReservationsCount() }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <i class="bi bi-check2-circle text-lg"></i>
              </div>
            </div>
            <div class="text-xs text-emerald-700 mt-2">Tables & Anniv validés</div>
          </div>

          <!-- Réservations Refusées -->
          <div class="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xs text-rose-800 font-bold uppercase">Refusées</div>
                <div class="text-3xl font-serif font-bold text-rose-600 mt-2">{{ rejectedReservationsCount() }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <i class="bi bi-x-circle text-lg"></i>
              </div>
            </div>
            <div class="text-xs text-muted-custom mt-2">Rejetées</div>
          </div>
        </div>

        <!-- Quick actions strip -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-card p-6 rounded-2xl space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-serif font-bold text-lg text-burgundy">Dernières Réservations</h3>
              <button (click)="tab.set('reservations')" class="text-xs text-gold font-bold hover:underline">
                Voir toutes ({{ adminReservations().length }}) &rarr;
              </button>
            </div>

            <div *ngIf="adminReservations().length === 0" class="text-xs text-muted-custom text-center py-6">
              Aucune réservation pour le moment.
            </div>

            <div class="space-y-3">
              <div *ngFor="let res of adminReservations().slice(0, 4)" class="p-3 bg-bayou-cream-soft rounded-xl flex items-center justify-between gap-3 text-xs border border-beige-mid/40">
                <div>
                  <div class="font-bold text-burgundy flex items-center gap-2">
                    <span *ngIf="res.type === 'birthday'" class="px-2 py-0.5 rounded bg-gold/20 text-burgundy font-bold text-[10px]">🎂 Anniversaire</span>
                    <span *ngIf="res.type !== 'birthday'" class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">☕ Table Café</span>
                    <span>{{ res.user?.name || 'Client' }}</span>
                  </div>
                  <div class="text-muted-custom mt-0.5">
                    {{ res.date | date:'EEE d MMM' }} à {{ res.time }} &bull; {{ res.guests }} pers.
                    <span *ngIf="res.notes" class="text-burgundy font-medium block mt-1 italic">
                      "{{ res.notes }}"
                    </span>
                  </div>
                </div>

                <div class="flex gap-1.5 flex-shrink-0 items-center">
                  <button *ngIf="res.status === 'pending'" (click)="updateReservationStatus(res.id, 'confirmed')" class="btn-action bg-green-600 text-white" title="Accepter">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button *ngIf="res.status === 'pending'" (click)="updateReservationStatus(res.id, 'rejected')" class="btn-action bg-red-600 text-white" title="Refuser">
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <button (click)="deleteReservation(res.id)" class="btn-action bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white" title="Supprimer la réservation">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-serif font-bold text-lg text-burgundy">Actions Rapides</h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button (click)="tab.set('birthday_menus'); openCreateBirthdayMenu()" class="p-4 bg-bayou-cream-soft hover:bg-bayou-gold/10 border border-beige-mid rounded-xl text-left transition-all">
                <i class="bi bi-cake2-fill text-gold text-xl block mb-1"></i>
                <strong class="text-xs text-burgundy block">Formules Anniversaire</strong>
                <span class="text-[11px] text-muted-custom">Ajouter ou supprimer menus</span>
              </button>
              <button (click)="tab.set('products'); openCreateProduct()" class="p-4 bg-bayou-cream-soft hover:bg-bayou-gold/10 border border-beige-mid rounded-xl text-left transition-all">
                <i class="bi bi-plus-circle text-gold text-xl block mb-1"></i>
                <strong class="text-xs text-burgundy block">Ajouter un Produit</strong>
                <span class="text-[11px] text-muted-custom">Importer image du bureau</span>
              </button>
              <button (click)="tab.set('events'); openCreateEvent()" class="p-4 bg-bayou-cream-soft hover:bg-bayou-gold/10 border border-beige-mid rounded-xl text-left transition-all">
                <i class="bi bi-calendar-plus text-burgundy text-xl block mb-1"></i>
                <strong class="text-xs text-burgundy block">Ajouter un Événement</strong>
                <span class="text-[11px] text-muted-custom">Soirée, Concert, Live</span>
              </button>
              <button (click)="tab.set('loyalty')" class="p-4 bg-bayou-cream-soft hover:bg-bayou-gold/10 border border-beige-mid rounded-xl text-left transition-all">
                <i class="bi bi-gift text-gold text-xl block mb-1"></i>
                <strong class="text-xs text-burgundy block">Score Cible Fidélité</strong>
                <span class="text-[11px] text-muted-custom">{{ api.loyaltyInfo()?.target_score || 50 }} pts requis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. RESERVATIONS MANAGEMENT (CLEAR TABLE VS BIRTHDAY DISTINCTION) -->
      <div *ngIf="tab() === 'reservations'" class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="font-serif font-bold text-2xl text-burgundy">Gestion des Réservations</h3>
            <p class="text-xs text-muted-custom">Distinction claire entre réservations normales (Café/Table) et Anniversaires avec formule.</p>
          </div>

          <!-- Status & Type Filter Tabs -->
          <div class="flex flex-wrap gap-1.5 bg-bayou-cream-soft p-1 rounded-xl border border-beige-mid text-xs">
            <button
              (click)="reservationFilter.set('all')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'all' ? 'bg-bayou-burgundy text-white' : 'text-burgundy hover:bg-bayou-gold/20'"
            >
              Toutes ({{ adminReservations().length }})
            </button>
            <button
              (click)="reservationFilter.set('pending')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'pending' ? 'bg-amber-500 text-white' : 'text-amber-800 hover:bg-amber-100'"
            >
              En Attente ({{ pendingReservationsCount() }})
            </button>
            <button
              (click)="reservationFilter.set('confirmed')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'confirmed' ? 'bg-green-600 text-white' : 'text-green-800 hover:bg-green-100'"
            >
              Acceptées ({{ confirmedReservationsCount() }})
            </button>
            <button
              (click)="reservationFilter.set('rejected')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'rejected' ? 'bg-red-600 text-white' : 'text-red-800 hover:bg-red-100'"
            >
              Refusées ({{ rejectedReservationsCount() }})
            </button>
            <button
              (click)="reservationFilter.set('type_table')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'type_table' ? 'bg-blue-600 text-white' : 'text-blue-800 hover:bg-blue-100'"
            >
              ☕ Tables Café ({{ tableReservationsCount() }})
            </button>
            <button
              (click)="reservationFilter.set('type_birthday')"
              class="px-3 py-1.5 rounded-lg font-bold transition-all"
              [ngClass]="reservationFilter() === 'type_birthday' ? 'bg-gold text-burgundy font-extrabold' : 'text-gold hover:bg-amber-100'"
            >
              🎂 Anniversaires ({{ birthdayReservationsCount() }})
            </button>
          </div>
        </div>

        <div *ngIf="filteredReservations().length === 0" class="glass-card p-12 text-center rounded-2xl">
          <i class="bi bi-calendar-x text-4xl text-gold mb-2 block"></i>
          <h4 class="font-serif font-bold text-burgundy text-lg">Aucune réservation dans cette catégorie</h4>
          <p class="text-xs text-muted-custom mt-1">Sélectionnez un autre filtre ci-dessus pour afficher les réservations.</p>
        </div>

        <div *ngIf="filteredReservations().length > 0" class="overflow-x-auto glass-card rounded-2xl shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-bayou-cream-soft text-burgundy font-bold uppercase border-b border-beige-mid">
              <tr>
                <th class="p-3.5">Type de Réservation</th>
                <th class="p-3.5">Client & Contact</th>
                <th class="p-3.5">Date & Heure</th>
                <th class="p-3.5">Invités / Formule</th>
                <th class="p-3.5 max-w-xs">Description & Demande Client</th>
                <th class="p-3.5">Statut</th>
                <th class="p-3.5 text-center">Actions Décision</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-beige-mid/40">
              <tr *ngFor="let res of filteredReservations()" class="hover:bg-bayou-cream/20 transition-colors">
                <!-- Highlight Type -->
                <td class="p-3.5 whitespace-nowrap">
                  <div *ngIf="res.type === 'birthday'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 border border-gold text-burgundy font-bold text-xs shadow-sm">
                    <span class="text-base">🎂</span>
                    <span>ANNIVERSAIRE PRIVÉ</span>
                  </div>
                  <div *ngIf="res.type !== 'birthday'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs">
                    <span class="text-base">☕</span>
                    <span>TABLE CAFÉ (NORMALE)</span>
                  </div>
                  <span class="text-[10px] text-muted-custom block mt-1 font-mono">Ref #{{ res.id }}</span>
                </td>

                <td class="p-3.5">
                  <strong class="text-burgundy text-sm block">{{ res.user?.name || 'Client' }}</strong>
                  <span class="text-muted-custom block"><i class="bi bi-telephone"></i> {{ res.user?.phone || 'Non renseigné' }}</span>
                  <span class="text-[10px] text-muted-custom"><i class="bi bi-envelope"></i> {{ res.user?.email }}</span>
                </td>

                <td class="p-3.5 whitespace-nowrap">
                  <div class="font-bold text-burgundy">{{ res.date | date:'EEEE d MMMM y' }}</div>
                  <div class="font-serif font-bold text-gold text-sm">{{ res.time }}</div>
                </td>

                <td class="p-3.5">
                  <div class="font-bold text-burgundy">{{ res.guests }} personnes</div>
                  <div *ngIf="res.birthday_person_name" class="text-gold font-bold text-xs mt-0.5">
                    🎂 Fêté(e) : {{ res.birthday_person_name }}
                  </div>
                  <div *ngIf="res.birthday_menu" class="text-muted-custom text-[11px] mt-0.5">
                    <i class="bi bi-bookmark-star text-gold"></i> Formule : <strong>{{ res.birthday_menu.name_fr }}</strong>
                  </div>
                </td>

                <!-- Prominent display of client description/notes -->
                <td class="p-3.5 max-w-xs">
                  <div *ngIf="res.notes" class="p-2.5 bg-bayou-cream-soft rounded-xl border border-beige-mid/60 text-burgundy text-[11px]">
                    <div class="font-bold text-gold text-[10px] uppercase mb-0.5"><i class="bi bi-chat-quote-fill"></i> Note du client :</div>
                    "{{ res.notes }}"
                  </div>
                  <div *ngIf="!res.notes" class="text-muted-custom italic text-[11px]">
                    Aucune remarque spéciale
                  </div>
                </td>

                <td class="p-3.5 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1" [ngClass]="{
                    'bg-yellow-100 text-yellow-800 border border-yellow-200': res.status === 'pending',
                    'bg-green-100 text-green-800 border border-green-200': res.status === 'confirmed',
                    'bg-red-100 text-red-800 border border-red-200': res.status === 'rejected'
                  }">
                    <i class="bi" [ngClass]="{
                      'bi-clock-history': res.status === 'pending',
                      'bi-check-circle-fill': res.status === 'confirmed',
                      'bi-x-circle-fill': res.status === 'rejected'
                    }"></i>
                    {{ res.status === 'pending' ? 'En attente' : (res.status === 'confirmed' ? 'Acceptée' : 'Refusée') }}
                  </span>
                </td>

                <td class="p-3.5 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      *ngIf="res.status !== 'confirmed'"
                      (click)="updateReservationStatus(res.id, 'confirmed')"
                      class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Accepter cette réservation"
                    >
                      <i class="bi bi-check-lg"></i> Accepter
                    </button>
                    <button
                      *ngIf="res.status !== 'rejected'"
                      (click)="updateReservationStatus(res.id, 'rejected')"
                      class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Refuser cette réservation"
                    >
                      <i class="bi bi-x-lg"></i> Refuser
                    </button>
                    <button
                      (click)="deleteReservation(res.id)"
                      class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Supprimer définitivement la réservation"
                    >
                      <i class="bi bi-trash"></i> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. BIRTHDAY MENUS MANAGEMENT (ADD / EDIT / DELETE FORMULAS) -->
      <div *ngIf="tab() === 'birthday_menus'" class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="font-serif font-bold text-2xl text-burgundy">Gestion des Formules d'Anniversaire</h3>
            <p class="text-xs text-muted-custom">Ajoutez de nouvelles formules d'anniversaire, importez leurs photos depuis votre bureau, ou supprimez les anciennes.</p>
          </div>
          <button (click)="openCreateBirthdayMenu()" class="btn-bayou-gold text-xs py-2.5 px-5 shadow-sm">
            <i class="bi bi-plus-lg"></i> Ajouter une Formule Anniversaire
          </button>
        </div>

        <!-- Birthday Menu Form Modal / Section -->
        <div *ngIf="showNewBirthdayMenuForm() || editingBirthdayMenu()" class="glass-card p-6 md:p-8 rounded-2xl border-2 border-gold/40 space-y-6 bg-bayou-cream-soft/80 shadow-md">
          <div class="flex justify-between items-center pb-4 border-b border-beige-mid">
            <div>
              <h4 class="font-serif font-bold text-burgundy text-lg">
                {{ editingBirthdayMenu() ? 'Modifier la Formule : ' + editingBirthdayMenu()?.name_fr : 'Nouvelle Formule Anniversaire' }}
              </h4>
              <p class="text-xs text-muted-custom">Renseignez le nom, le tarif en DT, la composition et l'image depuis le bureau.</p>
            </div>
            <button (click)="cancelEditBirthdayMenu()" class="text-xs text-muted-custom hover:text-burgundy p-1">
              <i class="bi bi-x-lg text-base"></i> Annuler
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Nom de la Formule (FR) *</label>
                <input type="text" [(ngModel)]="activeBMenuForm.name_fr" placeholder="Ex: Formule Prestige Lounge" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Nom (EN)</label>
                <input type="text" [(ngModel)]="activeBMenuForm.name_en" placeholder="Ex: Prestige Lounge Package" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Prix en Dinars Tunisiens (DT) *</label>
                <div class="relative">
                  <input type="number" step="1" [(ngModel)]="activeBMenuForm.price" placeholder="Prix" class="w-full p-2.5 pr-10 border rounded-xl bg-white font-bold text-burgundy" />
                  <span class="absolute right-3 top-2.5 font-bold text-gold">DT</span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Description & Contenu (FR)</label>
                <textarea rows="4" [(ngModel)]="activeBMenuForm.description_fr" placeholder="Gâteau personnalisé, boissons, décoration de table..." class="w-full p-2.5 border rounded-xl bg-white"></textarea>
              </div>
            </div>

            <!-- Desktop Image Upload -->
            <div class="space-y-2">
              <label class="block font-bold text-burgundy mb-1">Photo de la Formule *</label>
              
              <div class="border-2 border-dashed border-gold/60 rounded-2xl p-4 text-center bg-white/70 hover:bg-white transition-all flex flex-col items-center justify-center min-h-[160px]">
                <div *ngIf="activeBMenuForm.image" class="relative mb-2">
                  <img [src]="activeBMenuForm.image" class="w-24 h-24 object-cover rounded-xl shadow border border-beige-mid mx-auto" />
                  <span class="text-[10px] text-green-700 font-bold block mt-1"><i class="bi bi-check-circle"></i> Image prête</span>
                </div>

                <div *ngIf="!activeBMenuForm.image" class="text-muted-custom mb-2">
                  <i class="bi bi-cake2 text-3xl text-gold block mb-1"></i>
                  <span>Aucune photo sélectionnée</span>
                </div>

                <label class="cursor-pointer bg-bayou-gold hover:bg-bayou-burgundy text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all inline-flex items-center gap-2">
                  <i class="bi bi-folder2-open"></i> Importer du Bureau / PC
                  <input type="file" accept="image/*" (change)="onBirthdayMenuImageSelected($event)" class="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-beige-mid">
            <button (click)="saveBirthdayMenu()" class="btn-bayou-burgundy text-xs py-2.5 px-8 shadow-sm">
              <i class="bi bi-save"></i> {{ editingBirthdayMenu() ? 'Enregistrer les modifications' : 'Créer la Formule' }}
            </button>
            <button (click)="cancelEditBirthdayMenu()" class="btn-bayou-outline text-xs py-2.5 px-6">
              Annuler
            </button>
          </div>
        </div>

        <!-- Birthday Menus Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let m of adminBirthdayMenus()" class="glass-card rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="relative h-44 overflow-hidden">
                <img [src]="m.image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop'" class="w-full h-full object-cover" />
                <div class="absolute top-3 right-3 bg-bayou-burgundy/90 text-gold font-serif font-bold text-sm px-3 py-1 rounded-full shadow">
                  {{ m.price | number:'1.2-2' }} DT
                </div>
              </div>
              <div class="p-5 text-xs space-y-2">
                <h4 class="font-serif font-bold text-xl text-burgundy">{{ m.name_fr }}</h4>
                <p class="text-muted-custom leading-relaxed">{{ m.description_fr }}</p>
              </div>
            </div>

            <div class="p-5 pt-0 flex gap-2 justify-end border-t border-beige-mid/40 mt-3 pt-3">
              <button (click)="startEditBirthdayMenu(m)" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors">
                <i class="bi bi-pencil-square"></i> Modifier
              </button>
              <button (click)="deleteBirthdayMenu(m.id)" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors">
                <i class="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. PRODUCTS MANAGEMENT (WITH DESKTOP IMAGE IMPORT) -->
      <div *ngIf="tab() === 'products'" class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="font-serif font-bold text-2xl text-burgundy">Catalogue Produits</h3>
            <p class="text-xs text-muted-custom">Ajoutez de nouveaux délices, importez leurs photos depuis votre bureau, et modifiez prix et descriptions.</p>
          </div>
          <button (click)="openCreateProduct()" class="btn-bayou-gold text-xs py-2.5 px-5 shadow-sm">
            <i class="bi bi-plus-lg"></i> Ajouter un Produit
          </button>
        </div>

        <!-- Product Form Modal / Section -->
        <div *ngIf="showNewProductForm() || editingProduct()" class="glass-card p-6 md:p-8 rounded-2xl border-2 border-gold/40 space-y-6 bg-bayou-cream-soft/80 shadow-md">
          <div class="flex justify-between items-center pb-4 border-b border-beige-mid">
            <div>
              <h4 class="font-serif font-bold text-burgundy text-lg">
                {{ editingProduct() ? 'Modifier le Produit : ' + editingProduct()?.name_fr : 'Nouveau Produit au Menu' }}
              </h4>
              <p class="text-xs text-muted-custom">Renseignez les détails et importez une image depuis vos dossiers.</p>
            </div>
            <button (click)="cancelEditProduct()" class="text-xs text-muted-custom hover:text-burgundy p-1">
              <i class="bi bi-x-lg text-base"></i> Annuler
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Nom du Produit (FR) *</label>
                <input type="text" [(ngModel)]="activeProdForm.name_fr" placeholder="Ex: Café Crème Vanille" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Nom (EN)</label>
                <input type="text" [(ngModel)]="activeProdForm.name_en" placeholder="Ex: Vanilla Cream Coffee" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Catégorie *</label>
                <select [(ngModel)]="activeProdForm.category_id" class="w-full p-2.5 border rounded-xl bg-white">
                  <option [ngValue]="1">☕ Cafés & Espressos</option>
                  <option [ngValue]="2">🥤 Boissons Fraîches & Mocktails</option>
                  <option [ngValue]="3">🥐 Pâtisseries & Gourmandises</option>
                  <option [ngValue]="4">📦 Grains & Merch</option>
                </select>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Prix en Dinars Tunisiens (DT) *</label>
                <div class="relative">
                  <input type="number" step="0.5" [(ngModel)]="activeProdForm.price" placeholder="Prix" class="w-full p-2.5 pr-10 border rounded-xl bg-white font-bold text-burgundy" />
                  <span class="absolute right-3 top-2.5 font-bold text-gold">DT</span>
                </div>
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Description (FR)</label>
                <textarea rows="3" [(ngModel)]="activeProdForm.description_fr" placeholder="Notes de dégustation, ingrédients..." class="w-full p-2.5 border rounded-xl bg-white"></textarea>
              </div>
            </div>

            <!-- Desktop Image Upload -->
            <div class="space-y-2">
              <label class="block font-bold text-burgundy mb-1">Photo du Produit *</label>
              
              <div class="border-2 border-dashed border-gold/60 rounded-2xl p-4 text-center bg-white/70 hover:bg-white transition-all flex flex-col items-center justify-center min-h-[160px]">
                <div *ngIf="activeProdForm.image" class="relative mb-2">
                  <img [src]="activeProdForm.image" class="w-24 h-24 object-cover rounded-xl shadow border border-beige-mid mx-auto" />
                  <span class="text-[10px] text-green-700 font-bold block mt-1"><i class="bi bi-check-circle"></i> Image chargée</span>
                </div>

                <div *ngIf="!activeProdForm.image" class="text-muted-custom mb-2">
                  <i class="bi bi-image text-3xl text-gold block mb-1"></i>
                  <span>Aucune image sélectionnée</span>
                </div>

                <label class="cursor-pointer bg-bayou-gold hover:bg-bayou-burgundy text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all inline-flex items-center gap-2">
                  <i class="bi bi-folder2-open"></i> Importer du Bureau / PC
                  <input type="file" accept="image/*" (change)="onProductImageSelected($event)" class="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-beige-mid">
            <button (click)="saveProduct()" class="btn-bayou-burgundy text-xs py-2.5 px-8 shadow-sm">
              <i class="bi bi-save"></i> {{ editingProduct() ? 'Enregistrer les modifications' : 'Ajouter au catalogue' }}
            </button>
            <button (click)="cancelEditProduct()" class="btn-bayou-outline text-xs py-2.5 px-6">
              Annuler
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div *ngFor="let p of adminProducts()" class="glass-card p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
            <img [src]="p.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop'" class="w-20 h-20 object-cover rounded-xl border border-beige-mid flex-shrink-0" />
            <div class="flex-grow min-w-0 text-xs">
              <strong class="text-burgundy block font-serif text-sm truncate">{{ p.name_fr }}</strong>
              <div class="font-serif font-bold text-gold text-base mt-0.5">{{ p.price | number:'1.2-2' }} DT</div>
              <span class="text-muted-custom text-[11px] block truncate">{{ p.category?.name_fr }}</span>
            </div>
            <div class="flex flex-col gap-2 flex-shrink-0">
              <button (click)="startEditProduct(p)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors" title="Modifier le produit">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button (click)="deleteProduct(p.id)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors" title="Supprimer">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. EVENTS MANAGEMENT -->
      <div *ngIf="tab() === 'events'" class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="font-serif font-bold text-2xl text-burgundy">Gestion des Événements</h3>
            <p class="text-xs text-muted-custom">Ajoutez des soirées acoustiques, concerts, dégustations et importez l'affiche directement depuis votre bureau.</p>
          </div>
          <button (click)="openCreateEvent()" class="btn-bayou-gold text-xs py-2.5 px-5 shadow-sm">
            <i class="bi bi-calendar-plus"></i> Ajouter un Événement
          </button>
        </div>

        <!-- Event Form -->
        <div *ngIf="showNewEventForm() || editingEvent()" class="glass-card p-6 md:p-8 rounded-2xl border-2 border-gold/40 space-y-6 bg-bayou-cream-soft/80 shadow-md">
          <div class="flex justify-between items-center pb-4 border-b border-beige-mid">
            <div>
              <h4 class="font-serif font-bold text-burgundy text-lg">
                {{ editingEvent() ? 'Modifier l\'Événement : ' + editingEvent()?.title_fr : 'Nouvel Événement Le Bayou' }}
              </h4>
              <p class="text-xs text-muted-custom">Précisez la date, l'heure et l'affiche promotionnelle.</p>
            </div>
            <button (click)="cancelEditEvent()" class="text-xs text-muted-custom hover:text-burgundy p-1">
              <i class="bi bi-x-lg text-base"></i> Annuler
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Titre de l'Événement (FR) *</label>
                <input type="text" [(ngModel)]="activeEventForm.title_fr" placeholder="Ex: Soirée Acoustique & Jazz" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Titre (EN)</label>
                <input type="text" [(ngModel)]="activeEventForm.title_en" placeholder="Ex: Acoustic Jazz Night" class="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div>
                <label class="block font-bold text-burgundy mb-1">Date de l'événement *</label>
                <input type="datetime-local" [(ngModel)]="activeEventForm.event_date" class="w-full p-2.5 border rounded-xl bg-white font-bold" />
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block font-bold text-burgundy mb-1">Description (FR)</label>
                <textarea rows="4" [(ngModel)]="activeEventForm.description_fr" placeholder="Détails du programme, artistes invités..." class="w-full p-2.5 border rounded-xl bg-white"></textarea>
              </div>
            </div>

            <!-- Event Image Upload -->
            <div class="space-y-2">
              <label class="block font-bold text-burgundy mb-1">Affiche / Image *</label>
              
              <div class="border-2 border-dashed border-gold/60 rounded-2xl p-4 text-center bg-white/70 hover:bg-white transition-all flex flex-col items-center justify-center min-h-[160px]">
                <div *ngIf="activeEventForm.image" class="relative mb-2">
                  <img [src]="activeEventForm.image" class="w-24 h-24 object-cover rounded-xl shadow border border-beige-mid mx-auto" />
                  <span class="text-[10px] text-green-700 font-bold block mt-1"><i class="bi bi-check-circle"></i> Affiche chargée</span>
                </div>

                <div *ngIf="!activeEventForm.image" class="text-muted-custom mb-2">
                  <i class="bi bi-image text-3xl text-gold block mb-1"></i>
                  <span>Aucune affiche sélectionnée</span>
                </div>

                <label class="cursor-pointer bg-bayou-gold hover:bg-bayou-burgundy text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all inline-flex items-center gap-2">
                  <i class="bi bi-folder2-open"></i> Importer Affiche du Bureau
                  <input type="file" accept="image/*" (change)="onEventImageSelected($event)" class="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-beige-mid">
            <button (click)="saveEvent()" class="btn-bayou-burgundy text-xs py-2.5 px-8 shadow-sm">
              <i class="bi bi-save"></i> {{ editingEvent() ? 'Enregistrer les modifications' : 'Publier l\'événement' }}
            </button>
            <button (click)="cancelEditEvent()" class="btn-bayou-outline text-xs py-2.5 px-6">
              Annuler
            </button>
          </div>
        </div>

        <!-- Events List Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let ev of adminEvents()" class="glass-card rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="relative h-44 overflow-hidden">
                <img [src]="ev.image || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop'" class="w-full h-full object-cover" />
                <div class="absolute top-3 right-3 bg-bayou-burgundy/90 text-white font-serif font-bold text-xs px-3 py-1 rounded-full shadow">
                  {{ ev.event_date | date:'d MMMM y' }}
                </div>
              </div>
              <div class="p-5 text-xs space-y-2">
                <h4 class="font-serif font-bold text-lg text-burgundy">{{ ev.title_fr }}</h4>
                <p class="text-muted-custom line-clamp-3">{{ ev.description_fr }}</p>
              </div>
            </div>

            <div class="p-5 pt-0 flex gap-2 justify-end border-t border-beige-mid/40 mt-3 pt-3">
              <button (click)="startEditEvent(ev)" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors">
                <i class="bi bi-pencil-square"></i> Modifier
              </button>
              <button (click)="deleteEvent(ev.id)" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors">
                <i class="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. ORDERS MANAGEMENT -->
      <div *ngIf="tab() === 'orders'" class="space-y-4">
        <h3 class="font-serif font-bold text-2xl text-burgundy">Gestion des Commandes & Livraisons</h3>

        <div class="overflow-x-auto glass-card rounded-2xl shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-bayou-cream-soft text-burgundy font-bold uppercase border-b border-beige-mid">
              <tr>
                <th class="p-3.5">ID</th>
                <th class="p-3.5">Client & Contact</th>
                <th class="p-3.5">Articles</th>
                <th class="p-3.5">Total (DT)</th>
                <th class="p-3.5">Adresse & GPS</th>
                <th class="p-3.5">Statut Actuel</th>
                <th class="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-beige-mid/40">
              <tr *ngFor="let ord of adminOrders()" class="hover:bg-bayou-cream/20">
                <td class="p-3.5 font-bold">#{{ ord.id }}</td>
                <td class="p-3.5">
                  <strong class="text-burgundy block">{{ ord.user?.name }}</strong>
                  <span class="text-muted-custom">{{ ord.user?.phone || ord.user?.email }}</span>
                </td>
                <td class="p-3.5">
                  <div *ngFor="let item of ord.items">
                    {{ item.quantity }}x {{ item.product?.name_fr }}
                  </div>
                </td>
                <td class="p-3.5 font-serif font-bold text-sm text-burgundy whitespace-nowrap">
                  {{ ord.total | number:'1.2-2' }} DT
                </td>
                <td class="p-3.5 max-w-xs">
                  <div class="font-medium">{{ ord.delivery_address || 'Sur place' }}</div>
                  <!-- GPS Block -->
                  <ng-container *ngIf="ord.delivery_lat && ord.delivery_lng">
                    <div class="mt-1.5 flex flex-wrap gap-1.5 items-center">
                      <!-- Open in Google Maps -->
                      <a [href]="'https://www.google.com/maps?q=' + ord.delivery_lat + ',' + ord.delivery_lng"
                         target="_blank"
                         class="inline-flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold hover:bg-blue-700 no-underline transition-colors">
                        <i class="bi bi-geo-alt-fill"></i> Voir sur Maps
                      </a>
                      <!-- Copy GPS link for delivery person -->
                      <button (click)="copyGps(ord.delivery_lat, ord.delivery_lng)"
                              class="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold hover:bg-amber-600 transition-colors"
                              title="Copier le lien GPS pour le livreur">
                        <i class="bi bi-clipboard-fill"></i> Copier lien
                      </button>
                    </div>
                    <div class="font-mono text-[9px] text-muted-custom mt-1">
                      {{ ord.delivery_lat | number:'1.5-5' }}, {{ ord.delivery_lng | number:'1.5-5' }}
                    </div>
                  </ng-container>
                  <div *ngIf="!ord.delivery_lat" class="text-[10px] text-muted-custom mt-0.5 italic">Pas de GPS</div>
                </td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-full font-bold uppercase text-[10px]" [ngClass]="{
                    'bg-yellow-100 text-yellow-800': ord.status === 'pending',
                    'bg-blue-100 text-blue-800': ord.status === 'accepted' || ord.status === 'preparing',
                    'bg-green-100 text-green-800': ord.status === 'delivered',
                    'bg-red-100 text-red-800': ord.status === 'rejected'
                  }">
                    {{ ord.status }}
                  </span>
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                  <div class="flex gap-1.5 justify-center items-center">
                    <button *ngIf="ord.status !== 'accepted' && ord.status !== 'delivered'" (click)="updateOrderStatus(ord.id, 'accepted')" class="btn-action bg-green-600 hover:bg-green-700 text-white" title="Accepter la commande">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button *ngIf="ord.status !== 'rejected'" (click)="updateOrderStatus(ord.id, 'rejected')" class="btn-action bg-red-600 hover:bg-red-700 text-white" title="Refuser la commande">
                      <i class="bi bi-x-lg"></i>
                    </button>
                    <button *ngIf="ord.status === 'accepted' || ord.status === 'preparing'" (click)="updateOrderStatus(ord.id, 'delivered')" class="btn-action bg-blue-600 hover:bg-blue-700 text-white" title="Marquer comme Livré">
                      <i class="bi bi-truck"></i>
                    </button>
                    <button (click)="deleteOrder(ord.id)" class="btn-action bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200" title="Supprimer la commande">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 7. BIRTHDAY SLOTS MANAGEMENT -->
      <div *ngIf="tab() === 'birthday_slots'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-serif font-bold text-2xl text-burgundy">Créneaux Anniversaire Disponibles</h3>
          <div class="flex gap-2">
            <input type="date" [(ngModel)]="newSlotDate" class="text-xs p-2 border rounded-xl" />
            <select [(ngModel)]="newSlotTime" class="text-xs p-2 border rounded-xl">
              <option value="14:30:00">14:30</option>
              <option value="17:00:00">17:00</option>
              <option value="19:30:00">19:30</option>
            </select>
            <button (click)="addBirthdaySlot()" class="btn-bayou-gold text-xs py-2 px-4">
              Ajouter Créneau
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div *ngFor="let slot of adminSlots()" class="glass-card p-3.5 rounded-xl text-center text-xs relative">
            <button (click)="deleteBirthdaySlot(slot.id)" class="absolute top-1 right-1 text-red-500 hover:text-red-700">
              <i class="bi bi-x"></i>
            </button>
            <div class="font-bold text-burgundy">{{ slot.date | date:'EEE d MMM' }}</div>
            <div class="font-serif font-bold text-gold mt-1">{{ slot.time.substring(0, 5) }}</div>
            <span class="text-[10px] block mt-1 font-semibold" [class.text-green-600]="slot.is_available" [class.text-red-600]="!slot.is_available">
              {{ slot.is_available ? 'Disponible' : 'Complet' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 8. REVIEWS MODERATION -->
      <div *ngIf="tab() === 'reviews'" class="space-y-4">
        <h3 class="font-serif font-bold text-2xl text-burgundy">Modération des Avis</h3>

        <div class="space-y-3">
          <div *ngFor="let rev of adminReviews()" class="glass-card p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div>
              <div class="flex items-center gap-2">
                <strong class="text-burgundy">{{ rev.user?.name || 'Client' }}</strong>
                <span class="text-gold font-bold">★ {{ rev.rating }}/5</span>
                <span class="text-muted-custom">&bull; {{ rev.type === 'cafe' ? 'Lounge' : 'Produit' }}</span>
              </div>
              <p class="text-muted-custom mt-1">"{{ rev.comment }}"</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleReview(rev.id)"
                class="px-3 py-1.5 rounded-full font-bold text-[11px]"
                [class.bg-green-100]="rev.approved"
                [class.text-green-800]="rev.approved"
                [class.bg-yellow-100]="!rev.approved"
                [class.text-yellow-800]="!rev.approved"
              >
                {{ rev.approved ? 'Approuvé (Visible)' : 'En attente (Masqué)' }}
              </button>

              <button (click)="deleteReview(rev.id)" class="text-red-600 hover:text-red-800 p-1.5">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 9. LOYALTY SETTINGS (REAL-TIME INSTANT UPDATE) -->
      <div *ngIf="tab() === 'loyalty'" class="max-w-xl mx-auto glass-card rounded-2xl p-8 space-y-6 shadow-sm">
        <div class="flex items-center gap-3 border-b border-beige-mid pb-4">
          <div class="w-12 h-12 rounded-2xl bg-bayou-gold/20 flex items-center justify-center text-gold text-2xl">
            <i class="bi bi-gift-fill"></i>
          </div>
          <div>
            <h3 class="font-serif font-bold text-2xl text-burgundy">Configuration du Programme Fidélité</h3>
            <p class="text-xs text-muted-custom">
              Toute modification mettra à jour en direct le bandeau rouge en haut du site et l'espace profil des clients.
            </p>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-burgundy mb-1">Points attribués par commande</label>
            <input type="number" [(ngModel)]="loyaltySettings.points_per_order" class="w-full p-2.5 border rounded-xl bg-white font-bold" />
            <span class="text-[11px] text-muted-custom">Exemple : 10 points gagnés à chaque commande passée.</span>
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Score cible pour débloquer le café offert *</label>
            <input type="number" [(ngModel)]="loyaltySettings.target_score" class="w-full p-2.5 border rounded-xl bg-white font-bold text-burgundy text-sm" />
            <span class="text-[11px] text-amber-700 font-medium">Ce nombre apparaîtra instantanément dans le bandeau supérieur rouge.</span>
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Message récompense (FR)</label>
            <input type="text" [(ngModel)]="loyaltySettings.reward_description_fr" class="w-full p-2.5 border rounded-xl bg-white" />
          </div>

          <div>
            <label class="block font-bold text-burgundy mb-1">Message récompense (EN)</label>
            <input type="text" [(ngModel)]="loyaltySettings.reward_description_en" class="w-full p-2.5 border rounded-xl bg-white" />
          </div>

          <button (click)="saveLoyaltySettings()" class="btn-bayou-gold w-full py-3.5 text-sm font-bold shadow-md">
            <i class="bi bi-check-circle-fill"></i> Mettre à jour les paramètres de fidélité
          </button>
        </div>
      </div>
        </div><!-- /admin-content-inner -->
      </main><!-- /admin-content -->
    </div><!-- /admin-shell -->
  `,
  styles: [`
    /* ===== ADMIN SHELL LAYOUT ===== */
    :host {
      display: block;
      min-height: 100vh;
    }

    .admin-shell {
      display: flex;
      min-height: calc(100vh - 80px);
      background: #F8F5F0;
    }

    /* ===== SIDEBAR ===== */
    .admin-sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--bayou-burgundy);
      color: #fff;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 80px;
      height: calc(100vh - 80px);
      overflow-y: auto;
      box-shadow: 4px 0 20px rgba(63,13,12,0.15);
      z-index: 10;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 22px 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }

    .sidebar-brand-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--bayou-gold);
    }

    .sidebar-brand-title {
      font-weight: 800;
      font-size: 1rem;
      font-family: var(--font-serif);
      letter-spacing: 0.5px;
    }

    .sidebar-brand-sub {
      font-size: 0.68rem;
      opacity: 0.65;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 1px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sidebar-section-label {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      opacity: 0.5;
      padding: 14px 10px 6px;
      text-transform: uppercase;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: rgba(255,255,255,0.8);
      font-size: 0.86rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.18s ease;
      position: relative;

      i {
        width: 20px;
        text-align: center;
        font-size: 1rem;
        flex-shrink: 0;
      }

      span:first-of-type {
        flex: 1;
      }

      &:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      &.active {
        background: var(--bayou-gold);
        color: #3F0D0C;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(196,158,85,0.35);

        i { color: #3F0D0C; }
      }
    }

    .sidebar-badge {
      background: #ef4444;
      color: #fff;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 1px 7px;
      border-radius: 9999px;
      min-width: 20px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar-admin-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      opacity: 0.85;

      i { color: var(--bayou-gold); }
    }

    /* ===== MAIN CONTENT AREA ===== */
    .admin-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .admin-topbar {
      background: #fff;
      border-bottom: 1px solid rgba(217,196,169,0.4);
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(63,13,12,0.04);
    }

    .admin-topbar-title {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--bayou-burgundy);
      margin: 0;
    }

    .admin-topbar-sub {
      font-size: 0.75rem;
      color: var(--bayou-muted);
      margin: 2px 0 0;
    }

    .admin-content-inner {
      padding: 28px;
      overflow-y: auto;
      flex: 1;
    }

    /* ===== LEGACY STYLES ===== */
    .badge-count {
      padding: 1px 7px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 800;
    }

    .btn-action {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: transform 0.15s;
      
      &:hover {
        transform: scale(1.08);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.clearSession();
    this.auth.logout().subscribe();
    this.router.navigate(['/auth/login']);
  }

  tab = signal<string>('stats');
  stats = signal<any>(null);
  adminOrders = signal<Order[]>([]);
  adminReservations = signal<Reservation[]>([]);
  adminProducts = signal<Product[]>([]);
  adminEvents = signal<EventItem[]>([]);
  adminBirthdayMenus = signal<BirthdayMenu[]>([]);
  adminSlots = signal<BirthdaySlot[]>([]);
  adminReviews = signal<Review[]>([]);

  // Reservation filter state
  reservationFilter = signal<string>('all');

  filteredReservations = computed(() => {
    const list = this.adminReservations();
    const filter = this.reservationFilter();
    if (filter === 'pending') return list.filter(r => r.status === 'pending');
    if (filter === 'confirmed') return list.filter(r => r.status === 'confirmed');
    if (filter === 'rejected') return list.filter(r => r.status === 'rejected');
    if (filter === 'type_table') return list.filter(r => r.type !== 'birthday');
    if (filter === 'type_birthday') return list.filter(r => r.type === 'birthday');
    return list;
  });

  pendingReservationsCount = computed(() =>
    this.adminReservations().filter(r => r.status === 'pending').length
  );

  confirmedReservationsCount = computed(() =>
    this.adminReservations().filter(r => r.status === 'confirmed').length
  );

  rejectedReservationsCount = computed(() =>
    this.adminReservations().filter(r => r.status === 'rejected').length
  );

  tableReservationsCount = computed(() =>
    this.adminReservations().filter(r => r.type !== 'birthday').length
  );

  birthdayReservationsCount = computed(() =>
    this.adminReservations().filter(r => r.type === 'birthday').length
  );

  // Products CRUD State
  editingProduct = signal<Product | null>(null);
  showNewProductForm = signal<boolean>(false);
  activeProdForm: any = {
    category_id: 1,
    name_fr: '',
    name_en: '',
    price: 5.0,
    image: '',
    description_fr: '',
    description_en: ''
  };

  // Birthday Menus CRUD State
  editingBirthdayMenu = signal<BirthdayMenu | null>(null);
  showNewBirthdayMenuForm = signal<boolean>(false);
  activeBMenuForm: any = {
    name_fr: '',
    name_en: '',
    price: 80.0,
    description_fr: '',
    description_en: '',
    image: '',
    active: true
  };

  // Events CRUD State
  editingEvent = signal<EventItem | null>(null);
  showNewEventForm = signal<boolean>(false);
  activeEventForm: any = {
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    event_date: new Date().toISOString().slice(0, 16),
    image: '',
    active: true
  };

  newSlotDate: string = new Date().toISOString().split('T')[0];
  newSlotTime: string = '17:00:00';

  loyaltySettings: any = {
    points_per_order: 10,
    target_score: 50,
    reward_description_fr: 'Un café offert !',
    reward_description_en: 'A free coffee!'
  };

  ngOnInit() {
    this.loadStats();
    this.loadOrders();
    this.loadReservations();
    this.loadBirthdayMenus();
    this.loadProducts();
    this.loadEvents();
    this.loadBirthdaySlots();
    this.loadReviews();
    this.loadLoyalty();
  }

  loadStats() {
    this.api.getAdminStats().subscribe(res => this.stats.set(res));
  }

  loadOrders() {
    this.api.getAdminOrders().subscribe(res => this.adminOrders.set(res));
  }

  loadReservations() {
    this.api.getAdminReservations().subscribe(res => this.adminReservations.set(res));
  }

  loadBirthdayMenus() {
    this.api.getAdminBirthdayMenus().subscribe(res => this.adminBirthdayMenus.set(res));
  }

  loadProducts() {
    this.api.getAdminProducts().subscribe(res => this.adminProducts.set(res));
  }

  loadEvents() {
    this.api.getAdminEvents().subscribe(res => this.adminEvents.set(res));
  }

  loadBirthdaySlots() {
    this.api.getBirthdaySlots().subscribe(res => this.adminSlots.set(res));
  }

  loadReviews() {
    this.api.getAdminReviews().subscribe(res => this.adminReviews.set(res));
  }

  loadLoyalty() {
    this.api.getAdminLoyaltySettings().subscribe(res => {
      if (res) this.loyaltySettings = res;
    });
  }

  // --- BIRTHDAY MENUS CRUD ---
  onBirthdayMenuImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.activeBMenuForm.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openCreateBirthdayMenu() {
    this.editingBirthdayMenu.set(null);
    this.activeBMenuForm = {
      name_fr: '',
      name_en: '',
      price: 80.0,
      description_fr: '',
      description_en: '',
      image: '',
      active: true
    };
    this.showNewBirthdayMenuForm.set(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  startEditBirthdayMenu(menu: BirthdayMenu) {
    this.editingBirthdayMenu.set(menu);
    this.activeBMenuForm = { ...menu };
    this.showNewBirthdayMenuForm.set(false);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  cancelEditBirthdayMenu() {
    this.editingBirthdayMenu.set(null);
    this.showNewBirthdayMenuForm.set(false);
  }

  saveBirthdayMenu() {
    if (!this.activeBMenuForm.name_fr || !this.activeBMenuForm.price) {
      alert('Veuillez renseigner le nom et le prix de la formule.');
      return;
    }

    const edit = this.editingBirthdayMenu();
    if (edit) {
      this.api.updateAdminBirthdayMenu(edit.id, this.activeBMenuForm).subscribe(() => {
        this.cancelEditBirthdayMenu();
        this.loadBirthdayMenus();
      });
    } else {
      this.api.createAdminBirthdayMenu(this.activeBMenuForm).subscribe(() => {
        this.cancelEditBirthdayMenu();
        this.loadBirthdayMenus();
      });
    }
  }

  deleteBirthdayMenu(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette formule d\'anniversaire ?')) {
      this.api.deleteAdminBirthdayMenu(id).subscribe(() => this.loadBirthdayMenus());
    }
  }

  // --- PRODUCTS CRUD ---
  onProductImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.activeProdForm.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openCreateProduct() {
    this.editingProduct.set(null);
    this.activeProdForm = {
      category_id: 1,
      name_fr: '',
      name_en: '',
      price: 5.0,
      image: '',
      description_fr: '',
      description_en: ''
    };
    this.showNewProductForm.set(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  startEditProduct(prod: Product) {
    this.editingProduct.set(prod);
    this.activeProdForm = { ...prod };
    this.showNewProductForm.set(false);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  cancelEditProduct() {
    this.editingProduct.set(null);
    this.showNewProductForm.set(false);
  }

  saveProduct() {
    if (!this.activeProdForm.name_fr || !this.activeProdForm.price) {
      alert('Veuillez renseigner le nom et le prix du produit.');
      return;
    }

    const edit = this.editingProduct();
    if (edit) {
      this.api.updateAdminProduct(edit.id, this.activeProdForm).subscribe(() => {
        this.cancelEditProduct();
        this.loadProducts();
      });
    } else {
      this.api.createAdminProduct(this.activeProdForm).subscribe(() => {
        this.cancelEditProduct();
        this.loadProducts();
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.api.deleteAdminProduct(id).subscribe(() => this.loadProducts());
    }
  }

  // --- EVENTS CRUD ---
  onEventImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.activeEventForm.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openCreateEvent() {
    this.editingEvent.set(null);
    this.activeEventForm = {
      title_fr: '',
      title_en: '',
      description_fr: '',
      description_en: '',
      event_date: new Date().toISOString().slice(0, 16),
      image: '',
      active: true
    };
    this.showNewEventForm.set(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  startEditEvent(ev: EventItem) {
    this.editingEvent.set(ev);
    this.activeEventForm = {
      ...ev,
      event_date: ev.event_date ? new Date(ev.event_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    };
    this.showNewEventForm.set(false);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  cancelEditEvent() {
    this.editingEvent.set(null);
    this.showNewEventForm.set(false);
  }

  saveEvent() {
    if (!this.activeEventForm.title_fr || !this.activeEventForm.event_date) {
      alert('Veuillez renseigner le titre et la date de l\'événement.');
      return;
    }

    const edit = this.editingEvent();
    if (edit) {
      this.api.updateAdminEvent(edit.id, this.activeEventForm).subscribe(() => {
        this.cancelEditEvent();
        this.loadEvents();
      });
    } else {
      this.api.createAdminEvent(this.activeEventForm).subscribe(() => {
        this.cancelEditEvent();
        this.loadEvents();
      });
    }
  }

  deleteEvent(id: number) {
    if (confirm('Supprimer cet événement ?')) {
      this.api.deleteAdminEvent(id).subscribe(() => this.loadEvents());
    }
  }

  updateOrderStatus(id: number, status: string) {
    this.api.updateOrderStatus(id, status).subscribe(() => {
      this.loadOrders();
      this.loadStats();
    });
  }

  deleteOrder(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      this.api.deleteAdminOrder(id).subscribe({
        next: () => {
          this.loadOrders();
          this.loadStats();
        },
        error: () => alert('Erreur lors de la suppression de la commande.')
      });
    }
  }

  updateReservationStatus(id: number, status: string) {
    this.api.updateReservationStatus(id, status).subscribe(() => {
      this.loadReservations();
      this.loadStats();
      this.loadBirthdaySlots();
    });
  }

  deleteReservation(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette réservation ?')) {
      this.api.deleteAdminReservation(id).subscribe({
        next: () => {
          this.loadReservations();
          this.loadStats();
          this.loadBirthdaySlots();
        },
        error: () => alert('Erreur lors de la suppression de la réservation.')
      });
    }
  }

  addBirthdaySlot() {
    if (!this.newSlotDate || !this.newSlotTime) {
      alert('Veuillez saisir une date et une heure.');
      return;
    }
    const payload = {
      date: this.newSlotDate,
      time: this.newSlotTime,
      max_capacity: 2,
      is_available: true
    };
    this.api.createAdminBirthdaySlot(payload).subscribe({
      next: () => {
        alert('Créneau d\'anniversaire ajouté avec succès (capacité max : 2) !');
        this.loadBirthdaySlots();
      },
      error: (err) => {
        console.error('Error creating slot:', err);
        const msg = err?.error?.message || (err?.error?.errors ? Object.values(err.error.errors).flat().join(', ') : 'Erreur lors de la création du créneau.');
        alert(msg);
      }
    });
  }

  deleteBirthdaySlot(id: number) {
    if (confirm('Supprimer ce créneau ?')) {
      this.api.deleteAdminBirthdaySlot(id).subscribe(() => this.loadBirthdaySlots());
    }
  }

  toggleReview(id: number) {
    this.api.toggleReviewApproval(id).subscribe(() => this.loadReviews());
  }

  deleteReview(id: number) {
    this.api.deleteReview(id).subscribe(() => this.loadReviews());
  }

  saveLoyaltySettings() {
    this.api.updateAdminLoyaltySettings(this.loyaltySettings).subscribe({
      next: (res) => {
        alert('Paramètres du programme fidélité enregistrés ! Le bandeau supérieur est mis à jour.');
        // Update public loyalty state immediately
        this.api.loyaltyInfo.set({
          ...this.loyaltySettings,
          reward_fr: this.loyaltySettings.reward_description_fr,
          reward_en: this.loyaltySettings.reward_description_en,
        });
        this.api.fetchPublicLoyaltyInfo();
      },
      error: () => alert('Erreur lors de la sauvegarde.')
    });
  }

  /** Copy a shareable Google Maps link to clipboard for the delivery person */
  copyGps(lat: number, lng: number) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('📍 Lien GPS copié !\nEnvoyez ce lien au livreur :\n' + url);
    }).catch(() => {
      // Fallback: prompt the URL
      prompt('Copiez ce lien GPS pour le livreur :', url);
    });
  }
}

