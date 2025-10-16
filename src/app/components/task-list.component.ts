// src/app/components/task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private taskService: TaskService, private fb: FormBuilder) {}

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
    this.taskForm = this.fb.group({
      subject: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['not started', Validators.required], // ✅ status field added
    });
  }

  async addTask() {
    if (this.taskForm.invalid) return;
    const newTask: Task = {
      subject: this.taskForm.value.subject,
      deadline: this.taskForm.value.deadline,
      status: this.taskForm.value.status,
    };
    await this.taskService.addTask(newTask);
    this.taskForm.reset({ status: 'not started' });
    this.isAdding = false;
  }

  async updateStatus(task: Task, event: any) {
    const newStatus = event.detail.value;
    await this.taskService.updateTaskStatus({ ...task, status: newStatus });
  }

  async deleteTask(task: Task) {
    if (confirm(`Delete task "${task.subject}"?`)) {
      await this.taskService.deleteTask(task);
    }
  }

  toggleAdd() {
    this.isAdding = !this.isAdding;
  }
}
