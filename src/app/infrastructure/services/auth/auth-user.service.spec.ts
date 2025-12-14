import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthUserService } from './auth-user.service';
import { User } from '../../../domain';

describe('AuthUserService', () => {
  let service: AuthUserService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://fakestoreapi.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthUserService,
      ],
    });

    service = TestBed.inject(AuthUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería autenticar y devolver el usuario con token y profile', () => {
    const payload: User = {
      id: 1,
      username: 'gera',
      password: '123456',
      profile: {} as any,
    } as any;

    const loginResponse = { token: 'AAAbbb' } as any;

    const userInfoResponse = {
      id: 1,
      username: 'gera',
      password: '123456',
      email: 'gera@gmail.com',
      name: { firstname: 'Gera', lastname: 'Perez' },
      address: { city: 'X' },
    } as any;

    let result: User | null = null;

    service.AuthUser(payload).subscribe((res) => (result = res));

    const loginReq = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual(payload);
    loginReq.flush(loginResponse);

    const userReq = httpMock.expectOne(`${API_URL}/users/1`);
    expect(userReq.request.method).toBe('GET');
    userReq.flush(userInfoResponse);

    expect(result).toEqual({
      id: 1,
      username: 'gera',
      password: '123456',
      email: 'gera@gmail.com',
      token: 'AAAbbb',
      profile: {
        name: { firstname: 'Gera', lastname: 'Perez' },
        address: { city: 'X' },
      },
    } as any);
  });
});