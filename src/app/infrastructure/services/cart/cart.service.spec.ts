import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Cart, ResponseListCart } from '../../../domain';

describe('CartService', () => {
    let service: CartService;
    let httpMock: HttpTestingController;

    const API_URL = 'https://fakestoreapi.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideHttpClientTesting(),
                CartService,
            ],
        });

        service = TestBed.inject(CartService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería obtener el carrito de un usuario y mapearlo a Cart', () => {
        const mockResponse: ResponseListCart[] = [
            {
                id: 1,
                userId: 1,
                date: '2020-01-01T00:00:00.000Z',
                products: [{ productId: 1, quantity: 2 }],
            } as any,
        ];

        let result!: Cart | null;

        service.getByUser(1).subscribe((res) => (result = res));

        const req = httpMock.expectOne(`${API_URL}/carts/user/1`);
        expect(req.request.url).toBe(`${API_URL}/carts/user/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(result).toEqual({
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        });
    });

    it('debería agregar un producto al carrito y devolver el estado actualizado del carrito', () => {
        const mockCartResponse = {
            id: 1,
            userId: 3,
            products: [{ productId: 1, quantity: 2 }],
        };

        const expected: Cart = {
            id: 1,
            userId: 3,
            items: [{ productId: 1, quantity: 2 }],
        };

        let result!: Cart;

        const payload: Cart = {
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        };

        service.createCart(payload).subscribe((res) => (result = res));

        const req = httpMock.expectOne(`${API_URL}/carts`);
        expect(req.request.url).toBe(`${API_URL}/carts`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            userId: 1,
            date: jasmine.any(String),
            products: [{ productId: 1, quantity: 2 }],
        });

        req.flush(mockCartResponse);

        expect(result).toEqual(expected);
    });

    it('debería actualizar un producto dentro del carrito y devolver el estado actualizado del carrito', () => {
        const mockCartResponseUpdate = {
            id: 1,
            userId: 3,
            products: [{ productId: 1, quantity: 2 }],
        };

        const expected: Cart = {
            id: 1,
            userId: 3,
            items: [{ productId: 1, quantity: 2 }],
        };

        let result!: Cart;

        const payload: Cart = {
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        };

        service.updateCart(payload).subscribe((res) => (result = res));

        const req = httpMock.expectOne(`${API_URL}/carts/1`);
        expect(req.request.url).toBe(`${API_URL}/carts/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({
            id: 1,
            userId: 1,
            date: jasmine.any(String),
            products: [{ productId: 1, quantity: 2 }],
        });

        req.flush(mockCartResponseUpdate);

        expect(result).toEqual(expected);
    });

    it('debería eliminar un producto del carrito', () => {
        let completed = false;

        service.deleteCart(1).subscribe(() => {
            completed = true;
        });

        const req = httpMock.expectOne(`${API_URL}/carts/1`);
        expect(req.request.url).toBe(`${API_URL}/carts/1`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null);

        expect(completed).toBeTrue();
    });
});