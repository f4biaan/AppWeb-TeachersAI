import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment.development';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom([
      HttpClientModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule,
    ]),
    provideMarkdown({ loader: HttpClient }),
    provideAnimationsAsync(),
    provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js')
    }),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
