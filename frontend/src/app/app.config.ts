import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // withFetch(): usa a Fetch API nativa do browser em vez do XMLHttpRequest
    // — melhor performance e compatível com SSR se você adicionar futuramente
    provideHttpClient(withFetch())
  ]
};