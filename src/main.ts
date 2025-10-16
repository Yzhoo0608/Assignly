// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

// ✅ Initialize Firebase manually
const app = initializeApp(environment.firebaseConfig);
const firestore = getFirestore(app);

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      IonicModule.forRoot(),
      IonicStorageModule.forRoot()
    ),
    provideRouter(routes),
    
    // ✅ Provide manually initialized Firestore instance
    { provide: 'FIRESTORE_INSTANCE', useValue: firestore }
  ]
}).catch(err => console.error(err));
