import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore, CartStore, CatalogStore } from '../../application';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { Cart, CartItem, Product } from '../../domain';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CartItemComponent],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
})
export class CartPageComponent {

  private readonly cartStore = inject(CartStore);
  private readonly catalogStore = inject(CatalogStore);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly userId = this.authStore.id;

  readonly cartItemsVm = computed(() => {
    const items = this.cartStore.items();
    const products = this.catalogStore.products();

    const productById = new Map<number, Product>(
      products.map(p => [p.id, p])
    );

    return items.map(item => ({
      ...item,
      product: productById.get(item.productId) ?? undefined,
    }) satisfies CartItem);
  });

  readonly subtotal = computed(() => {
    return this.cartItemsVm().reduce((total, item) =>
      total + (item.product?.price ?? 0) * item.quantity,
      0)
  });

  readonly items = this.cartStore.items;
  readonly totalQuantity = this.cartStore.totalQuantity;
  readonly cartId = this.cartStore.id;

  readonly tax = 10.55;

  constructor() {
    effect(() => {
      const items = this.items();
      const cartId = this.cartId();
      if (!items.length && cartId !== null) {
        this.cancelOrder();
      }
    });
  }

  /**
   * Guarda la informacion del carrito en el backend
   */
  saveCart() {
    const cartSave: Cart = {
      id: this.cartId(),
      userId: 1,
      items: this.items()
    }
    this.cartStore.saveCart(cartSave);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl ?? '/checkout');
  }

  cancelOrder() {
    this.cartStore.deleteCart(this.cartId() as number);
  }
  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param event 
   */
  updateItemFromCart(event: any) {
    const productsAdd = [{
      productId: event.productId,
      quantity: event.quantity
    }]
    const userId = this.userId() as number;
    const cartItem: Cart = {
      id: this.cartId(),
      userId: userId,
      items: productsAdd || []
    }
    this.cartStore.updateItemInCart(cartItem);
  }

  /**
   * Elimina un producto del carrito.
   * @param value 
   */
  deleteItemFromCart(value: number) {
    this.cartStore.deleteItemFromCart(value);
  }

}
