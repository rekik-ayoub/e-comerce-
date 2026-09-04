import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bayou-footer mt-20 pt-16 pb-8">
      <div class="container-bayou grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Col 1: About Brand -->
        <div class="space-y-4">
          <img src="/logo.jpg" alt="Le Bayou" class="h-12 rounded" />
          <p class="text-sm text-muted-custom leading-relaxed">
            Le Bayou Coffee Lounge — Votre espace de quiétude et de dégustation. Cafés de spécialité torréfiés avec soin, pâtisseries fines et événements privés.
          </p>
          <div class="flex items-center gap-3 text-lg text-burgundy">
            <a href="#" class="social-icon"><i class="bi bi-instagram"></i></a>
            <a href="#" class="social-icon"><i class="bi bi-facebook"></i></a>
            <a href="#" class="social-icon"><i class="bi bi-tiktok"></i></a>
          </div>
        </div>

        <!-- Col 2: Navigation -->
        <div>
          <h4 class="font-serif text-burgundy font-bold text-lg mb-4">Navigation</h4>
          <ul class="space-y-2 text-sm">
            <li><a routerLink="/catalog" class="footer-link">{{ ts.translate('nav.menu') }}</a></li>
            <li><a routerLink="/reservations" class="footer-link">{{ ts.translate('nav.reservations') }}</a></li>
            <li><a routerLink="/birthday-menu" class="footer-link">{{ ts.translate('nav.birthday') }}</a></li>
            <li><a routerLink="/events" class="footer-link">{{ ts.translate('nav.events') }}</a></li>
            <li><a routerLink="/reviews" class="footer-link">{{ ts.translate('nav.reviews') }}</a></li>
          </ul>
        </div>

        <!-- Col 3: Hours & Info -->
        <div>
          <h4 class="font-serif text-burgundy font-bold text-lg mb-4">Horaires d'Ouverture</h4>
          <ul class="space-y-2 text-sm text-muted-custom">
            <li class="flex justify-between"><span>Lundi – Vendredi :</span> <strong class="text-burgundy">07h30 – 21h00</strong></li>
            <li class="flex justify-between"><span>Samedi :</span> <strong class="text-burgundy">08h30 – 22h30</strong></li>
            <li class="flex justify-between"><span>Dimanche :</span> <strong class="text-burgundy">09h00 – 20h00</strong></li>
          </ul>
        </div>

        <!-- Col 4: Contact -->
        <div>
          <h4 class="font-serif text-burgundy font-bold text-lg mb-4">Nous Trouver</h4>
          <ul class="space-y-2.5 text-sm text-muted-custom">
            <li class="flex items-center gap-2"><i class="bi bi-geo-alt-fill text-gold"></i> Route Ain klm 2.5</li>
            <li class="flex items-center gap-2"><i class="bi bi-telephone-fill text-gold"></i> +216 74 000 000 / +216 98 000 000</li>
            <li class="flex items-center gap-2"><i class="bi bi-envelope-fill text-gold"></i> contact&#64;lebayoucoffee.com</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-beige-mid mt-12 pt-6 text-center text-xs text-muted-custom">
        <p>&copy; {{ currentYear }} Le Bayou Coffee Lounge. Tous droits réservés. Développé avec passion pour l'art du café.</p>
      </div>
    </footer>
  `,
  styles: [`
    .bayou-footer {
      background: #F4EFEA;
      border-top: 1px solid rgba(217, 196, 169, 0.4);
    }
    .footer-link {
      text-decoration: none;
      color: var(--bayou-text-muted);
      transition: color 0.2s ease;
      &:hover {
        color: var(--bayou-burgundy);
      }
    }
    .social-icon {
      color: var(--bayou-burgundy);
      transition: transform 0.2s, color 0.2s;
      &:hover {
        color: var(--bayou-gold);
        transform: translateY(-2px);
      }
    }
  `]
})
export class FooterComponent {
  ts = inject(TranslationService);
  currentYear = new Date().getFullYear();
}
