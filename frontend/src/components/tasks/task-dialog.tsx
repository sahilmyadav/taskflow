'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useTaskStore } from '@/stores/task-store';
import { useProjectStore } from '@/stores/project-store';
import type { Task } from '@/types/task';
import { getErrorMessage } from '@/lib/errors';

type TaskForm = {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  category: string;
  tags: string;
  dueDate: string;
  projectId: string;
};

function buildForm(
  task: Task | null | undefined,
  defaultStatus?: Task['status'],
  defaultProjectId?: string
): TaskForm {
  if (!task) {
    return {
      title: '',
      description: '',
      status: defaultStatus || 'TODO',
      priority: 'MEDIUM',
      category: '',
      tags: '',
      dueDate: '',
      projectId: defaultProjectId || '',
    };
  }
  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || defaultStatus || 'TODO',
    priority: task.priority || 'MEDIUM',
    category: task.category || '',
    tags: (task.tags || []).join(', '),
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    projectId: task.projectId || '',
  };
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: Task['status'];
  /** Pre-selects a project when creating a task from inside that project. */
  defaultProjectId?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  defaultProjectId,
}: TaskDialogProps) {
  const { createTask, updateTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TaskForm>(() =>
    buildForm(task, defaultStatus, defaultProjectId)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchProjects();
  }, [open, fetchProjects]);

  // Re-seed the form during render (not in an effect) whenever the dialog is
  // opened, closed, or pointed at a different task.
  const formSignature = `${open}|${task?.id ?? 'new'}|${defaultStatus ?? ''}|${defaultProjectId ?? ''}`;
  const [seededFor, setSeededFor] = useState(formSignature);
  if (seededFor !== formSignature) {
    setSeededFor(formSignature);
    setForm(buildForm(task, defaultStatus, defaultProjectId));
    setError(null);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        priority: form.priority,
        category: form.category.trim() || undefined,
        tags: form.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        projectId: form.projectId || undefined,
      };
      if (task && task.id) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload);
      }
      onOpenChange(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      // If guest hit limit, show explicit upgrade hint
      if (msg.toLowerCase().includes('guest limit') || msg.toLowerCase().includes('limit reached')) {
        setError(msg + ' Go to Login → Create account to unlock unlimited.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="sm:max-w-[520px] max-h-[90vh] overflow-auto"
      >
        <DialogHeader>
          <DialogTitle>{task && task.id ? 'Edit task' : 'New task'}</DialogTitle>
          <p className="text-sm text-zinc-500">Keep your tasks organized and track progress.</p>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Design review meeting"
              className="mt-1"
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add details…"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Task['status'] })}
                className="mt-1"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">Doing</option>
                <option value="DONE">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                className="mt-1"
              >
                <option value="NONE">No Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Work, Design…"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Project</label>
            <Select
              value={form.projectId}
              onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="mt-1"
            >
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-zinc-500">
              Attach this task to a project — visible on the Projects page.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Labels / Tags</label>
            <Input
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="Comma separated: design, urgent"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Separate with commas — shown as chips on board.
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Saving…' : task && task.id ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
