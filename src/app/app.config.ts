import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';
import { ProductRepository } from './domain/repositories/product.repository';
import { ProductService } from './infrastructure/services/product/product.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CartRepository } from './domain/repositories/cart.repository';
import { CartService } from './infrastructure/services/cart/cart.service';
import { httpInterceptor } from './infrastructure/interceptors/app-http.interceptor';
import { ANotificationService } from './domain';
import { NotificationService } from './infrastructure/services/notification/notification.service';
import { NOTIFICATION_UI } from './infrastructure/config/notification.tokens';
import { AuthRepository } from './domain/repositories/user.repository';
import { AuthUserService, LoggerService } from './infrastructure';
import { GlobalErrorHandler } from './infrastructure/services/logger/global-error-handler';
import { MockRemoteErrorReporter } from './infrastructure/services/logger/mock-remote-error-reporter';
import { AErrorReporter } from './domain/models/error-reporter';
import { LoggerRepository } from './domain/repositories/logger.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([httpInterceptor])
    ),
    { provide: ProductRepository, useClass: ProductService },
    { provide: CartRepository, useClass: CartService },
    { provide: ANotificationService, useExisting: NotificationService },
    { provide: AuthRepository, useExisting: AuthUserService },
    { provide: LoggerRepository, useExisting: LoggerService },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: AErrorReporter, useClass: MockRemoteErrorReporter },
    { provide: NOTIFICATION_UI, useExisting: NotificationService }
  ]
};
