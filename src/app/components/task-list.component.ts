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
import { Subscription } from 'rxjs';
 
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
  allTasks: Task[] = [];         // store all tasks locally
  filteredTasks: Task[] = [];    // list shown after search filter
  taskForm!: FormGroup;
  isAdding = false;
  editingTask: Task | null = null;
  minDate: string;
  searchTerm = '';              // holds user search input
 
  private tasksSub?: Subscription;
 
  @ViewChild('formContainer') formContainer!: ElementRef;
 
  constructor(private taskService: TaskService, private fb: FormBuilder) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }
 
  ngOnInit() {
    // Subscribe to observable to get live task updates
    this.tasks$ = this.taskService.tasks$;
 
    this.tasksSub = this.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      this.applyFilter(); // initialize filtered list
    });
 
    // Initialize the form
    this.taskForm = this.fb.group({
      subject: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['not started', Validators.required],
    });
  }
 
  ngOnDestroy() {
    this.tasksSub?.unsubscribe();
  }
 
  // Filter tasks based on the search input
  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTasks = [...this.allTasks];
    } else {
      this.filteredTasks = this.allTasks.filter(task =>
        task.subject.toLowerCase().includes(term) ||
        task.status.toLowerCase().includes(term)
      );
    }
  }
 
 
  // Add or update task
  async addTask() {
    if (this.taskForm.invalid) return;
 
    const formValue = this.taskForm.value;
    const task: Task = {
      subject: formValue.subject,
      deadline: formValue.deadline,
      status: formValue.status,
    };
 
    const editing = this.editingTask;
 
    this.isAdding = false;
    this.editingTask = null;
    this.taskForm.reset({ status: 'not started' });
 
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
 
  // Edit task
  editTask(task: Task) {
    this.isAdding = true;
    this.editingTask = task;
 
    this.taskForm.patchValue({
      subject: task.subject,
      deadline: task.deadline,
      status: task.status,
    });
 
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
 
  // Toggle Add and Edit section
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
 
  // Update tasks status
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
 



