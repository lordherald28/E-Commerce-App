import { inject } from "@angular/core";

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { tapResponse } from "@ngrx/operators";

import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe } from "rxjs";
import { switchMap, tap } from "rxjs/operators";

import { Cart, CartItem } from "../../../domain";
import { CartRepository } from "../../../domain/repositories/cart.repository";

export interface CartState {
    id: number | null;
    userId: number | null;
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    id: null,
    userId: null,
    items: [],
    loading: false,
    error: null,
};

export const CartStore = signalStore(
    withState<CartState>(initialState),
    withComputed(({ items }) => ({
        totalItems: () => items().length,
        totalQuantity: () => items().reduce((total, item) => total + item.quantity, 0)
    })),
    withMethods((store, repo = inject(CartRepository)) => ({
        // Cargar el carrito por usuario
        loadCartByUser: rxMethod<number>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null, items: [] })),
                switchMap(userId => repo.getByUser(userId)),
                tapResponse({
                    next: (cart) => {
                        if (!cart) {
                            patchState(store, {
                                loading: false,
                                userId: null,
                                items: []
                            });
                            return;
                        }
                        patchState(store, {
                            id: cart.id as number,
                            userId: cart.userId,
                            items: cart.items,
                            loading: false,
                            error: null
                        });
                    },
                    error: (error) => {
                        console.error('Error al cargar el carrito: ', error);
                        patchState(store, { error: 'Error al cargar el carrito', loading: false });
                    }
                })
            )
        ),
        // Confirmar datos del carrito a la nube.
        saveCart: rxMethod<Cart>(
            pipe(
                tap(() => {
                    patchState(store, { loading: true, error: null });
                }),
                switchMap((cartInput) => {
                    const createOrUpdate$ = cartInput.id == null
                        ? repo.createCart(cartInput)
                        : repo.updateCart(cartInput);

                    return createOrUpdate$.pipe(
                        tapResponse({
                            next: (cart) => {
                                patchState(store, {
                                    id: cart.id,
                                    userId: cart.userId,
                                    items: cart.items,
                                    loading: false,
                                    error: null,
                                });
                            },
                            error: (error) => {
                                console.error('Error al guardar el carrito: ', error);
                                patchState(store, {
                                    loading: false,
                                    error: 'Error al guardar el carrito',
                                });
                            },
                        })
                    );
                })
            )
        ),
        // Cancelar la orden o eliminar un carrito dada una id.
        deleteCart: rxMethod<number>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap((cartId) => {
                    return repo.deleteCart(cartId).pipe(
                        tapResponse({
                            next: (value) => {
                                patchState(store, {
                                    id: null,
                                    userId: null,
                                    items: [],
                                    loading: false,
                                    error: null,
                                });
                            },
                            error(error) {
                                console.error('Error al cancelar la orden: ', error);
                                patchState(store, {
                                    loading: false,
                                    error: 'Error al guardar el carrito',
                                });
                            },
                        })
                    )
                })
            )
        ),
        // Agregar producto al carrito local.
        addItemToCart: rxMethod<Cart>(
            pipe(
                tap((itemsInput) => {
                    patchState(store, { loading: true, error: null });
                    const currentItems = store.items();
                    const merged: CartItem[] = [...currentItems];
                    for (const newItem of itemsInput.items) {
                        const idx = merged.findIndex(i => i.productId === newItem.productId);
                        if (idx === -1) {
                            merged.push(newItem);
                        } else {
                            merged[idx] = {
                                ...merged[idx],
                                quantity: newItem.quantity
                            }
                        }
                    }
                    patchState(store, {
                        userId: itemsInput.userId,
                        items: merged,
                        loading: false,
                        error: null,
                    });
                }),
            )
        ),
        // Actualizar producto del carrito local.
        updateItemInCart: rxMethod<Cart>(
            pipe(
                tap((cartInput) => {
                    patchState(store, { loading: true, error: null });
                    if (cartInput) {
                        const currentItems = store.items();
                        const merged: CartItem[] = [...currentItems];
                        for (const updateItem of cartInput.items) {
                            const idx = merged.findIndex(i => i.productId === updateItem.productId);
                            if (idx !== -1) {
                                merged[idx] = {
                                    ...merged[idx],
                                    quantity: updateItem.quantity,
                                };
                            }
                        }
                        patchState(store, {
                            items: merged,
                            loading: false,
                            error: null,
                        });
                    }
                }),
            )
        ),
        // Eliminar producto del carrito loca.
        deleteItemFromCart: rxMethod<number>(
            pipe(
                tap((productId) => {
                    patchState(store, { loading: true, error: null });
                    const currentItems = store.items();
                    const filteredItems = currentItems.filter(item => item.productId !== productId);
                    patchState(store, {
                        items: filteredItems,
                        loading: false,
                        error: null,
                    });
                }),
            )
        )
    })
    )
)