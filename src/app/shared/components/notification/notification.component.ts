import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NOTIFICATION_UI } from "../../../infrastructure/config/notification.tokens";


@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './notification.component.html'
})
export class NotificationComponent {
    private readonly notificationService = inject(NOTIFICATION_UI)
    readonly notifyService = this.notificationService.notification;
    readonly position: string[] = ['left', 'rigth', 'top', 'button'];
}