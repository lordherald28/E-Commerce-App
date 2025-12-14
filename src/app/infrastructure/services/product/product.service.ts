import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { concatMap, from, Observable, of, switchMap, toArray } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductRepository } from '../../../domain/repositories/product.repository';
import { CatalogDetails, Product } from '../../../domain'

@Injectable({ providedIn: 'root' })
export class ProductService extends ProductRepository {
    private readonly API_URL = 'https://fakestoreapi.com';

    constructor(private http: HttpClient) { super(); }

    getAll(): Observable<CatalogDetails> {
        return this.http.get<Product[]>(`${this.API_URL}/products`).pipe(
            switchMap((products) =>
                this.http
                    .get<string[]>(`${this.API_URL}/products/categories`)
                    .pipe(
                        switchMap((categories) =>
                            from(categories).pipe(
                                concatMap((category) =>
                                    this.http
                                        .get<Product[]>(`${this.API_URL}/products/category/${category}`)
                                        .pipe(
                                            map((prods) => ({
                                                category,
                                                products: prods,
                                            }))
                                        )
                                ),
                                toArray(),
                                map((groups) => ({
                                    products: products,
                                    categories: categories,
                                    productGroupByCategory: groups,
                                }))
                            )
                        )
                    )
            )
        );
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API_URL}/products/${id}`);
    }

}
