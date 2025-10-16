// src/app/services/task.service.ts
import { Inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

export interface Task {
  id?: string;
  subject: string;
  deadline: string;
  status: 'not started' | 'in progress' | 'completed';
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksCollection: CollectionReference;

  constructor(
    @Inject('FIRESTORE_INSTANCE') private firestore: Firestore,
    private storage: Storage
  ) {
    this.tasksCollection = collection(this.firestore, 'tasks');
    this.initStorage();
    this.testConnectionOnce(); // ✅ Only run once at startup
  }

  // ✅ 1. Initialize local Ionic Storage
  private async initStorage() {
    try {
      await this.storage.create();
    } catch (err) {
      console.error('❌ Error initializing local storage:', err);
    }
  }

  // ✅ 2. Test connection once (no permanent writes)
  private async testConnectionOnce() {
    try {
      const testSnap = await getDocs(this.tasksCollection);
      console.log(`✅ Firebase connection OK — ${testSnap.size} tasks found`);
    } catch (err) {
      console.error('❌ Firebase connection failed:', err);
    }
  }

  // ✅ 3. READ: Real-time updates with Firestore snapshot listener
  getTasks(): Observable<Task[]> {
    return new Observable<Task[]>(subscriber => {
      const unsubscribe = onSnapshot(
        this.tasksCollection,
        snapshot => {
          const tasks: Task[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as Task),
          }));
          this.storage.set('tasks', tasks); // Cache locally
          subscriber.next(tasks);
        },
        async error => {
          console.warn('⚠️ Firestore offline, loading cached data:', error);
          const cached = await this.getCachedTasks();
          subscriber.next(cached);
        }
      );

      return () => unsubscribe();
    });
  }

  // ✅ 4. Offline fallback (when Firestore is offline)
  async getCachedTasks(): Promise<Task[]> {
    try {
      return (await this.storage.get('tasks')) || [];
    } catch {
      return [];
    }
  }

  // ✅ 5. CREATE
  async addTask(task: Task): Promise<string | null> {
    if (!task.subject || !task.deadline) {
      console.warn('⚠️ Missing required task info');
      return null;
    }

    const newTask: Task = {
      subject: task.subject.trim(),
      deadline: task.deadline,
      status: task.status || 'not started',
    };

    try {
      const docRef = await addDoc(this.tasksCollection, newTask);
      console.log(`🟢 Task added: ${docRef.id}`);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error adding task:', err);
      return null;
    }
  }

  // ✅ 6. UPDATE
  async updateTaskStatus(task: Task) {
    if (!task.id) return;

    const ref = doc(this.firestore, `tasks/${task.id}`);

    try {
      await updateDoc(ref, { status: task.status });
      console.log(`✅ Updated task: ${task.subject}`);
    } catch (error) {
      console.warn('⚠️ Firestore offline — updating local cache');
      const cached = await this.getCachedTasks();
      const index = cached.findIndex(t => t.id === task.id);
      if (index !== -1) {
        cached[index].status = task.status;
        await this.storage.set('tasks', cached);
      }
    }
  }

  // ✅ 7. DELETE
  async deleteTask(task: Task) {
    if (!task.id) return;

    try {
      await deleteDoc(doc(this.firestore, `tasks/${task.id}`));
      console.log(`🗑️ Deleted task: ${task.subject}`);
    } catch (err) {
      console.error('❌ Error deleting task:', err);
    }
  }
}
