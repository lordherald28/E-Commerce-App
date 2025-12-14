import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { LoginPageComponent } from './login-page.component';
import { AuthStore } from '../../../application';
import { ANotificationService, User } from '../../../domain';

class AuthStoreMock {
  readonly loading = signal(false);
  readonly logged = signal(false);
  readonly profile = signal<any>(null);
  readonly login = jasmine.createSpy('login');
}

class NotificationMock {
  readonly success = jasmine.createSpy('success');
}

describe('LoginPageComponent', () => {
  let authStore: AuthStoreMock;
  let notification: NotificationMock;
  let routeMock: any;

  beforeEach(async () => {
    authStore = new AuthStoreMock();
    notification = new NotificationMock();
    routeMock = {
      snapshot: {
        queryParamMap: convertToParamMap({}),
      },
    } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: ANotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();
  });

  const create = () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  };

  it('debería crear el componente', () => {
    const { component } = create();
    expect(component).toBeTruthy();
  });

  it('onSubmit: si el form es inválido no llama login y marca touched', () => {
    const { component } = create();

    component.loginForm.setValue({ username: '', password: '' });
    component.onSubmit();

    expect(component.isSubmitted()).toBeTrue();
    expect(component.loginForm.touched).toBeTrue();
    expect(authStore.login).not.toHaveBeenCalled();
  });

  it('onSubmit: si el form es válido llama login con el payload', () => {
    const { component } = create();

    component.loginForm.setValue({ username: 'marcos', password: '1234567' });
    component.onSubmit();

    expect(authStore.login).toHaveBeenCalledWith({
      username: 'marcos',
      password: '1234567',
    } as User);
  });

  it('effect: cuando logged=true y loading=false navega al returnUrl y notifica', () => {
    routeMock.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/cart' });

    const { fixture } = create();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true) as any);

    authStore.profile.set({ name: { firstname: 'Marcos', lastname: 'Maure' } });
    authStore.loading.set(false);
    authStore.logged.set(true);

    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/cart');
    expect(notification.success).toHaveBeenCalledWith(jasmine.stringMatching(/Marcos\s+Maure/));
  });

  it('effect: si no hay returnUrl navega a /catalog', () => {
    routeMock.snapshot.queryParamMap = convertToParamMap({});

    const { fixture } = create();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true) as any);

    authStore.profile.set({ name: { firstname: 'Marcos', lastname: 'Maure' } });
    authStore.loading.set(false);
    authStore.logged.set(true);

    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/catalog');
    expect(notification.success).toHaveBeenCalled();
  });
});