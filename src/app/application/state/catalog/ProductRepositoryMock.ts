import { of } from 'rxjs';
import { CatalogDetails, Product, RatingProduct } from '../../../domain';
import { ProductRepository } from '../../../domain/repositories/product.repository';

declare const jasmine: any;

export class ProductRepositoryMock extends ProductRepository {
    getAll = jasmine.createSpy().and.returnValue(
        of<CatalogDetails>({
            products: [
                {
                    id: 1,
                    title: 'P1',
                    price: 10,
                    description: 'd1',
                    category: 'electronics',
                    image: 'img1',
                    rating: {
                        rate: 3.9,
                        count: 120
                    }
                } as RatingProduct,
            ],
            categories: ['electronics'],
            productGroupByCategory: [
                {
                    category: 'electronics',
                    products: [
                        {
                            id: 1,
                            title: 'P1',
                            price: 10,
                            description: 'd1',
                            category: 'electronics',
                            image: 'img1',
                            rating: {
                                rate: 3.9,
                                count: 120
                            }
                        } as RatingProduct,
                    ],
                },
            ],
        })
    );

    getById = jasmine.createSpy().and.returnValue(of(null));
}
