'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useProjectStore } from '@/stores/project-store';
import type { Project, Priority } from '@/types/task';
import { getErrorMessage } from '@/lib/errors';

type ProjectForm = {
  title: string;
  description: string;
  priority: Priority;
  lead: string;
  dueDate: string;
};

function buildForm(project: Project | null | undefined): ProjectForm {
  if (!project) {
    return { title: '', description: '', priority: 'MEDIUM', lead: '', dueDate: '' };
  }
  return {
    title: project.title || '',
    description: project.description || '',
    priority: project.priority || 'MEDIUM',
    lead: project.lead || '',
    dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
  };
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: Project | null;
}) {
  const { createProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(() => buildForm(project));

  // Re-seed the form during render (not in an effect) whenever the dialog is
  // opened, closed, or pointed at a different project.
  const formSignature = `${open}|${project?.id ?? 'new'}`;
  const [seededFor, setSeededFor] = useState(formSignature);
  if (seededFor !== formSignature) {
    setSeededFor(formSignature);
    setForm(buildForm(project));
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
        priority: form.priority,
        lead: form.lead.trim() || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };
      if (project?.id) await updateProject(project.id, payload);
      else await createProject(payload);
      onOpenChange(false);
    } catch (err) {
      const m=getErrorMessage(err); setError(m.toLowerCase().includes('guest limit')?m+' Create an account to unlock unlimited.':m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{project?.id ? 'Edit project' : 'New project'}</DialogTitle>
          <p className="text-sm text-zinc-500">
            Projects group your tasks — like “Design Homepage”.
          </p>
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
              placeholder="e.g., Design Homepage"
              className="mt-1"
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                className="mt-1"
              >
                <option value="NONE">No Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Lead</label>
              <Input
                value={form.lead}
                onChange={e => setForm({ ...form, lead: e.target.value })}
                placeholder="Name or CN"
                className="mt-1"
              />
            </div>
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

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Saving…' : project?.id ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
