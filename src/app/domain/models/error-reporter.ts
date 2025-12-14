export type ErrorSeverity = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type EventError = {
    severity: ErrorSeverity;
    message: string;
    name?: string;
    stack?: string;
    timestamp: string;
    url?: string;
    userId?: number | null;
    context?: Record<string, unknown>;
};

export abstract class AErrorReporter {
    abstract report(event: EventError): void;
}
