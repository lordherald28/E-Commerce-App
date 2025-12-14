import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { publicGuard } from './infrastructure/guards/public.guard';
import { authGuard } from './infrastructure/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },

  // Público
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./presentation/auth/login-page/login-page.component')
        .then(m => m.LoginPageComponent),
  },

  // Shell
  {
    path: '',
    loadComponent: () =>
      import('./presentation/layout/app-shell.component')
        .then(m => m.AppShellComponent),
    children: [
      // Público
      {
        path: 'catalog',
        loadComponent: () =>
          import('./presentation/catalog/catalog-page.component')
            .then(m => m.CatalogPageComponent),
      },

      // Protegidas
      {
        path: 'product/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./presentation/catalog/product/product-detail-page/product-detail-page.component')
            .then(m => m.ProductDetailPageComponent),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./presentation/cart/cart-page.component')
            .then(m => m.CartPageComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./presentation/cart/components/cart-checkout/cart-check-out.component')
            .then(m => m.CartCheckOutComponent),
      },
    ],
  },

  { path: '**', component: NotFoundComponent },
];
