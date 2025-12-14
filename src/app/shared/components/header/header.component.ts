import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore, CatalogStore } from '../../../application';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly catalogStore = inject(CatalogStore);
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly isLogged = this.authStore.logged;

  readonly isUserMenuOpen = signal(false);
  readonly isSearchOpen = signal(false);
  
  readonly categories = this.catalogStore.categories;

  readonly userName = computed(() => this.authStore.profile()?.name.firstname ?? '');
  readonly userInitial = computed(() => this.userName()[0]?.toUpperCase() ?? '?');

  /** INPUTS */
  readonly title = input.required<string>();
  readonly items = input<number>(0);

  readonly searchForm = this.fb.nonNullable.group({
    category: this.fb.nonNullable.control(''),
    query: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4)]),
  });

  constructor() {
    this.searchForm.controls.category.valueChanges.subscribe((selectedCategory) => {
      this.catalogStore.setCategoryFilter(selectedCategory || null);
    });

    this.searchForm.controls.query.valueChanges.subscribe((rawValue) => {
      const queryControl = this.searchForm.controls.query;
      const searchQuery = (rawValue ?? '').trim();
      this.catalogStore.setSearchQuery(queryControl.valid ? searchQuery : '');
    });


  }

  onSubmit() {

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const q = this.searchForm.controls.query.value.trim();
    this.catalogStore.setSearchQuery(q);
  }

  onClear() {
    this.searchForm.reset({ category: '', query: '' });
    this.catalogStore.clearFilters();
  }

  openSearch(): void {
    this.isSearchOpen.set(true);
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  onSubmitMobile(): void {
    this.onSubmit();
    if (this.searchForm.valid) this.closeSearch();
  }

  onClearMobile(): void {
    this.onClear();
    this.closeSearch();
  }
  
  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  onLogout(): void {
    this.closeUserMenu();
    this.authStore.logOut();
    this.router.navigateByUrl('/login');
  }

}

