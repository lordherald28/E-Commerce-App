export interface AppError {
    status: number;
    message: string;
    rawError?: any,
    url?: string | null;
}