import { of } from "rxjs";
import { Cart } from "../../../domain";
import { CartRepository } from "../../../domain/repositories/cart.repository";

declare const jasmine: any;

export class CartRepositoryMock extends CartRepository {
    getByUser = jasmine.createSpy().and.returnValue(
        of<Cart | null>({
            id: 1,
            userId: 1,
            items: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 },
            ],
        })
    );

    createCart = jasmine.createSpy().and.returnValue(
        of<Cart>({
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
        })
    );

    updateCart = jasmine.createSpy().and.returnValue(
        of<Cart>({
            id: 1,
            userId: 1,
            items: [{ productId: 1, quantity: 4 }],
        })
    );

    deleteCart = jasmine.createSpy().and.returnValue(of(void 0));
}
