import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ErrorHandler } from '@angular/core';

bootstrapApplication(App, appConfig).then((appRef) => {
  const injector = appRef.injector;
  const errorHandler = injector.get(ErrorHandler);

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason);
  });

  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error ?? event.message);
  });
});