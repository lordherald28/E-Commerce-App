import { CommonModule } from '@angular/common';
import { Component, input, output, effect, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../domain';
import { ShortDescriptionPipe } from '../../../../shared/pipes/short-description.pipe';
import { AuthStore, CartStore } from '../../../../application';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShortDescriptionPipe, RouterLink],
  templateUrl: './product-item.component.html',
})
export class ProductItemComponent {

  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);
  private readonly fb = inject(FormBuilder);

  /** INPUTS */
  readonly product = input.required<Product>();
  readonly isHaveItems = input<boolean>(false);

  /** OUTPUTS */
  readonly addToCart = output<{ productId: number, quantity: number }>();
  readonly updateToCart = output<{ productId: number, quantity: number }>();
  readonly deleteToCart = output<number>();

  readonly isLogged= this.authStore.logged;
  
  readonly formItem = this.fb.nonNullable.group({
    amount: [1, [Validators.required, Validators.min(1)]],
  });

  private get amountCtrl() {
    return this.formItem.controls.amount;
  }

  readonly inCart = computed(() => {
    const productId = this.product().id;
    const items = this.cartStore.items();
    return items.some(i => i.productId === productId);
  });

  constructor() {
    effect(() => {
      const product = this.product();
      const items = this.cartStore.items();
      const found = items.find(i => i.productId === product.id);
      const quantity = found?.quantity ?? 1;
      this.amountCtrl.setValue(quantity, { emitEvent: false });
    });

  }
  increaseCount() {
    const current = this.amountCtrl.value;
    this.amountCtrl.setValue(current + 1);
  }

  decreaseCount() {
    const current = this.amountCtrl.value;
    this.amountCtrl.setValue(current > 1 ? current - 1 : 1);
  }

  onAdd() {
    if (this.formItem.invalid) {
      this.formItem.markAllAsTouched();
      return;
    }

    const quantity = this.amountCtrl.value;
    const productId = this.product().id;

    this.addToCart.emit({ productId, quantity });
  }

  onUpdateAmount() {
    if (this.formItem.invalid) {
      this.formItem.markAllAsTouched();
      return;
    }

    const quantity = this.amountCtrl.value;
    const productId = this.product().id;

    this.updateToCart.emit({ productId, quantity });
  }

  onCancel(idProduct: number) {
    this.amountCtrl.setValue(1);
    this.deleteToCart.emit(idProduct)
  }
}
