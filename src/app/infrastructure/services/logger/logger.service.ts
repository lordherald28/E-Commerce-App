import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../application';
import { AErrorReporter, ErrorSeverity, EventError } from '../../../domain/models/error-reporter';
import { LoggerRepository } from '../../../domain/repositories/logger.repository';

@Injectable({ providedIn: 'root' })
export class LoggerService extends LoggerRepository {
    private readonly reporter = inject(AErrorReporter);
    private readonly router = inject(Router);
    private readonly authStore = inject(AuthStore);

    capture(error: unknown, severity: ErrorSeverity = 'error', context?: Record<string, unknown>) {
        const err = this.normalize(error);

        const event: EventError = {
            severity,
            message: err.message ?? 'Unknown error',
            name: err.name,
            stack: err.stack,
            timestamp: new Date().toISOString(),
            url: this.router.url,
            userId: this.authStore.id?.() ?? null,
            context,
        };

        this.reporter.report(event);
    }

    captureHttp(err: any, context?: Record<string, unknown>) {
        this.capture(err, 'error', { source: 'http', ...context });
    }

    private normalize(error: any): { message?: string; name?: string; stack?: string } {
        if (error instanceof Error) return { message: error.message, name: error.name, stack: error.stack };
        if (typeof error === 'string') return { message: error };
        try { return { message: JSON.stringify(error) }; } catch { return { message: String(error) }; }
    }
}
