import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';  // Import IonicModule here
import { AppComponent } from './app.component';
import { TaskListComponent } from './components/task-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskListComponent,
    // other components
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),  // Important: import IonicModule like this
    // other modules
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
