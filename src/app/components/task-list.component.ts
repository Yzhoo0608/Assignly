// src/app/components/task-list.component.ts
import { Component, OnInit } from '@angular/core';
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
  editingTask: Task | null = null; // Track task being edited

  constructor(private taskService: TaskService, private fb: FormBuilder) {}

  ngOnInit() {
    // Load tasks from TaskService
    this.tasks$ = this.taskService.getTasks();

    // Initialize form
    this.taskForm = this.fb.group({
      subject: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['not started', Validators.required],
    });
  }

  // Add or Update a task
  async addTask() {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;

    if (this.editingTask) {
      // 🔹 Update existing task
      const updatedTask: Task = {
        ...this.editingTask,
        subject: formValue.subject,
        deadline: formValue.deadline,
        status: formValue.status,
      };

      await this.taskService.updateTask(updatedTask);
      this.editingTask = null;
    } else {
      // 🔹 Add new task
      const newTask: Task = {
        subject: formValue.subject,
        deadline: formValue.deadline,
        status: formValue.status,
      };

      await this.taskService.addTask(newTask);
    }

    // Reset form and close add section
    this.taskForm.reset({ status: 'not started' });
    this.isAdding = false;
  }

  // Edit existing task
  editTask(task: Task) {
    this.isAdding = true; // show the add/edit form
    this.editingTask = task;

    this.taskForm.patchValue({
      subject: task.subject,
      deadline: task.deadline,
      status: task.status,
    });
  }

  // Delete task
  async deleteTask(task: Task) {
    if (confirm(`Delete task "${task.subject}"?`)) {
      await this.taskService.deleteTask(task);
    }
  }

  // Toggle form open/close
  toggleAdd() {
    this.isAdding = !this.isAdding;
    this.editingTask = null;
    this.taskForm.reset({ status: 'not started' });
  }

  // Update status from dropdown
  async updateStatus(task: Task, event: any) {
    const newStatus = event.detail.value;
    const updatedTask = { ...task, status: newStatus };
    await this.taskService.updateTask(updatedTask);
  }
}


