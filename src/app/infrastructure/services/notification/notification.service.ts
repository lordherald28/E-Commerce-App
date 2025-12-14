import { Injectable, Signal, signal } from '@angular/core';
import { ANotificationService } from '../../../domain';
import { INotification, NotificationType } from '../../../domain/models/notification.model';
import { OnNotification } from '../../contract/segregation.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService extends ANotificationService implements OnNotification<INotification> {

    private readonly notificationSignal = signal<INotification | null>(null);
    readonly notification: Signal<INotification | null> = this.notificationSignal;

    private hideForTime: number | undefined;

    constructor() { super(); }

    warn(message: string): void {
        this.showNotification(message, 'warn');
    }

    error(message: string): void {
        this.showNotification(message, 'error');
    }

    info(message: string): void {
        this.showNotification(message, 'info');
    }

    success(message: string): void {
        this.showNotification(message, 'success');
    }

    private showNotification(message: string, type: NotificationType): void {

        if (this.hideForTime !== null || this.hideForTime !== undefined) {
            clearTimeout(this.hideForTime)
        }

        this.hideForTime = setTimeout(() => {
            this.notificationSignal.set(null);
            this.hideForTime = undefined;
        }, 10000);

        this.notificationSignal.set({
            message: message,
            type
        });
    }

}
