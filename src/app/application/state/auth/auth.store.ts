import {
    signalStore,
    withState,
    withMethods,
    patchState,
    withHooks
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { Profile, User } from '../../../domain';
import { pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators'
import { switchMap, tap } from 'rxjs/operators';
import { AuthUserService } from '../../../infrastructure';


// Definir estado
export interface UserStore {
    id: number | null;
    email: string;
    username: string;
    password: string;
    token: string | null;
    error: string | null;
    loading: boolean;
    logged: boolean;
    profile: Profile | null;

}

// Iniciar estado
const initialState: UserStore = {
    id: null,
    email: '',
    username: '',
    password: '',
    token: null,
    error: null,
    loading: false,
    logged: false,
    profile: null
};

// Definiar métodos del estado.
export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState<UserStore>(initialState),
    // AUTOLOGIN
    withHooks((store) => ({
        onInit() {
            const aut_token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('profile');
            if (!aut_token) return;

            const token = JSON.parse(aut_token) as string | null;
            const profile = user ? (JSON.parse(user) as Profile | null) : null;

            if (!token) return;

            patchState(store, {
                token,
                logged: true,
                error: null,
                profile: profile
            });
        },
    })),
    withMethods((store, repo = inject(AuthUserService)) => ({
        login: rxMethod<User>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null, logged: false })),
                switchMap((user) =>
                    repo.AuthUser(user).pipe(
                        tapResponse({
                            next: (user) => {
                                if (user) {
                                    patchState(store, {
                                        email: user?.email,
                                        id: user?.id,
                                        username: user?.username,
                                        token: user?.token,
                                        error: null,
                                        loading: false,
                                        logged: true,
                                        profile: user.profile
                                    });
                                    localStorage.setItem('auth_token', JSON.stringify(user.token))
                                    localStorage.setItem('profile', JSON.stringify(user.profile))
                                }
                            },
                            error: (error) => {
                                console.error('Error al iniciar sesion: ', error);
                                patchState(store, {
                                    loading: false,
                                    logged: false,
                                    error: 'Error al iniciar sesion',
                                });
                            }
                        })
                    )
                )
            )
        ),
        logOut: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('profile');
            patchState(store, { ...initialState });
        }
    })
    ));