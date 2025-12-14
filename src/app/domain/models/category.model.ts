import { Product, RatingProduct } from "./product.model";

export interface CategoryGroup {
    category: string;
    products: RatingProduct[];
}