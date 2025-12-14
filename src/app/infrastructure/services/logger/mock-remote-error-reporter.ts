import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { AErrorReporter, EventError } from '../../../domain/models/error-reporter';

@Injectable({ providedIn: 'root' })
export class MockRemoteErrorReporter implements AErrorReporter {
    report(event: EventError): void {
        timer(250).subscribe(() => {
            const key = 'remote_error_log';
            const prev = JSON.parse(localStorage.getItem(key) ?? '[]') as EventError[];
            localStorage.setItem(key, JSON.stringify([event, ...prev].slice(0, 50)));
        });
    }
}
