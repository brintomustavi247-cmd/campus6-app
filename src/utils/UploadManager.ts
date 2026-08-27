import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export type UploadState = 'selecting' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  state: UploadState;
  url?: string;
  error?: string;
  firebaseTask?: any;
}

class UniversalUploadManager {
  private static instance: UniversalUploadManager;
  private tasks: Map<string, UploadTask> = new Map();
  private listeners: Map<string, ((task: UploadTask) => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): UniversalUploadManager {
    if (!UniversalUploadManager.instance) {
      UniversalUploadManager.instance = new UniversalUploadManager();
    }
    return UniversalUploadManager.instance;
  }

  public uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void,
    onComplete?: (url: string) => void,
    onError?: (error: any) => void
  ): string {
    const taskId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    
    this.tasks.set(taskId, {
      id: taskId,
      file,
      progress: 0,
      state: 'uploading'
    });

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    this.tasks.get(taskId)!.firebaseTask = uploadTask;

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const task = this.tasks.get(taskId);
        if (task) {
          task.progress = progress;
          this.notifyListeners(taskId);
        }
        if (onProgress) onProgress(progress);
      },
      (error) => {
        const task = this.tasks.get(taskId);
        if (task) {
          task.state = 'failed';
          task.error = error.message;
          this.notifyListeners(taskId);
        }
        if (onError) onError(error);
      },
      async () => {
        const task = this.tasks.get(taskId);
        if (task) {
          task.state = 'processing';
          this.notifyListeners(taskId);
        }
        
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (task) {
            task.url = downloadURL;
            task.state = 'completed';
            this.notifyListeners(taskId);
          }
          if (onComplete) onComplete(downloadURL);
        } catch (err) {
          if (task) {
            task.state = 'failed';
            task.error = 'Failed to get download URL';
            this.notifyListeners(taskId);
          }
          if (onError) onError(err);
        }
      }
    );

    return taskId;
  }
  
  private notifyListeners(taskId: string) {
    const task = this.tasks.get(taskId);
    const callbacks = this.listeners.get(taskId);
    if (task && callbacks) {
      callbacks.forEach(cb => cb({...task}));
    }
  }
}

export const uploadManager = UniversalUploadManager.getInstance();
