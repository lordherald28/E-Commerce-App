import { InjectionToken } from '@angular/core';
import { OnNotification } from '../contract/segregation.interface';
import { INotification } from '../../domain/models/notification.model';

export const NOTIFICATION_UI = new InjectionToken<OnNotification<INotification>>('NOTIFICATION_UI');
