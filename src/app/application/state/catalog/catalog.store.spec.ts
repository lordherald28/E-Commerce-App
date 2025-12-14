
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CatalogStore } from './catalog.store';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { RatingProduct } from '../../../domain';
import { of, throwError } from 'rxjs';
import { ProductRepositoryMock } from './ProductRepositoryMock';

describe('CatalogStore', () => {
    let store: InstanceType<typeof CatalogStore>;
    let repo: ProductRepositoryMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                { provide: ProductRepository, useClass: ProductRepositoryMock },
                CatalogStore,
            ],
        });

        store = TestBed.inject(CatalogStore);
        repo = TestBed.inject(ProductRepository) as ProductRepositoryMock;
    });

    it('debería cargar el catálogo y actualizar el estado', () => {

        expect(store.loading()).toBeFalse();
        expect(store.products().length).toBe(0);
        expect(store.categories().length).toBe(0);


        store.loadCatalogFull();


        expect(repo.getAll).toHaveBeenCalled();
        expect(store.loading()).toBeFalse();
        expect(store.products().length).toBe(1);
        expect(store.categories()).toEqual(['electronics']);
        expect(store.prodcutGroupBycategory().length).toBe(1);
    });

    it('debería cargar un producto dado su Id', () => {
        const mockProduct: RatingProduct = {
            id: 1,
            title: 'P1',
            price: 10,
            description: 'd1',
            category: 'electronics',
            image: 'http://example.com/1',
            rating: {
                rate: 3.9,
                count: 120
            }
        };

        repo.getById.and.returnValue(of(mockProduct));

        expect(store.selectedProduct()).toBeNull();

        store.loadProductById(1);

        expect(repo.getById).toHaveBeenCalledWith(1);
        expect(store.selectedProduct()).toEqual(mockProduct);

    });

    it('debería dejar selectedProduct en null si no se encuentra', () => {
        repo.getById.and.returnValue(of(null));

        store.loadProductById(999);

        expect(repo.getById).toHaveBeenCalledWith(999);
        expect(store.selectedProduct()).toBeNull();
    });

    it('debería manejar errores al cargar', () => {

        repo.getAll.and.returnValue(throwError(() => new Error('mock error')));

        store.loadCatalogFull();

        expect(store.loading()).toBeFalse();
        expect(store.error()).toBe('Error al cargar productos');
        expect(store.products().length).toBe(0);
    });
});
