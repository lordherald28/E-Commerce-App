import { CategoryGroup } from "./category.model";

export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
    category: string;

}

export type CatalogDetails = {
    products: Product[];
    categories: string[];
    productGroupByCategory: CategoryGroup[];
}

export interface RatingProduct extends Product {
    rating?: {
        rate: number,
        count: number
    }
}