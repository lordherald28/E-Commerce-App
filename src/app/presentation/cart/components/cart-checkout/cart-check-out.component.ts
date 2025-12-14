import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { CartStore, CatalogStore } from "../../../../application";
import { ANotificationService, CartItem, Product } from "../../../../domain";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { UPDATE_DELAY_MS } from "../../../../shared/utils/const.utils";
import { CartItemComponent } from "../cart-item/cart-item.component";

@Component({
    selector: 'app-cart-checkout',
    templateUrl: './cart-check-out.component.html',
    standalone: true,
    imports: [CommonModule, RouterLink, CartItemComponent]
})
export class CartCheckOutComponent {
    private readonly cartStore = inject(CartStore);
    private readonly catalogStore = inject(CatalogStore);
    private readonly notification = inject(ANotificationService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly selectedProduct = this.catalogStore.selectedProduct;
    readonly cartId = this.cartStore.id;

    readonly isPaying = signal(false);

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
    readonly shippingTax = signal<number>(3.00);

    payout() {
        if (this.isPaying()) return;

        this.isPaying.set(true);

        requestAnimationFrame(() => {
            setTimeout(() => {
                this.notification.success(
                    'Pago confirmado. Gracias por tu compra. Tu pedido fue registrado correctamente y comenzará a procesarse ahora.'
                );

                this.cartStore.deleteCart(this.cartId() as number);

                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
                this.router.navigateByUrl(returnUrl ?? '/catalog')
                    .finally(() => this.isPaying.set(false));
            }, UPDATE_DELAY_MS);
        });
    }
}
