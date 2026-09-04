import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { EventItem } from '../../core/models';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-bayou py-12">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">L'Agenda du Lounge</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">Événements & Soirées Thématiques</h1>
        <p class="text-sm text-muted-custom mt-2">
          Venez vibrer au rythme du jazz, de nos ateliers barista, et de soirées de dégustation inédites.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div *ngFor="let ev of events()" class="glass-card rounded-3xl overflow-hidden flex flex-col">
          <div class="h-64 overflow-hidden relative">
            <img [src]="ev.image" [alt]="ts.getField(ev, 'title')" class="w-full h-full object-cover" />
            <div class="absolute bottom-4 left-4 bg-bayou-burgundy/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              <i class="bi bi-calendar-event text-gold"></i>
              <span>{{ ev.event_date | date:'fullDate' }} à {{ ev.event_date | date:'shortTime' }}</span>
            </div>
          </div>

          <div class="p-8 space-y-3 flex-grow flex flex-col">
            <h3 class="font-serif font-bold text-2xl text-burgundy">{{ ts.getField(ev, 'title') }}</h3>
            <p class="text-sm text-muted-custom leading-relaxed flex-grow">
              {{ ts.getField(ev, 'description') }}
            </p>
            <div class="pt-4 border-t border-beige-mid/40 flex items-center justify-between text-xs">
              <span class="text-green-700 font-semibold"><i class="bi bi-check-circle-fill"></i> Entrée libre (consommation sur place)</span>
              <a routerLink="/reservations" class="btn-bayou-outline text-xs py-1.5 px-4">Réserver ma table</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  events = signal<EventItem[]>([]);

  ngOnInit() {
    this.api.getEvents().subscribe(res => this.events.set(res));
  }
}
