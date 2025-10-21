// src/app/home/home.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from '../components/task-list.component'; // adjust path if needed

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule, TaskListComponent],
})
export class HomePage {
  // no need to redefine toggleAdd() here — handled inside TaskListComponent
}




