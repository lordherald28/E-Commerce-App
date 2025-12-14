import { Observable } from "rxjs";
import { CatalogDetails, Product } from "..";

export abstract class ProductRepository {
    abstract getAll(): Observable<CatalogDetails>;
    abstract getById(id: number): Observable<Product | null>;
}