import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { authInterceptor, timeZoneInterceptor } from '@core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor, timeZoneInterceptor])),
        provideRouter(routes),
    ],
};
