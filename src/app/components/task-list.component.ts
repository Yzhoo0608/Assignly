// src/app/components/task-list.component.ts
// Updated Cache and Offline Functionality in Task List Component
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; 
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

// Task List Component
@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})

// TaskListComponent class
export class TaskListComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  taskForm!: FormGroup;
  isAdding = false;
  editingTask: Task | null = null;
  minDate: string; // Minimum date (today)

  @ViewChild('formContainer') formContainer!: ElementRef;

  // Constructor with TaskService and FormBuilder injection
  constructor(private taskService: TaskService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Subscribe to tasks observable
    this.tasks$ = this.taskService.tasks$;

    // Initialize the task form
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

    const editing = this.editingTask; // Capture current editing task

    // Reset form and UI state immediately
    this.isAdding = false;          
    this.editingTask = null;        
    this.taskForm.reset({ status: 'not started' });

    // Background operation to add or update task
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

    // Patch form values with selected task
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

    // Smooth scroll to form when opening
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



