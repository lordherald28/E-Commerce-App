import { TestBed } from '@angular/core/testing';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { ProductListComponent } from './product-list.component';
import { ProductItemComponent } from '../product-item/product-item.component';
import { Product } from '../../../../domain';

@Component({
  selector: 'app-product-item',
  standalone: true,
  template: '',
})
class ProductItemStubComponent {
  @Input() product: Product | null = null;
  @Input() isHaveItems: boolean | null = null;

  @Output() addToCart = new EventEmitter<any>();
  @Output() updateToCart = new EventEmitter<any>();
  @Output() deleteToCart = new EventEmitter<any>();
}

describe('ProductListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent, ProductItemStubComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    })
      .overrideComponent(ProductListComponent, {
        remove: { imports: [ProductItemComponent] },
        add: { imports: [ProductItemStubComponent] },
      })
      .compileComponents();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('items', [] as Product[]);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('debería emitir emitToCreate cuando se llama onAddTo', () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('items', [] as Product[]);
    fixture.detectChanges();

    spyOn(component.emitToCreate, 'emit');

    component.onAddTo({ productId: 1, quantity: 2 });

    expect(component.emitToCreate.emit).toHaveBeenCalledWith({ productId: 1, quantity: 2 });
  });

  it('debería emitir emitToUpdate cuando se llama onUpdateTo', () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('items', [] as Product[]);
    fixture.detectChanges();

    spyOn(component.emitToUpdate, 'emit');

    component.onUpdateTo({ productId: 1, quantity: 5 });

    expect(component.emitToUpdate.emit).toHaveBeenCalledWith({ productId: 1, quantity: 5 });
  });

  it('debería emitir emitToDelete cuando se llama onDeleteTo', () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('items', [] as Product[]);
    fixture.detectChanges();

    spyOn(component.emitToDelete, 'emit');

    component.onDeleteTo(9);

    expect(component.emitToDelete.emit).toHaveBeenCalledWith(9);
  });

  it('debería mostrar el mensaje cuando items está vacío', () => {
    const fixture = TestBed.createComponent(ProductListComponent);

    fixture.componentRef.setInput('items', [] as Product[]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay elementos para mostrar.');
  });

  it('debería renderizar un app-product-item por cada item', () => {
    const fixture = TestBed.createComponent(ProductListComponent);

    const items: Product[] = [
      { id: 1 } as any as Product,
      { id: 2 } as any as Product,
      { id: 3 } as any as Product,
    ];

    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-product-item');
    expect(cards.length).toBe(3);
  });
});