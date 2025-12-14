import { inject, Injectable } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/user.repository';
import { concatMap, from, map, Observable, switchMap } from 'rxjs';
import { Profile, User } from '../../../domain';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthUserService extends AuthRepository {

  private readonly API_URL = 'https://fakestoreapi.com';

  private readonly http = inject(HttpClient);

  constructor() { super(); }

  AuthUser(user: User): Observable<User | null> {
    const userId = user.id || 1;
    return this.http.post<User>(`${this.API_URL}/auth/login`, user).pipe(
      concatMap((user: User) => {
        return this.http.get<User>(`${this.API_URL}/users/${userId}`)
          .pipe(
            map((userInfo: User) => {
              const profile: Profile = {
                name: {
                  firstname: (userInfo as any).name?.firstname ?? userInfo.username ?? '',
                  lastname: (userInfo as any).name?.lastname ?? ''
                },
                address: (userInfo as any).address
              };

              const result: User = {
                id: userInfo.id,
                username: userInfo.username,
                password: userInfo.password,
                email: userInfo.email,
                token: user.token,
                profile
              };

              return result;
            })
          );
      })
    )
  }
}
