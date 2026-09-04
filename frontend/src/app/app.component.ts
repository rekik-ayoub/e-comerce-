import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { FooterComponent } from './shared/components/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-layout min-h-screen flex flex-col">
      <app-navbar *ngIf="!isAdminRoute()"></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer *ngIf="!isAdminRoute()"></app-footer>
    </div>
  `
})
export class AppComponent {
  title = 'Le Bayou Coffee Lounge';
  private router = inject(Router);
  isAdminRoute = signal<boolean>(false);

  constructor() {
    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute.set(event.urlAfterRedirects?.startsWith('/admin') || event.url?.startsWith('/admin'));
    });
  }
}
