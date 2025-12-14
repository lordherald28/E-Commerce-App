import { Signal } from "@angular/core";

export interface OnNotification<T> {
    notification: Signal<T | null>;
}