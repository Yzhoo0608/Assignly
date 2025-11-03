// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  CollectionReference,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, from, of, concat, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, filter, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export interface Task {
  id?: string;
  subject: string;
  deadline: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storageReady: Promise<void>;
  private tasksSubject = new BehaviorSubject<Task[]>([])
  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  constructor(private firestore: Firestore, private storage: Storage) {
    this.storageReady = this.initStorage();
    this.loadTasks();
  }

  async initStorage(): Promise<void> {
    await this.storage.create();
  }

  private loadTasks() {
    const storageReady$ = from(this.storageReady);

    const cache$ = from(this.storage.get('cachedTasks')).pipe(
      map((cached: Task[] | null) => cached ?? []),
      tap(tasks => console.log('Serving from cache', tasks)),
      map(tasks => this.sortTasks(tasks)),
      catchError(() => of([] as Task[]))
    );

    const tasksCollection = collection(this.firestore, 'tasks') as CollectionReference<Task>;

    const network$ = collectionData(tasksCollection, { idField: 'id' }).pipe(
      catchError(() => of([] as Task[])),
      filter((tasks: Task[]) => Array.isArray(tasks) && tasks.length > 0),
      tap(tasks => {
        this.tasksSubject.next(this.sortTasks(tasks));
        this.storage.set('cachedTasks', tasks).catch(e => console.error('Failed to write cache', e));
      })
    );

    storageReady$.pipe(switchMap(() => concat(cache$, network$))).subscribe();
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  async addTask(task: Task) {
    const current = this.tasksSubject.getValue();
    const updated = [...current, task];
    this.tasksSubject.next(this.sortTasks(updated));
    await this.storage.set('cachedTasks', updated);

    try {
      const tasksRef = collection(this.firestore, 'tasks') as CollectionReference<Task>;
      await addDoc(tasksRef, task);
    } catch (err) {
      console.warn('Offline add (will sync later):', err);
    }
  }

  async updateTask(task: Task) {
    const current = this.tasksSubject.getValue();
    const updated = current.map(t => (t.id === task.id ? task : t));
    this.tasksSubject.next(this.sortTasks(updated));
    await this.storage.set('cachedTasks', updated);

    try {
      const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
      await updateDoc(taskDocRef, { ...task });
    } catch (err) {
      console.warn('Offline update (will sync later):', err);
    }
  }

  async deleteTask(task: Task) {
    const current = this.tasksSubject.getValue();
    const updated = current.filter(t => t.id !== task.id);
    this.tasksSubject.next(updated);
    await this.storage.set('cachedTasks', updated);

    try {
      const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
      await deleteDoc(taskDocRef);
    } catch (err) {
      console.warn('Offline delete (will sync later):', err);
    }
  }
}

