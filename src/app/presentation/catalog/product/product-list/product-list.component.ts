import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ProductItemComponent } from "../product-item/product-item.component";
import { Product } from '../../../../domain';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductItemComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {

  //** INPUTS */
  items = input.required<Product[]>();

  /** OUTPUTS */
  emitToCreate = output<{ productId: number, quantity: number }>();
  emitToUpdate = output<{ productId: number, quantity: number }>();
  emitToDelete = output<number>();

  constructor() { }

  onAddTo(event: any) {
    this.emitToCreate.emit(event)
  }

  onUpdateTo(event: any) {
    this.emitToUpdate.emit(event)
  }

  onDeleteTo(event: any) {
    this.emitToDelete.emit(event)
  }
}
