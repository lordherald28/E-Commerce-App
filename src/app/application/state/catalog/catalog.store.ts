import {
    signalStore,
    withState,
    withMethods,
    withComputed,
    patchState
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { CategoryGroup, RatingProduct } from '../../../domain';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { EMPTY, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators'
import { switchMap, tap } from 'rxjs/operators';


// Definir estado
export interface CatalogState {
    categories: string[];
    prodcutGroupBycategory: CategoryGroup[];
    products: RatingProduct[];
    loading: boolean;
    error: null | string;
    selectedProduct: RatingProduct | null;

    filterQuery: string;
    filterCategory: string;
}

// Iniciar estado
const initialState: CatalogState = {
    categories: [],
    prodcutGroupBycategory: [],
    products: [],
    loading: false,
    error: null,
    selectedProduct: null,

    filterQuery: '',
    filterCategory: '',
};

// Definiar métodos del estado.
export const CatalogStore = signalStore(
    withState<CatalogState>(initialState),
    withComputed(({ products, filterCategory, filterQuery }) => ({
        totalProducts: () => products().length,

        filteredProducts: computed(() => {
            const allProducts = products();

            const searchQuery = (filterQuery() ?? '').trim().toLowerCase();
            const selectedCategory = (filterCategory() ?? '').trim().toLowerCase();

            return allProducts.filter((product) => {
                const productCategory = (product.category ?? '').toLowerCase();
                const productTitle = (product.title ?? '').toLowerCase();
                const productDescription = (product.description ?? '').toLowerCase();

                const matchesCategory =
                    !selectedCategory || productCategory === selectedCategory;

                const matchesSearchText =
                    !searchQuery || searchQuery.length < 2
                        ? true
                        : productTitle.includes(searchQuery) ||
                        productDescription.includes(searchQuery) ||
                        productCategory.includes(searchQuery);

                return matchesCategory && matchesSearchText;
            });
        }),

    })),
    withMethods((store, repo = inject(ProductRepository)) => ({
        setSearchQuery(query: string) {
            patchState(store, { filterQuery: query ?? '' });
        },

        setCategoryFilter(category: string | null) {
            patchState(store, { filterCategory: category ?? '' });
        },

        clearFilters() {
            patchState(store, { filterQuery: '', filterCategory: '' });
        },
        loadCatalogFull: rxMethod<void>(
            pipe(
                tap(() => {
                    if (store.products().length) {
                        return;
                    }
                    patchState(store, { loading: true, error: null });
                }),
                switchMap(() => {
                    if (store.products().length) {
                        return EMPTY;
                    }

                    return repo.getAll().pipe(
                        tapResponse({
                            next: (catalogDetails) => {
                                patchState(store, {
                                    products: catalogDetails.products,
                                    categories: catalogDetails.categories,
                                    prodcutGroupBycategory: catalogDetails.productGroupByCategory,
                                    selectedProduct: null,
                                    loading: false,
                                });
                            },
                            error: (error) => {
                                console.error('Error al cargar productos:', error);
                                patchState(store, {
                                    error: 'Error al cargar productos',
                                    loading: false,
                                });
                            },
                        })
                    );
                }),
            )
        ),
        loadProductById: rxMethod<number>(
            pipe(
                tap((id) => {
                    const fromStore = store.products().find(p => p.id === id);

                    if (fromStore) {
                        patchState(store, {
                            selectedProduct: fromStore,
                            loading: false,
                            error: null,
                        });
                    } else {
                        patchState(store, { loading: true, error: null });
                    }
                }),
                switchMap((id) => {
                    const fromStore = store.products().find(p => p.id === id);
                    if (fromStore) {
                        return EMPTY;
                    }

                    return repo.getById(id).pipe(
                        tapResponse({
                            next: (product) => {
                                patchState(store, {
                                    selectedProduct: product,
                                    loading: false,
                                });
                            },
                            error: (error) => {
                                console.error('Error al cargar el producto:', error);
                                patchState(store, {
                                    error: 'Error al cargar el producto',
                                    loading: false,
                                });
                            },
                        })
                    );
                }),
            )
        ),

    }))
);
