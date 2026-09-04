import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Review, Product } from '../../core/models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-bayou py-12">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">Témoignages & Étoiles</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">{{ ts.translate('reviews.title') }}</h1>
        <p class="text-sm text-muted-custom mt-2">
          Découvrez les impressions de nos hôtes et partagez votre expérience chez Le Bayou.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Reviews List (Col 7) -->
        <div class="lg:col-span-7 space-y-6">
          <div *ngIf="reviews().length === 0" class="text-center py-12 text-muted-custom">
            Aucun avis validé pour le moment. Soyez le premier à donner votre avis !
          </div>

          <div *ngFor="let rev of reviews()" class="glass-card rounded-2xl p-6 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-bayou-burgundy text-white flex items-center justify-center font-bold text-sm">
                  {{ rev.user?.name?.charAt(0) || 'U' }}
                </div>
                <div>
                  <h4 class="font-bold text-burgundy text-sm">{{ rev.user?.name || 'Client Le Bayou' }}</h4>
                  <span class="text-[11px] text-muted-custom">
                    {{ rev.type === 'cafe' ? 'Expérience en Lounge' : 'Avis sur produit' }}
                  </span>
                </div>
              </div>

              <!-- Rating Stars -->
              <div class="text-gold text-sm flex gap-1">
                <i *ngFor="let star of [1,2,3,4,5]" class="bi" [class.bi-star-fill]="star <= rev.rating" [class.bi-star]="star > rev.rating"></i>
              </div>
            </div>

            <p class="text-sm text-muted-custom leading-relaxed">
              "{{ rev.comment }}"
            </p>

            <div *ngIf="rev.product" class="text-xs text-brown bg-bayou-cream-soft p-2 rounded-lg inline-block">
              <i class="bi bi-tag-fill text-gold"></i> Produit concerné : <strong>{{ ts.getField(rev.product, 'name') }}</strong>
            </div>
          </div>
        </div>

        <!-- Add Review Form (Col 5) -->
        <div class="lg:col-span-5">
          <div class="glass-card rounded-2xl p-6 space-y-6">
            <h3 class="font-serif font-bold text-xl text-burgundy">
              {{ ts.translate('reviews.add') }}
            </h3>

            <form (ngSubmit)="submitReview()" class="space-y-4">
              <!-- Type choice: Cafe vs Product -->
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Votre avis concerne</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    (click)="reviewType = 'cafe'"
                    [class.active]="reviewType === 'cafe'"
                    class="type-btn"
                  >
                    <i class="bi bi-cup-hot"></i> Le Lounge
                  </button>
                  <button
                    type="button"
                    (click)="reviewType = 'product'"
                    [class.active]="reviewType === 'product'"
                    class="type-btn"
                  >
                    <i class="bi bi-box2-heart"></i> Un Produit
                  </button>
                </div>
              </div>

              <!-- Product selector if product review -->
              <div *ngIf="reviewType === 'product'">
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Sélectionnez le produit</label>
                <select [(ngModel)]="selectedProductId" name="productId" class="input-bayou" required>
                  <option [ngValue]="null" disabled>Choisir un produit...</option>
                  <option *ngFor="let p of products()" [ngValue]="p.id">
                    {{ ts.getField(p, 'name') }}
                  </option>
                </select>
              </div>

              <!-- Rating Selection -->
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Votre note</label>
                <div class="flex gap-2 text-2xl text-gold cursor-pointer">
                  <i
                    *ngFor="let s of [1,2,3,4,5]"
                    (click)="rating = s"
                    class="bi"
                    [class.bi-star-fill]="s <= rating"
                    [class.bi-star]="s > rating"
                  ></i>
                </div>
              </div>

              <!-- Comment -->
              <div>
                <label class="block text-xs font-bold uppercase text-burgundy mb-1">Votre commentaire</label>
                <textarea
                  [(ngModel)]="comment"
                  name="comm"
                  rows="4"
                  required
                  placeholder="Partagez votre ressenti sur l'accueil, les arômes du café, le service..."
                  class="input-bayou"
                ></textarea>
              </div>

              <div class="pt-2">
                <button *ngIf="auth.isLoggedIn()" type="submit" [disabled]="submitting()" class="btn-bayou-gold w-full py-3 text-sm">
                  <i class="bi bi-send-fill"></i> {{ submitting() ? 'Envoi...' : 'Publier mon avis' }}
                </button>

                <div *ngIf="!auth.isLoggedIn()" class="space-y-2">
                  <p class="text-xs text-center text-muted-custom">
                    Connectez-vous pour laisser un avis sur Le Bayou.
                  </p>
                  <a routerLink="/auth/login" class="btn-bayou-burgundy w-full py-2.5 text-xs text-center block">
                    Se connecter pour publier
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .type-btn {
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--bayou-cream-light);
      background: #fff;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--bayou-text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;

      &.active {
        background: var(--bayou-burgundy);
        color: #fff;
        border-color: var(--bayou-burgundy);
      }
    }

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
export class ReviewsComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);
  auth = inject(AuthService);

  reviews = signal<Review[]>([]);
  products = signal<Product[]>([]);

  reviewType: 'cafe' | 'product' = 'cafe';
  selectedProductId: number | null = null;
  rating: number = 5;
  comment: string = '';
  submitting = signal<boolean>(false);

  ngOnInit() {
    this.api.getReviews().subscribe(res => this.reviews.set(res));
    this.api.getProducts().subscribe(res => this.products.set(res));
  }

  submitReview() {
    if (!this.comment.trim()) return;

    this.submitting.set(true);
    const payload = {
      type: this.reviewType,
      product_id: this.reviewType === 'product' ? this.selectedProductId : null,
      rating: this.rating,
      comment: this.comment
    };

    this.api.submitReview(payload).subscribe({
      next: res => {
        this.submitting.set(false);
        alert(res.message || 'Merci pour votre avis ! Il sera en ligne dès approbation.');
        this.comment = '';
      },
      error: err => {
        this.submitting.set(false);
        alert('Erreur : ' + (err.error?.message || 'Impossible d\'envoyer l\'avis.'));
      }
    });
  }
}
