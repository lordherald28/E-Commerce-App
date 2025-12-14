
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';


import { ProductService } from "./product.service";
import { CatalogDetails, Product } from '../../../domain';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;

    const API_URL = 'https://fakestoreapi.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideHttpClientTesting(),
                ProductService
            ],
        });

        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería devolver CatalogDetails con productos, categorías y grupos por categoría', () => {
        const mockProducts: Product[] = [
            { id: 1, title: 'P1', price: 10, description: 'd1', category: 'electronics', image: 'http://example.com/1' },
            { id: 2, title: 'P2', price: 20, description: 'd2', category: 'jewelery', image: 'http://example.com/2' },
        ];

        const mockCategories = ['electronics', 'jewelery'];

        const mockElectronics: Product[] = [
            { id: 1, title: 'P1', price: 10, description: 'd1', category: 'electronics', image: 'http://example.com/1' },
        ];

        const mockJewelery: Product[] = [
            { id: 2, title: 'P2', price: 20, description: 'd2', category: 'jewelery', image: 'http://example.com/2' },
        ];

        let result: CatalogDetails | undefined;

        service.getAll().subscribe((res) => (result = res));

        // 1 llamada: /products
        const reqProducts = httpMock.expectOne(`${API_URL}/products`);
        expect(reqProducts.request.method).toBe('GET');
        reqProducts.flush(mockProducts);

        // 2 llamada: /products/categories
        const reqCategories = httpMock.expectOne(`${API_URL}/products/categories`);
        expect(reqCategories.request.method).toBe('GET');
        reqCategories.flush(mockCategories);

        // 3 capa: /products/category/{category}
        const reqCat1 = httpMock.expectOne(`${API_URL}/products/category/${mockCategories[0]}`);
        expect(reqCat1.request.method).toBe('GET');
        reqCat1.flush(mockElectronics);

        const reqCat2 = httpMock.expectOne(`${API_URL}/products/category/jewelery`);
        expect(reqCat2.request.method).toBe('GET');
        reqCat2.flush(mockJewelery);

        expect(result).toEqual({
            products: mockProducts,
            categories: mockCategories,
            productGroupByCategory: [
                { category: 'electronics', products: mockElectronics },
                { category: 'jewelery', products: mockJewelery },
            ],
        });
    });

    it('debería cargar un producto dado su id', () => {
        const mockProduct: Product = {
            id: 1,
            title: 'P1',
            price: 10,
            description: 'd1',
            category: 'electronics',
            image: 'http://example.com/1'
        };

        let result: Product | undefined;

        service.getById(1).subscribe((res) => (result = res));

        const reqProducts = httpMock.expectOne(`${API_URL}/products/${1}`);
        expect(reqProducts.request.method).toBe('GET');
        reqProducts.flush(mockProduct);

        expect(result).toEqual(mockProduct);
    });
});