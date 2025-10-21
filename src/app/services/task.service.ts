// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
  id?: string;
  subject: string;
  deadline: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private firestore: Firestore) {}

  // Fetch and sort tasks by date
  getTasks(): Observable<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }).pipe(
      map((tasks: any[]) =>
        tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      )
    );
  }

  addTask(task: Task) {
    const tasksRef = collection(this.firestore, 'tasks');
    return addDoc(tasksRef, task);
  }

  updateTask(task: Task) {
    const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
    return updateDoc(taskDocRef, { ...task });
  }

  deleteTask(task: Task) {
    const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
    return deleteDoc(taskDocRef);
  }
}


