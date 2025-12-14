import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { NotificationComponent } from './notification.component';
import { NOTIFICATION_UI } from '../../../infrastructure/config/notification.tokens';

type NotificationType = 'success' | 'error' | 'warn' | 'info';
type UiNotification = { type: NotificationType; message: string };

describe('NotificationComponent', () => {
    let notificationSignal: ReturnType<typeof signal<UiNotification | null>>;

    beforeEach(() => {
        notificationSignal = signal<UiNotification | null>(null);

        TestBed.configureTestingModule({
            imports: [NotificationComponent],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: NOTIFICATION_UI,
                    useValue: { notification: notificationSignal },
                },
            ],
        });
    });

    it('debería crear el componente y leer el servicio (signal) por token', () => {
        const fixture = TestBed.createComponent(NotificationComponent);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.notifyService()).toBeNull();
        expect(component.position).toEqual(['left', 'rigth', 'top', 'button']);
    });

    it('debería reflejar una notificación success desde el servicio', () => {
        const fixture = TestBed.createComponent(NotificationComponent);
        const component = fixture.componentInstance;

        notificationSignal.set({ type: 'success', message: 'OK' });
        fixture.detectChanges();

        expect(component.notifyService()?.type).toBe('success');
        expect(component.notifyService()?.message).toBe('OK');

        const box: HTMLElement = fixture.nativeElement.querySelector('.bg-green-600');
        expect(box).toBeTruthy();
        expect(box.classList.contains('opacity-100')).toBeTrue();
        expect(fixture.nativeElement.textContent).toContain('OK');
    });

    it('debería ocultarse si no hay notificación', () => {
        const fixture = TestBed.createComponent(NotificationComponent);

        notificationSignal.set(null);
        fixture.detectChanges();

        const box: HTMLElement = fixture.nativeElement.querySelector('.opacity-0');
        expect(box).toBeTruthy();
    });

    it('debería reflejar una notificación error desde el servicio', () => {
        const fixture = TestBed.createComponent(NotificationComponent);
        const component = fixture.componentInstance;

        notificationSignal.set({ type: 'error', message: 'Fallo' });
        fixture.detectChanges();

        expect(component.notifyService()?.type).toBe('error');

        const box: HTMLElement = fixture.nativeElement.querySelector('.bg-red-600');
        expect(box).toBeTruthy();
        expect(fixture.nativeElement.textContent).toContain('Fallo');
    });
});
