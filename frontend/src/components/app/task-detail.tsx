'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreHorizontal, Send, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { Task, Subtask, Comment, Priority } from '@/types/task';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

const priorities: Priority[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE', 'ON_HOLD'];
const statusLabel: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'Doing',
  DONE: 'Completed',
  ON_HOLD: 'On Hold',
};

export function TaskDetail({
  task,
  open,
  onClose,
  onUpdated,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (t: Task) => void;
}) {
  const [draft, setDraft] = useState<Task | null>(task);
  const [saving, setSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newSub, setNewSub] = useState('');
  const [newComment, setNewComment] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  // Figma: calendar shows picked day; default to task dueDate or today
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);

  // Seed the panel from the incoming task during render; switching to a
  // different task resets the draft and its relations.
  const taskSignature = task?.id ?? '';
  const [seededFor, setSeededFor] = useState(taskSignature);
  if (seededFor !== taskSignature) {
    setSeededFor(taskSignature);
    setDraft(task);
    setSubtasks(task?.subtasks || []);
    setComments(task?.comments || []);
    setCalendarDate(task?.dueDate ? new Date(task.dueDate) : null);
  }

  // Then hydrate with the full record (subtasks/comments) from the API.
  useEffect(() => {
    if (!task) return;
    let cancelled = false;
    api
      .get<Task>(`/tasks/${task.id}`)
      .then(r => {
        if (cancelled) return;
        setDraft(r.data);
        setSubtasks(r.data.subtasks || []);
        setComments(r.data.comments || []);
        setCalendarDate(r.data.dueDate ? new Date(r.data.dueDate) : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [task]);

  if (!open || !draft) return null;

  const save = async (patch: Partial<Task>) => {
    if (!draft) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/tasks/${draft.id}`, patch);
      setDraft(data);
      onUpdated(data);
    } finally {
      setSaving(false);
    }
  };

  const addSubtask = async () => {
    if (!newSub.trim() || !draft) return;
    const { data } = await api.post(`/tasks/${draft.id}/subtasks`, { title: newSub.trim() });
    setSubtasks(s => [...s, data]);
    setNewSub('');
  };

  const removeSubtask = async (id: string) => {
    if (!draft) return;
    await api.delete(`/tasks/${draft.id}/subtasks/${id}`);
    setSubtasks(s => s.filter(x => x.id !== id));
  };

  const addComment = async () => {
    if (!newComment.trim() || !draft) return;
    const author = JSON.parse(localStorage.getItem('user') || '{}')?.username || 'You';
    const { data } = await api.post(`/tasks/${draft.id}/comments`, {
      body: newComment.trim(),
      author,
    });
    setComments(c => [...c, data]);
    setNewComment('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[980px] flex-col bg-white shadow-2xl dark:bg-zinc-950 sm:rounded-l-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  ● Backlog
                </span>
                <span className="text-xs text-zinc-400">
                  {saving ? 'Saving…' : 'All changes saved'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
              {/* main */}
              <div className="flex-1 overflow-auto p-6">
                <input
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                  onBlur={() => draft.title !== task?.title && save({ title: draft.title })}
                  className="w-full bg-transparent text-xl font-semibold outline-none"
                  placeholder="Task title"
                />
                <textarea
                  value={draft.description || ''}
                  onChange={e => setDraft({ ...draft, description: e.target.value })}
                  onBlur={() =>
                    draft.description !== task?.description &&
                    save({ description: draft.description })
                  }
                  placeholder="Create clear and detailed API documentation to guide developers…"
                  className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-600 outline-none dark:text-zinc-400"
                  rows={3}
                />

                {/* properties inline */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
                    Designer
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-950/30">
                    {draft.dueDate ? format(new Date(draft.dueDate), 'dd MMM') : '31 Jul'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(draft.tags || []).map(t => (
                    <span
                      key={t}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800"
                    >
                      {t}
                    </span>
                  ))}
                  {draft.category && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800">
                      {draft.category}
                    </span>
                  )}
                </div>

                {/* subtasks */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Subtasks</h3>
                    <span className="text-xs text-zinc-400">{subtasks.length} items</span>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="grid grid-cols-12 gap-2 bg-zinc-50 px-3 py-2 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900">
                      <div className="col-span-5">Task</div>
                      <div className="col-span-2">Priority</div>
                      <div className="col-span-2">Members</div>
                      <div className="col-span-2">Due Date</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {subtasks.map(s => (
                      <div
                        key={s.id}
                        className="grid grid-cols-12 items-center gap-2 border-t border-zinc-100 px-3 py-2.5 text-sm dark:border-zinc-800"
                      >
                        <div className="col-span-5 truncate">{s.title}</div>
                        <div className="col-span-2 text-xs">
                          <span
                            className={cn(
                              s.priority === 'HIGH'
                                ? 'text-red-600'
                                : s.priority === 'MEDIUM'
                                  ? 'text-amber-600'
                                  : 'text-zinc-500'
                            )}
                          >
                            {s.priority}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <Avatar
                            src={`https://i.pravatar.cc/100?u=${s.assignee || 'x'}`}
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="col-span-2 text-xs text-zinc-600">
                          {s.dueDate ? format(new Date(s.dueDate), 'dd MMM yyyy') : '—'}
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <button
                            onClick={() => removeSubtask(s.id)}
                            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 border-t border-zinc-100 p-2 dark:border-zinc-800">
                      <Input
                        value={newSub}
                        onChange={e => setNewSub(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSubtask()}
                        placeholder="Add subtask…"
                        className="h-8 flex-1"
                      />
                      <Button size="sm" onClick={addSubtask} className="h-8">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* comments */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold">Updates</h3>
                  <div className="mt-3 space-y-3">
                    {comments.map(c => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={`https://i.pravatar.cc/100?u=${c.author}`}
                            className="h-6 w-6"
                          />
                          <span className="text-xs font-medium">{c.author}</span>
                          <span className="text-xs text-zinc-400">
                            {format(new Date(c.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-xs text-zinc-400">
                        No updates yet — be the first to comment.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addComment()}
                      placeholder="Add a comment…"
                      className="flex-1"
                    />
                    <Button onClick={addComment} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* details sidebar */}
              <div className="w-full border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:w-[320px] lg:border-l lg:border-t-0">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold">Details</h4>
                    <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                  </div>

                  <div className="mt-3 space-y-3 text-xs">
                    <div className="relative flex items-center justify-between">
                      <span className="text-zinc-500">Status</span>
                      <button
                        onClick={() => setStatusOpen(v => !v)}
                        className="flex min-w-[120px] items-center justify-between gap-2 rounded-full border border-zinc-200 bg-white pl-3 pr-1.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                      >
                        <span className="truncate">{statusLabel[draft.status]}</span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-white dark:text-zinc-900">
                          ▾
                        </span>
                      </button>
                      {statusOpen && (
                        <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                          {statuses.map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                setStatusOpen(false);
                                setDraft({ ...draft, status: s });
                                save({ status: s });
                              }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800',
                                draft.status === s &&
                                  'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                              )}
                            >
                              <span>{statusLabel[s]}</span>
                              {draft.status === s && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative flex items-center justify-between">
                      <span className="text-zinc-500">Priority</span>
                      <button
                        onClick={() => setPriorityOpen(v => !v)}
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800"
                      >
                        {draft.priority}
                      </button>
                      {priorityOpen && (
                        <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                          {priorities.map(p => (
                            <button
                              key={p}
                              onClick={() => {
                                setPriorityOpen(false);
                                setDraft({ ...draft, priority: p });
                                save({ priority: p });
                              }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800',
                                draft.priority === p &&
                                  'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                              )}
                            >
                              <span>{p}</span>
                              {draft.priority === p && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Members</span>
                      <button className="text-xs font-medium">Add members</button>
                    </div>

                    <div className="relative flex items-center justify-between">
                      <span className="text-zinc-500">Dates</span>
                      <button
                        onClick={() => setDateOpen(v => !v)}
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800"
                      >
                        {draft.dueDate ? format(new Date(draft.dueDate), 'MMM d') : 'Set date'}
                      </button>
                      {dateOpen && (
                        <div className="absolute right-0 top-8 z-20 w-[280px] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                          <MiniCalendar
                            value={calendarDate}
                            onChange={d => {
                              setCalendarDate(d);
                              const iso = d ? new Date(d).toISOString() : null;
                              setDraft({ ...draft, dueDate: iso });
                              setDateOpen(false);
                              save({ dueDate: iso });
                            }}
                          />
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => {
                                setCalendarDate(null);
                                setDraft({ ...draft, dueDate: null });
                                setDateOpen(false);
                                save({ dueDate: null });
                              }}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => setDateOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Labels</span>
                      <span className="text-xs">{draft.category || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <h4 className="text-xs font-semibold">Activity</h4>
                  <div className="mt-2 space-y-2">
                    {comments.length > 0 ? (
                      comments.slice(-2).map(c => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar
                            src={`https://i.pravatar.cc/100?u=${c.author}`}
                            className="mt-0.5 h-5 w-5"
                          />
                          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                            <span className="font-medium text-zinc-900 dark:text-white">
                              {c.author}
                            </span>{' '}
                            posted an update • {format(new Date(c.createdAt), 'MMM yyyy')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No activity yet</p>
                    )}
                    {draft.updatedAt !== draft.createdAt && (
                      <p className="text-xs text-zinc-500">
                        You updated this task • {format(new Date(draft.updatedAt), 'MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniCalendar({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  const base = value ? new Date(value) : new Date();
  const [cursor, setCursor] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();
  const isToday = (d: number) =>
    today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  const isSelected = (d: number) =>
    value && value.getDate() === d && value.getMonth() === month && value.getFullYear() === year;
  const monthName = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ‹
        </button>
        <span className="text-xs font-semibold">{monthName}</span>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ›
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} className="py-1 font-medium">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={d === null}
            onClick={() => d !== null && onChange(new Date(year, month, d))}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${d === null ? 'invisible' : isSelected(d!) ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : isToday(d!) ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
