import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { ProductItemComponent } from './product-item.component';
import { AuthStore, CartStore } from '../../../../application';
import { Product } from '../../../../domain';

class CartStoreMock {
    readonly items = signal<any[]>([]);
}

class AuthStoreMock {
    readonly logged = signal<boolean>(true);
}

describe('ProductItemComponent', () => {
    let cartStore: CartStoreMock;
    let authStore: AuthStoreMock;

    const productMock = {
        id: 1,
        title: 'Producto 1',
        description: 'Desc',
        price: 10,
        image: 'https://img.test/1.png',
    } as any as Product;

    beforeEach(() => {
        cartStore = new CartStoreMock();
        authStore = new AuthStoreMock();

        TestBed.configureTestingModule({
            imports: [ProductItemComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                { provide: CartStore, useValue: cartStore },
                { provide: AuthStore, useValue: authStore },
            ],
        });
    });

    it('debería crear el componente con el input requerido', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.componentRef.setInput('isHaveItems', true);
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.product().id).toBe(1);
        expect(component.inCart()).toBeFalse();
        expect(component.formItem.controls.amount.value).toBe(1);
        expect(component.isLogged()).toBeTrue();
    });

    it('inCart: debería ser true si el producto existe en el carrito', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        cartStore.items.set([{ productId: 1, quantity: 3 }]);

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        expect(component.inCart()).toBeTrue();
    });

    it('effect: debería sincronizar amount con la cantidad del carrito', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        cartStore.items.set([{ productId: 1, quantity: 3 }]);

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        expect(component.formItem.controls.amount.value).toBe(3);

        cartStore.items.set([{ productId: 1, quantity: 5 }]);
        fixture.detectChanges();

        expect(component.formItem.controls.amount.value).toBe(5);
    });

    it('debería aumentar y disminuir la cantidad (min 1)', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        expect(component.formItem.controls.amount.value).toBe(1);

        component.increaseCount();
        expect(component.formItem.controls.amount.value).toBe(2);

        component.decreaseCount();
        expect(component.formItem.controls.amount.value).toBe(1);

        component.decreaseCount();
        expect(component.formItem.controls.amount.value).toBe(1);
    });

    it('onAdd: si el form es inválido no emite', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        spyOn(component.addToCart, 'emit');

        component.formItem.controls.amount.setValue(0);
        component.onAdd();

        expect(component.addToCart.emit).not.toHaveBeenCalled();
    });

    it('onAdd: debería emitir addToCart con productId y quantity', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        spyOn(component.addToCart, 'emit');

        component.formItem.controls.amount.setValue(4);
        component.onAdd();

        expect(component.addToCart.emit).toHaveBeenCalledWith({ productId: 1, quantity: 4 });
    });

    it('onUpdateAmount: si el form es inválido no emite', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        spyOn(component.updateToCart, 'emit');

        component.formItem.controls.amount.setValue(0);
        component.onUpdateAmount();

        expect(component.updateToCart.emit).not.toHaveBeenCalled();
    });

    it('onUpdateAmount: debería emitir updateToCart con productId y quantity', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        spyOn(component.updateToCart, 'emit');

        component.formItem.controls.amount.setValue(6);
        component.onUpdateAmount();

        expect(component.updateToCart.emit).toHaveBeenCalledWith({ productId: 1, quantity: 6 });
    });

    it('onCancel: debería resetear amount a 1 y emitir deleteToCart', () => {
        const fixture = TestBed.createComponent(ProductItemComponent);
        const component = fixture.componentInstance;

        fixture.componentRef.setInput('product', productMock);
        fixture.detectChanges();

        spyOn(component.deleteToCart, 'emit');

        component.formItem.controls.amount.setValue(9);
        component.onCancel(1);

        expect(component.formItem.controls.amount.value).toBe(1);
        expect(component.deleteToCart.emit).toHaveBeenCalledWith(1);
    });
});