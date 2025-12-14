import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthStore, CartStore, CatalogStore } from '../../../../application';
import { Cart, Product, RatingProduct } from '../../../../domain';
import { UPDATE_DELAY_MS } from '../../../../shared/utils/const.utils';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail-page.component.html',
})
export class ProductDetailPageComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly catalogStore = inject(CatalogStore);
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);

  private readonly userId = this.authStore.id;
  readonly products = this.catalogStore.products;
  readonly selectedProduct = this.catalogStore.selectedProduct;
  readonly isLoading = this.catalogStore.loading;

  private readonly routeId = signal<number | null>(null);
  readonly updatingQuantity = signal(false);

  readonly productId = computed(() => this.routeId());
  readonly product = computed<RatingProduct | null>(() => {

    const id = this.productId();
    if (id == null) return null;

    const list = this.products();
    let fromList = list.find(p => p.id === id);
    if (fromList) return fromList;

    return this.selectedProduct();
  });

  // productos relacionados: misma categoría, distinto id
  readonly relatedProducts = computed<Product[]>(() => {
    const current = this.product();
    const list = this.products();
    if (!current || !list?.length) return [];

    return list
      .filter(p => p.category === current.category && p.id !== current.id)
      .slice(0, 6);
  });

  readonly quantityProductSelected = signal<number>(0);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : null;

      this.routeId.set(id);

      if (id != null) {
        this.catalogStore.loadProductById(id);
      }
    });
    effect(() => {
      const product = this.product();
      const items = this.cartStore.items();
      const found = items.find(i => i.productId === product!.id);
      const quantity = found?.quantity ?? 1;
      this.quantityProductSelected.set(quantity);
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : null;

      if (id != null) {
        this.catalogStore.loadProductById(id);
      }
    });

    if (!this.products().length) {
      this.catalogStore.loadCatalogFull();
    }

  }

  increaseCount() {
    if (this.updatingQuantity()) return;

    this.updatingQuantity.set(true);
    const next = this.quantityProductSelected() + 1;
    this.quantityProductSelected.set(next);
    this.AddToCart();
    setTimeout(() => {
      this.updatingQuantity.set(false);
    }, UPDATE_DELAY_MS);
  }

  decreaseCount() {
    if (this.updatingQuantity()) return;
    const current = this.quantityProductSelected();
    const next = current > 1 ? current - 1 : 1;
    this.updatingQuantity.set(true);
    this.quantityProductSelected.set(next);
    this.AddToCart();
    setTimeout(() => {
      this.updatingQuantity.set(false);
    }, UPDATE_DELAY_MS);
  }


  AddToCart() {
    const userId = this.userId() as number;
    const productsAdd = [{
      productId: this.productId() as number,
      quantity: this.quantityProductSelected()
    }]
    const cartItem: Cart = {
      id: this.cartStore.id(),
      userId: userId,
      items: productsAdd || []
    }

    if (cartItem.id) {
      this.cartStore.addItemToCart(cartItem);
    } else {
      this.cartStore.saveCart(cartItem);
    }
  }

}
