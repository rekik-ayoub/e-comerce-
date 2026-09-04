import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { BirthdayMenu } from '../../core/models';

@Component({
  selector: 'app-birthday-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-bayou py-12">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">{{ ts.translate('bday.menus_title') }}</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">Formules Anniversaires Le Bayou</h1>
        <p class="text-sm text-muted-custom mt-2">
          Gâteaux de haute pâtisserie, boissons chaudes et froides signature, décoration de table personnalisée et accueil VIP.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div *ngFor="let menu of menus()" class="glass-card rounded-3xl overflow-hidden flex flex-col shadow-lg border border-gold/30">
          <div class="h-64 overflow-hidden relative">
            <img [src]="menu.image" [alt]="ts.getField(menu, 'name')" class="w-full h-full object-cover" />
            <div class="absolute top-4 right-4 bg-bayou-burgundy text-white font-serif font-bold text-lg px-4 py-1.5 rounded-full shadow">
              {{ menu.price | number:'1.2-2' }} DT
            </div>
          </div>

          <div class="p-8 flex flex-col flex-grow space-y-4">
            <h3 class="font-serif font-bold text-2xl text-burgundy">{{ ts.getField(menu, 'name') }}</h3>
            <p class="text-sm text-muted-custom leading-relaxed flex-grow">
              {{ ts.getField(menu, 'description') }}
            </p>

            <div class="pt-4 border-t border-beige-mid/40 flex items-center justify-between">
              <span class="text-xs text-brown font-semibold"><i class="bi bi-gift-fill text-gold"></i> Formule tout compris</span>
              <a routerLink="/reservations" class="btn-bayou-gold text-xs py-2.5 px-5">
                Réserver avec cette formule
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BirthdayMenuComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  menus = signal<BirthdayMenu[]>([]);

  ngOnInit() {
    this.api.getBirthdayMenus().subscribe(res => this.menus.set(res));
  }
}
