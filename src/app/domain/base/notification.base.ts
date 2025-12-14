import { INotification } from "../models/notification.model";

export abstract class ANotificationService {
    abstract error(message: string): void;
    abstract warn(message: string): void;
    abstract info(message: string): void;
    abstract success(message: string): void;
}