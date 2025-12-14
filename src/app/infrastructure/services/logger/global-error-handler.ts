import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly logger = inject(LoggerService);

    handleError(error: any): void {
        this.logger.capture(error, 'fatal', { source: 'ErrorHandler' });
    }
}
