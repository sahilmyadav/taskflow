export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD';
export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ColorMode = 'Amber' | 'Blue' | 'Pink' | 'Rose' | 'Emerald' | 'Black';

export interface Subtask {
  id: string;
  title: string;
  priority: Priority;
  assignee?: string | null;
  dueDate?: string | null;
  order: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  author: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

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
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  comments?: Comment[];
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  lead?: string | null;
  dueDate?: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface TasksResponse {
  data: Task[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  onHold?: number;
  highPriority: number;
  urgent?: number;
}

export interface User {
  id: string;
  username: string;
  isGuest: boolean;
  email?: string | null;
  fullName?: string | null;
  title?: string | null;
  avatarUrl?: string | null;
  colorMode?: ColorMode | string | null;
  createdAt?: string;
  quota?: { maxTasks: number; maxProjects: number } | null;
  usage?: { tasks: number; projects: number } | null;
}

export type ViewMode = 'board' | 'list';
export type FieldsConfig = {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
  reporter: boolean;
};
