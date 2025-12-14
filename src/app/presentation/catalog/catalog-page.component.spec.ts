import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

import { CatalogPageComponent } from './catalog-page.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { AuthStore, CartStore, CatalogStore } from '../../application';
import { Cart } from '../../domain';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule],
    template: '',
})
class ProductListStubComponent {
    @Input() items: any[] = [];
    @Output() emitToCreate = new EventEmitter<any>();
    @Output() emitToUpdate = new EventEmitter<any>();
    @Output() emitToDelete = new EventEmitter<number>();
}

class AuthStoreMock {
    readonly id = signal<number | null>(1);
}

class CatalogStoreMock {
    readonly products = signal<any[]>([]);
    readonly filteredProducts = this.products;
    readonly loading = signal(false);
    loadCatalogFull = jasmine.createSpy('loadCatalogFull');
}

class CartStoreMock {
    readonly id = signal<number | null>(null);

    addItemToCart = jasmine.createSpy('addItemToCart');
    saveCart = jasmine.createSpy('saveCart');
    updateItemInCart = jasmine.createSpy('updateItemInCart');
    deleteItemFromCart = jasmine.createSpy('deleteItemFromCart');
}

describe('CatalogPageComponent', () => {
    let authStore: AuthStoreMock;
    let catalogStore: CatalogStoreMock;
    let cartStore: CartStoreMock;

    beforeEach(async () => {
        authStore = new AuthStoreMock();
        catalogStore = new CatalogStoreMock();
        cartStore = new CartStoreMock();

        await TestBed.configureTestingModule({
            imports: [CatalogPageComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                { provide: AuthStore, useValue: authStore },
                { provide: CatalogStore, useValue: catalogStore },
                { provide: CartStore, useValue: cartStore },
            ],
        })
            .overrideComponent(CatalogPageComponent, {
                remove: { imports: [ProductListComponent] },
                add: { imports: [ProductListStubComponent] },
            })
            .compileComponents();
    });

    it('debería crear el componente y llamar loadCatalogFull', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(catalogStore.loadCatalogFull).toHaveBeenCalled();
    });

    it('debería exponer products desde el CatalogStore', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        catalogStore.products.set([{ id: 1 }]);
        fixture.detectChanges();

        expect(component.products()).toEqual([jasmine.objectContaining({ id: 1 })]);
    });

    it('AddToCart: si NO hay id en el carrito -> llama saveCart', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        authStore.id.set(1);
        cartStore.id.set(null);

        component.AddToCart({ productId: 5, quantity: 2 });

        expect(cartStore.saveCart).toHaveBeenCalledWith(
            jasmine.objectContaining<Cart>({
                id: null,
                userId: 1,
                items: [{ productId: 5, quantity: 2 }],
            }),
        );
        expect(cartStore.addItemToCart).not.toHaveBeenCalled();
    });

    it('AddToCart: si hay id en el carrito -> llama addItemToCart', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        authStore.id.set(1);
        cartStore.id.set(7);

        component.AddToCart({ productId: 5, quantity: 2 });

        expect(cartStore.addItemToCart).toHaveBeenCalledWith(
            jasmine.objectContaining<Cart>({
                id: 7,
                userId: 1,
                items: [{ productId: 5, quantity: 2 }],
            }),
        );
        expect(cartStore.saveCart).not.toHaveBeenCalled();
    });

    it('UpdateItemToCart: debería llamar updateItemInCart usando el id del carrito', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        authStore.id.set(1);
        cartStore.id.set(9);

        component.UpdateItemToCart({ productId: 3, quantity: 9 });

        expect(cartStore.updateItemInCart).toHaveBeenCalledWith(
            jasmine.objectContaining<Cart>({
                id: 9,
                userId: 1,
                items: [{ productId: 3, quantity: 9 }],
            }),
        );
    });

    it('DeleteItemFromCart: debería llamar deleteItemFromCart si el id es válido', () => {
        const fixture = TestBed.createComponent(CatalogPageComponent);
        const component = fixture.componentInstance;

        component.DeleteItemFromCart(3);
        component.DeleteItemFromCart(0);

        expect(cartStore.deleteItemFromCart).toHaveBeenCalledTimes(1);
        expect(cartStore.deleteItemFromCart).toHaveBeenCalledWith(3);
    });
});