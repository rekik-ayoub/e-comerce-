import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="celebration-overlay flex items-center justify-center p-4">
      <div class="celebration-card animate-pop text-center p-8 max-w-md w-full relative">
        <button (click)="close.emit()" class="close-btn" title="Fermer">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="trophy-icon mb-4">
          <i class="bi bi-cup-hot-fill text-gold pulse-glow"></i>
        </div>

        <span class="badge-pill mb-2 inline-block">Score Atteint !</span>

        <h2 class="font-serif text-3xl font-bold text-burgundy mb-3">
          FÉLICITATIONS ! 🎉
        </h2>

        <p class="text-sm text-muted-custom mb-6 leading-relaxed">
          {{ message || 'Vous avez cumulé suffisamment de points de fidélité ! Votre café ou cappuccino Signature est 100% offert sur votre prochaine commande.' }}
        </p>

        <div class="voucher-box p-4 rounded-xl mb-6">
          <span class="text-xs uppercase tracking-wider text-brown font-bold">Code Cadeau Activé</span>
          <div class="text-2xl font-bold text-burgundy tracking-widest mt-1">
            FREE-COFFEE-BAYOU
          </div>
          <p class="text-xs text-muted-custom mt-1">À présenter lors de la livraison ou en caisse</p>
        </div>

        <div class="space-y-2">
          <button (click)="claimReward.emit()" class="btn-bayou-gold w-full py-3 text-sm font-bold shadow-md">
            <i class="bi bi-gift-fill"></i> Ajouter mon Café Gratuit & Commander
          </button>
          <button (click)="close.emit()" class="btn-bayou-outline w-full py-2 text-xs">
            Fermer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .celebration-overlay {
      position: fixed;
      inset: 0;
      background: rgba(41, 8, 7, 0.65);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .celebration-card {
      background: #FDFAF6;
      border: 2px solid var(--bayou-gold);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 50px rgba(63, 13, 12, 0.35);
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--bayou-text-muted);
      cursor: pointer;
      &:hover { color: var(--bayou-burgundy); }
    }

    .trophy-icon i {
      font-size: 4rem;
      display: inline-block;
      padding: 16px;
      border-radius: 999px;
      background: rgba(217, 176, 97, 0.15);
    }

    .badge-pill {
      background: var(--bayou-burgundy);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 99px;
    }

    .voucher-box {
      background: #F4EFEA;
      border: 1px dashed var(--bayou-gold);
    }
  `]
})
export class CelebrationModalComponent {
  @Input() show: boolean = false;
  @Input() message: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() claimReward = new EventEmitter<void>();
}
