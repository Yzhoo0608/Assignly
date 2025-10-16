// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent }
];
