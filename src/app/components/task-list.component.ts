// src/app/components/task-list.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // ✅ Added ViewChild, ElementRef
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskService, Task } from '../services/task.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})
export class TaskListComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  taskForm!: FormGroup;
  isAdding = false;
  editingTask: Task | null = null;
  minDate: string; // Minimum date (today)

  @ViewChild('formContainer') formContainer!: ElementRef;

  constructor(private taskService: TaskService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.tasks$ = this.taskService.tasks$;

    this.taskForm = this.fb.group({
      subject: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['not started', Validators.required],
    });
  }

  // Add or Update Task
  async addTask() {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;

    const task: Task = {
      subject: formValue.subject,
      deadline: formValue.deadline,
      status: formValue.status,
    };

    const editing = this.editingTask;

    // --- IMMEDIATE UI UPDATES ---
    this.isAdding = false;          // close the form instantly
    this.editingTask = null;        // reset editing task
    this.taskForm.reset({ status: 'not started' });

    // --- BACKGROUND OFFLINE/ONLINE SAVE ---
    if (editing) {
      this.taskService.updateTask({ ...editing, ...task }).catch(err =>
        console.warn('Offline update (will sync later):', err)
      );
    } else {
      this.taskService.addTask(task).catch(err =>
        console.warn('Offline add (will sync later):', err)
      );
    }
  }


  // Edit existing task + smooth scroll
  editTask(task: Task) {
    this.isAdding = true;
    this.editingTask = task;

    this.taskForm.patchValue({
      subject: task.subject,
      deadline: task.deadline,
      status: task.status,
    });

    // Smooth scroll to the form area
    setTimeout(() => {
      this.formContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }

  // Delete task
  async deleteTask(task: Task) {
    if (!confirm(`Delete task "${task.subject}"?`)) return;

    try {
      await this.taskService.deleteTask(task);
    } catch (err) {
      console.warn('Offline delete (will sync later):', err);
    }
  }

  // Toggle add/edit section
  toggleAdd() {
    this.isAdding = !this.isAdding;
    this.editingTask = null;
    this.taskForm.reset({ status: 'not started' });

    if (this.isAdding) {
      setTimeout(() => {
        this.formContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }

  // Update task status
  async updateStatus(task: Task, event: any) {
    const newStatus = event.detail.value;
    const updatedTask = { ...task, status: newStatus };

    try {
      await this.taskService.updateTask(updatedTask);
    } catch (err) {
      console.warn('Offline status update (will sync later):', err);
    }

  }
}



