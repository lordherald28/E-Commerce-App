import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CartStore, CatalogStore } from '../../application';
import { NotificationComponent } from "../../shared/components/notification/notification.component";

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, NotificationComponent],
    template: `
    <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
  <app-header [title]="title()" [items]="cartItemsCount()" />

  <main class="flex-1 p-6">
    <router-outlet></router-outlet>
  </main>

  <app-notification />
</div>
  `,
})
export class AppShellComponent {
    protected readonly title = signal('GenSal23');
    protected readonly catalogStore = inject(CatalogStore);
    protected readonly cartStore = inject(CartStore);

    readonly cartItemsCount = computed(() => {
        return this.cartStore.totalQuantity();
    });
}
