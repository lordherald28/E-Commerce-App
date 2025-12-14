import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, } from '@angular/core';
import { AuthStore, CartStore, CatalogStore } from '../../application';
import { Cart } from '../../domain';
import { ProductListComponent } from './product/product-list/product-list.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-page.component.html',
})
export class CatalogPageComponent implements OnInit {

  private readonly catalogStore = inject(CatalogStore);
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);

  private readonly cartId = this.cartStore.id;
  private readonly userId = this.authStore.id;

  readonly products = this.catalogStore.filteredProducts;
  readonly isPaying = this.catalogStore.loading;

  constructor() { }

  ngOnInit(): void {
    this.catalogStore.loadCatalogFull();
  }

  AddToCart(event: any) {
    let productId: number = event.productId;
    let quantity: number = event.quantity;

    const userId = this.userId() as number;
    const productsAdd = [{
      productId,
      quantity
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

  UpdateItemToCart(event: any) {
    let productId: number = event.productId;
    let quantity: number = event.quantity;
    const userId = this.userId() as number;
    const productsAdd = [{
      productId,
      quantity
    }]

    const cartItem: Cart = {
      id: this.cartId() as number,
      userId: userId,
      items: productsAdd || []
    }
    this.cartStore.updateItemInCart(cartItem);
  }

  DeleteItemFromCart($event: number) {
    $event && this.cartStore.deleteItemFromCart($event);
  }

}
