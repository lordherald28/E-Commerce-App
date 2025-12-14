import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ProductDetailPageComponent } from './product-detail-page.component';
import { AuthStore, CartStore, CatalogStore } from '../../../../application';
import { Product } from '../../../../domain';
import { UPDATE_DELAY_MS } from '../../../../shared/utils/const.utils';

class AuthStoreMock {
  readonly id = signal<number | null>(123);
}

class CatalogStoreMock {
  readonly products = signal<Product[]>([]);
  readonly selectedProduct = signal<any>(null);
  readonly loading = signal(false);

  loadCatalogFull = jasmine.createSpy('loadCatalogFull');
  loadProductById = jasmine.createSpy('loadProductById');
}

class CartStoreMock {
  readonly items = signal<any[]>([]);
  readonly id = signal<number | null>(null);

  saveCart = jasmine.createSpy('saveCart');
  addItemToCart = jasmine.createSpy('addItemToCart');
}

describe('ProductDetailPageComponent', () => {
  let authStore: AuthStoreMock;
  let catalogStore: CatalogStoreMock;
  let cartStore: CartStoreMock;

  let paramMap$: BehaviorSubject<ParamMap>;

  const makeRouteMock = (id: number | null) => {
    const map = convertToParamMap(id == null ? {} : { id: String(id) });
    paramMap$ = new BehaviorSubject<ParamMap>(map);

    return {
      snapshot: { paramMap: map },
      paramMap: paramMap$.asObservable(),
    } as unknown as ActivatedRoute;
  };

  const p = (id: number, category = 'cat'): Product =>
  ({
    id,
    title: `P${id}`,
    description: `D${id}`,
    price: id,
    image: `img${id}.png`,
    category,
  } as any as Product);

  const setupRoute = (id: number) => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: makeRouteMock(id) });
    catalogStore.selectedProduct.set(p(id));
  };

  beforeEach(() => {
    jasmine.clock().install();

    authStore = new AuthStoreMock();
    catalogStore = new CatalogStoreMock();
    cartStore = new CartStoreMock();

    // defaults seguros
    catalogStore.products.set([]);
    catalogStore.selectedProduct.set(p(1));
    cartStore.items.set([]);
    cartStore.id.set(null);

    TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),

        { provide: AuthStore, useValue: authStore },
        { provide: CatalogStore, useValue: catalogStore },
        { provide: CartStore, useValue: cartStore },
        { provide: ActivatedRoute, useValue: makeRouteMock(1) },
      ],
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('debería llamar loadCatalogFull si products está vacío', () => {
    catalogStore.products.set([]);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();

    expect(catalogStore.loadCatalogFull).toHaveBeenCalled();
  });

  it('NO debería llamar loadCatalogFull si ya hay products', () => {
    catalogStore.products.set([p(1), p(2)]);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();

    expect(catalogStore.loadCatalogFull).not.toHaveBeenCalled();
  });

  it('debería llamar loadProductById con el id del paramMap', () => {
    setupRoute(7);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();

    expect(catalogStore.loadProductById).toHaveBeenCalledWith(7);
  });

  it('debería volver a llamar loadProductById si cambia el paramMap', () => {
    setupRoute(3);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();

    expect(catalogStore.loadProductById).toHaveBeenCalledWith(3);

    catalogStore.loadProductById.calls.reset();

    paramMap$.next(convertToParamMap({ id: '4' }));
    fixture.detectChanges();

    expect(catalogStore.loadProductById).toHaveBeenCalledTimes(2);
    expect(catalogStore.loadProductById).toHaveBeenCalledWith(4);
  });

  it('product: debería salir desde products si existe en la lista', () => {
    setupRoute(2);

    catalogStore.products.set([p(1), p(2), p(3)]);
    catalogStore.selectedProduct.set(p(999));

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.product()?.id).toBe(2);
  });

  it('product: debería salir desde selectedProduct si no está en la lista', () => {
    setupRoute(10);

    catalogStore.products.set([p(1), p(2)]);
    catalogStore.selectedProduct.set(p(10));

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.product()?.id).toBe(10);
  });

  it('relatedProducts: misma categoría, distinto id, máximo 6', () => {
    setupRoute(1);

    catalogStore.products.set([
      p(1, 'A'),
      p(2, 'A'),
      p(3, 'A'),
      p(4, 'A'),
      p(5, 'A'),
      p(6, 'A'),
      p(7, 'A'),
      p(8, 'B'),
    ]);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const related = component.relatedProducts();
    expect(related.length).toBe(6);
    expect(related.some((x) => x.id === 1)).toBeFalse();
    expect(related.every((x) => x.category === 'A')).toBeTrue();
  });

  it('effect: debería sincronizar quantityProductSelected con el carrito', () => {
    setupRoute(1);

    cartStore.items.set([{ productId: 1, quantity: 5 }]);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.quantityProductSelected()).toBe(5);

    cartStore.items.set([{ productId: 1, quantity: 2 }]);
    fixture.detectChanges();

    expect(component.quantityProductSelected()).toBe(2);
  });

  it('increaseCount: debería incrementar con delay y activar updatingQuantity', () => {
    setupRoute(1);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.quantityProductSelected.set(1);

    component.increaseCount();
    expect(component.updatingQuantity()).toBeTrue();
    expect(component.quantityProductSelected()).toBe(2);

    jasmine.clock().tick(UPDATE_DELAY_MS);
    expect(component.quantityProductSelected()).toBe(2);
    expect(component.updatingQuantity()).toBeFalse();
  });

  it('increaseCount: anti-spam (2 clicks rápidos = +1)', () => {
    setupRoute(1);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.quantityProductSelected.set(1);

    component.increaseCount();
    component.increaseCount();

    jasmine.clock().tick(UPDATE_DELAY_MS);

    expect(component.quantityProductSelected()).toBe(2);
    expect(component.updatingQuantity()).toBeFalse();
  });

  it('decreaseCount: no debería bajar de 1', () => {
    setupRoute(1);

    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.quantityProductSelected.set(1);

    component.decreaseCount();
    jasmine.clock().tick(UPDATE_DELAY_MS);

    expect(component.quantityProductSelected()).toBe(1);
    expect(component.updatingQuantity()).toBeFalse();
  });
});
