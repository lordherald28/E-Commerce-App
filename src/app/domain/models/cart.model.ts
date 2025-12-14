import { Product } from "./product.model";

export interface ProductsCart {
    productId: number;
    quantity: number;
}
export interface CartItem  extends ProductsCart{
    product?: Product;
}

export interface Cart {
    id: number | null;
    userId: number;
    items: CartItem[];
}

export type ResponseListCart = {
    id: number;
    userId: number;
    date: string;
    products: ProductsCart[];
};

