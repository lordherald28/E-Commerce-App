declare const jasmine: any;

export class NotificationServiceMock {
    success = jasmine.createSpy('success');
    error = jasmine.createSpy('error');
    info = jasmine.createSpy('info');
    warn = jasmine.createSpy('warning');
}