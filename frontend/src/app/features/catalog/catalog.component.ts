import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { ApiService } from '../../core/services/api.service';
import { Category, Product } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-bayou py-12">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-gold uppercase tracking-wider text-xs font-bold">{{ ts.translate('catalog.delivery_note') }}</span>
        <h1 class="font-serif text-4xl font-bold text-burgundy mt-1">{{ ts.translate('catalog.title') }}</h1>
        <p class="text-sm text-muted-custom mt-2">{{ ts.translate('catalog.subtitle') }}</p>

        <!-- Search input -->
        <div class="search-box mt-6 max-w-md mx-auto relative">
          <i class="bi bi-search absolute left-4 top-3.5 text-muted-custom"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            placeholder="Rechercher un café, cappuccino, pâtisserie..."
            class="w-full pl-11 pr-4 py-2.5 rounded-full border border-beige-mid bg-white text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="category-pills flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          (click)="selectCategory(null)"
          [class.active]="selectedCategoryId() === null"
          class="cat-pill"
        >
          {{ ts.translate('catalog.all') }}
        </button>

        <button
          *ngFor="let cat of categories()"
          (click)="selectCategory(cat.id)"
          [class.active]="selectedCategoryId() === cat.id"
          class="cat-pill"
        >
          {{ ts.getField(cat, 'name') }}
          <span *ngIf="cat.products_count" class="text-xs opacity-75">({{ cat.products_count }})</span>
        </button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="loading()" class="text-center py-16 text-muted-custom">
        <i class="bi bi-arrow-repeat animate-spin text-3xl text-gold"></i>
        <p class="mt-2 text-sm">Chargement de nos délices...</p>
      </div>

      <div *ngIf="!loading() && filteredProducts().length === 0" class="text-center py-16 text-muted-custom">
        <i class="bi bi-cup-straw text-4xl text-beige-light"></i>
        <p class="mt-3 text-base font-semibold text-burgundy">Aucun produit ne correspond à votre recherche.</p>
      </div>

      <div *ngIf="!loading() && filteredProducts().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let product of filteredProducts()" class="product-item glass-card rounded-2xl overflow-hidden flex flex-col">
          <div class="relative h-56 overflow-hidden">
            <img [src]="product.image" [alt]="ts.getField(product, 'name')" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            <span *ngIf="product.featured" class="absolute top-3 left-3 bg-bayou-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Signature
            </span>
            <span *ngIf="product.category" class="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-burgundy text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {{ ts.getField(product.category, 'name') }}
            </span>
          </div>

          <div class="p-5 flex flex-col flex-grow">
            <h3 class="font-serif font-bold text-lg text-burgundy">{{ ts.getField(product, 'name') }}</h3>
            <p class="text-xs text-muted-custom mt-2 line-clamp-2 leading-relaxed">
              {{ ts.getField(product, 'description') }}
            </p>

            <div class="mt-auto pt-5 flex items-center justify-between border-t border-beige-mid/40">
              <div>
                <span class="text-xl font-bold text-burgundy font-serif">{{ product.price | number:'1.2-2' }} DT</span>
                <div class="text-[10px] text-muted-custom">+10 pts fidélité</div>
              </div>

              <button (click)="addToCart(product)" class="btn-bayou-gold text-xs py-2 px-4">
                <i class="bi bi-bag-plus"></i> {{ ts.translate('catalog.add_to_cart') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cat-pill {
      background: var(--bayou-cream-soft);
      border: 1px solid var(--bayou-cream-light);
      color: var(--bayou-text-main);
      padding: 8px 18px;
      border-radius: 99px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        border-color: var(--bayou-gold);
        background: var(--bayou-gold-light);
      }

      &.active {
        background: var(--bayou-burgundy);
        color: #fff;
        border-color: var(--bayou-burgundy);
      }
    }
  `]
})
export class CatalogComponent implements OnInit {
  ts = inject(TranslationService);
  api = inject(ApiService);

  categories = signal<Category[]>([]);
  allProducts = signal<Product[]>([]);
  selectedCategoryId = signal<number | null>(null);
  searchQuery: string = '';
  loading = signal<boolean>(true);

  filteredProducts = computed(() => {
    let list = this.allProducts();
    const catId = this.selectedCategoryId();
    if (catId !== null) {
      list = list.filter(p => p.category_id === catId);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name_fr?.toLowerCase().includes(q)) ||
        (p.name_en?.toLowerCase().includes(q)) ||
        (p.description_fr?.toLowerCase().includes(q)) ||
        (p.description_en?.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.getCategories().subscribe(cats => this.categories.set(cats));
    this.api.getProducts().subscribe({
      next: prods => {
        this.allProducts.set(prods);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
  }

  onSearch() {
    // Computed automatically updates
  }

  addToCart(product: Product) {
    this.api.addToCart(product);
  }
}
