import { Observable } from "rxjs";
import { Cart } from "../models/cart.model";

export abstract class CartRepository {
    abstract getByUser(userId: number): Observable<Cart | null>;
    abstract createCart(cart: Cart): Observable<Cart>;
    abstract updateCart(cart: Cart): Observable<Cart>;
    abstract deleteCart(cartId: number): Observable<void>;
}