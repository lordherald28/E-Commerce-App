import { inject } from '@angular/core';
import {
    HttpErrorResponse,
    HttpInterceptorFn,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AppError } from '../../domain/models/app-error.model';
import { ANotificationService } from '../../domain';
import { AuthStore } from '../../application';
import { LoggerService } from './../services';

const mapHttpError = (err: HttpErrorResponse): AppError => {
    let message = 'Ha ocurrido un error inesperado. Inténtalo más tarde.';

    if (err.status === 0) {
        message = 'No hay conexión con el servidor. Revisa tu red.';

    } else if (err.status === 401) {
        message = 'Usuario o contraseña incorrecta.';
    } else if (err.status >= 400 && err.status < 500) {
        message = 'Hubo un problema con la petición. Revisa los datos enviados.';
    } else if (err.status >= 500) {
        message = 'El servidor está teniendo problemas. Inténtalo en unos minutos.';
    }

    return {
        status: err.status,
        message,
        rawError: err,
        url: err.url,
    } satisfies AppError;
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const notification = inject(ANotificationService);
    const autUser = inject(AuthStore);
    const logger = inject(LoggerService);

    const cloned = req.clone({
        setHeaders: {
            'X-App-Client': req.headers.get('X-App-Client') ?? 'ecommerce-app',
            'token': autUser.token() ?? ''
        },
    });

    return next(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
            const errorMapped = mapHttpError(error);
            notification.error(errorMapped.message);
            logger.capture(error, 'error', { feature: 'auth', action: 'login', errorMapped });
            return throwError(() => errorMapped);
        })
    );
};
