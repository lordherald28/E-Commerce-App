import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { HeaderComponent } from './header.component';
import { AuthStore, CatalogStore } from '../../../application';

class CatalogStoreMock {
  readonly categories = signal<string[]>(['electronics', 'jewelery']);

  setSearchQuery = jasmine.createSpy('setSearchQuery');
  setCategoryFilter = jasmine.createSpy('setCategoryFilter');
  clearFilters = jasmine.createSpy('clearFilters');
}

class AuthStoreMock {
  readonly logged = signal<boolean>(true);
  readonly profile = signal<any>({ name: { firstname: 'Marcos' } });
  logOut = jasmine.createSpy('logOut');
}

describe('HeaderComponent', () => {
  let catalogStore: CatalogStoreMock;
  let authStore: AuthStoreMock;

  beforeEach(() => {
    catalogStore = new CatalogStoreMock();
    authStore = new AuthStoreMock();

    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CatalogStore, useValue: catalogStore },
        { provide: AuthStore, useValue: authStore },
      ],
    });
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.userName()).toBe('Marcos');
    expect(component.userInitial()).toBe('M');
  });

  it('debería leer los inputs title e items', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'Ecommerce');
    fixture.componentRef.setInput('items', 5);
    fixture.detectChanges();

    expect(component.title()).toBe('Ecommerce');
    expect(component.items()).toBe(5);
  });

  it('debería exponer categories desde el store', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    expect(component.categories()).toEqual(['electronics', 'jewelery']);
  });

  it('query: NO debería filtrar si el control es inválido (minLength)', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    catalogStore.setSearchQuery.calls.reset();

    component.searchForm.controls.query.setValue('a');

    expect(catalogStore.setSearchQuery).toHaveBeenCalled();
    expect(catalogStore.setSearchQuery.calls.mostRecent().args[0]).toBe('');
  });

  it('query: debería filtrar cuando el control es válido', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    component.searchForm.controls.query.setValue('a');
    const requiredLength =
      component.searchForm.controls.query.errors?.['minlength']?.requiredLength ?? 4;

    const validQuery = 'x'.repeat(requiredLength);

    catalogStore.setSearchQuery.calls.reset();

    component.searchForm.controls.query.setValue(validQuery);

    expect(catalogStore.setSearchQuery).toHaveBeenCalledWith(validQuery);
  });

  it('category: debería aplicar filtro por categoría y limpiar con vacío', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    catalogStore.setCategoryFilter.calls.reset();

    component.searchForm.controls.category.setValue('electronics');

    expect(catalogStore.setCategoryFilter).toHaveBeenCalledWith('electronics');

    component.searchForm.controls.category.setValue('');

    expect(catalogStore.setCategoryFilter).toHaveBeenCalledWith(null);
  });

  it('onSubmit: si es inválido, no debería forzar búsqueda en el store', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    catalogStore.setSearchQuery.calls.reset();

    component.searchForm.controls.query.setValue('', { emitEvent: false });
    component.onSubmit();

    expect(catalogStore.setSearchQuery).not.toHaveBeenCalled();
  });

  it('onSubmit: si es válido, debería forzar búsqueda (Enter)', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    component.searchForm.controls.query.setValue('a');
    const requiredLength =
      component.searchForm.controls.query.errors?.['minlength']?.requiredLength ?? 4;

    const validQuery = 'z'.repeat(requiredLength);

    catalogStore.setSearchQuery.calls.reset();

    component.searchForm.controls.query.setValue(validQuery, { emitEvent: false });
    component.onSubmit();

    expect(catalogStore.setSearchQuery).toHaveBeenCalledWith(validQuery);
  });

  it('onClear: debería resetear form y limpiar filtros', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    component.searchForm.controls.category.setValue('electronics');
    component.searchForm.controls.query.setValue('abcd');

    catalogStore.clearFilters.calls.reset();

    component.onClear();

    expect(catalogStore.clearFilters).toHaveBeenCalled();
    expect(component.searchForm.controls.category.value).toBe('');
    expect(component.searchForm.controls.query.value).toBe('');
  });

  it('debería actualizar la inicial si cambia el profile.firstname', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    authStore.profile.set({ name: { firstname: 'ana' } });

    expect(component.userInitial()).toBe('A');
  });

  it('la inicial debe ser "?" si no hay nombre (profile null o firstname vacío)', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    authStore.profile.set(null);

    expect(component.userInitial()).toBe('?');
  });

  it('onLogout: debería cerrar menú, hacer logout y navegar a /login', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('title', 'MiHogar');
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true) as any);

    component.isUserMenuOpen.set(true);

    component.onLogout();

    expect(component.isUserMenuOpen()).toBeFalse();
    expect(authStore.logOut).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
