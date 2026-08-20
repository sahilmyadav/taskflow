export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  category?: string | null;
  tags: string[];
  dueDate?: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface TasksResponse { data: Task[]; meta: { total: number; page: number; limit: number; totalPages: number }; }
export interface Stats { total: number; todo: number; inProgress: number; done: number; highPriority: number; }
export interface User { id: string; username: string; isGuest: boolean; }
