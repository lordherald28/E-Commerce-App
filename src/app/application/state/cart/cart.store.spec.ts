import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { throwError } from 'rxjs';
import { patchState } from '@ngrx/signals';

import { CartStore } from './cart.store';
import { CartRepositoryMock } from './CartRepositoryMock';
import { CartRepository } from '../../../domain/repositories/cart.repository';
import { Cart } from '../../../domain';

describe('CartStore', () => {
    let store: InstanceType<typeof CartStore>;
    let repo: CartRepositoryMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                { provide: CartRepository, useClass: CartRepositoryMock },
                CartStore,
            ],
        });

        store = TestBed.inject(CartStore);
        repo = TestBed.inject(CartRepository) as unknown as CartRepositoryMock;
    });

    it('debería cargar el carrito por usuario y actualizar el estado', () => {
        expect(store.loading()).toBeFalse();
        expect(store.items().length).toBe(0);
        expect(store.userId()).toBeNull();
        expect(store.error()).toBeNull();

        store.loadCartByUser(1);
        TestBed.tick();

        expect(repo.getByUser).toHaveBeenCalledWith(1);

        expect(store.loading()).toBeFalse();
        expect(store.id()).toBe(1);
        expect(store.userId()).toBe(1);
        expect(store.items().length).toBe(2);
        expect(store.items()[0].productId).toBe(1);
        expect(store.items()[0].quantity).toBe(2);
        expect(store.items()[1].productId).toBe(2);
        expect(store.items()[1].quantity).toBe(1);
        expect(store.totalItems()).toBe(2);
        expect(store.totalQuantity()).toBe(3);
        expect(store.error()).toBeNull();
    });

    it('debería manejar error al cargar el carrito', () => {
        repo.getByUser.and.returnValue(throwError(() => new Error('Mock Error')));

        store.loadCartByUser(1);
        TestBed.tick();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBe('Error al cargar el carrito');
        expect(store.items().length).toBe(0);
    });

    it('debería agregar un item al carrito', () => {
        const payload: Cart = {
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        };

        store.addItemToCart(payload);
        TestBed.tick();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.userId()).toBe(1);
        expect(store.items().length).toBe(1);
        expect(store.items()[0].productId).toBe(1);
        expect(store.items()[0].quantity).toBe(2);
        expect(store.totalItems()).toBe(1);
        expect(store.totalQuantity()).toBe(2);
    });

    it('debería actualizar la cantidad del producto dado su id', () => {
        patchState(store as any, {
            userId: 1,
            items: [{ productId: 1, quantity: 6 }],
            loading: false,
            error: null,
        });

        const payload: Cart = {
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 4 }],
        };

        store.updateItemInCart(payload);
        TestBed.tick();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.items().length).toBe(1);
        expect(store.items()[0].productId).toBe(1);
        expect(store.items()[0].quantity).toBe(4);
        expect(store.totalQuantity()).toBe(4);
    });

    it('debería eliminar el producto del carrito dado un id', () => {
        patchState(store as any, {
            userId: 1,
            items: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 },
            ],
            loading: false,
            error: null,
        });

        store.deleteItemFromCart(2);
        TestBed.tick();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.items().length).toBe(1);
        expect(store.items()[0].productId).toBe(1);
        expect(store.totalItems()).toBe(1);
        expect(store.totalQuantity()).toBe(2);
    });

    it('debería llamar createCart y actualizar el store si el payload NO tiene id', () => {
        patchState(store as any, { id: null, userId: 1, items: [], loading: false, error: null });

        const payload: Cart = {
            id: null as any,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        };

        store.saveCart(payload);
        TestBed.tick();

        expect(repo.createCart).toHaveBeenCalledWith(
            jasmine.objectContaining<Cart>({
                userId: 1,
                items: [{ productId: 1, quantity: 2 }],
            }),
        );
        expect(repo.updateCart).not.toHaveBeenCalled();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.id()).toBe(1);
        expect(store.userId()).toBe(1);
        expect(store.items().length).toBe(1);
        expect(store.items()[0].productId).toBe(1);
        expect(store.items()[0].quantity).toBe(2);
    });

    it('debería llamar updateCart y actualizar el store si el payload TIENE id', () => {
        patchState(store as any, { id: 1, userId: 1, items: [{ productId: 1, quantity: 2 }], loading: false, error: null });

        const payload: Cart = {
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 4 }],
        };

        store.saveCart(payload);
        TestBed.tick();

        expect(repo.updateCart).toHaveBeenCalledWith(
            jasmine.objectContaining<Cart>({
                id: 1,
                userId: 1,
                items: [{ productId: 1, quantity: 4 }],
            }),
        );
        expect(repo.createCart).not.toHaveBeenCalled();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.id()).toBe(1);
        expect(store.userId()).toBe(1);
        expect(store.items().length).toBe(1);
        expect(store.items()[0].productId).toBe(1);
        expect(store.items()[0].quantity).toBe(4);
    });

    it('debería llamar al repo y resetear el store', () => {
        patchState(store as any, {
            id: 99,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
            loading: false,
            error: null,
        });

        store.deleteCart(99);
        TestBed.tick();

        expect(repo.deleteCart).toHaveBeenCalledWith(99);

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
        expect(store.id()).toBeNull();
        expect(store.userId()).toBeNull();
        expect(store.items()).toEqual([]);
        expect(store.totalItems()).toBe(0);
        expect(store.totalQuantity()).toBe(0);
    });
});