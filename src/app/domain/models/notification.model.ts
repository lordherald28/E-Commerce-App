
export type NotificationType = 'success' | 'error' | 'info' | 'warn';

export type PositionType = 'left' | 'top' | 'bottom' | 'right';

export interface INotification {
    type: NotificationType;
    message: string;
}