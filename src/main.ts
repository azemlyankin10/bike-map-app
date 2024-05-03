import { enableProdMode, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { ServiceWorkerModule, provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

// ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    // provideServiceWorker('ngsw-worker.js', {
    //     enabled: !isDevMode(),
    //     registrationStrategy: 'registerWhenStable:30000'
    // })
],
});
