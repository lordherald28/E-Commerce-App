import { ErrorSeverity } from "../models/error-reporter";

export abstract class LoggerRepository {
    abstract capture(error: unknown, severity: ErrorSeverity, context?: Record<string, unknown>): void;
    abstract captureHttp(err: any, context?: Record<string, unknown>): void;
}  