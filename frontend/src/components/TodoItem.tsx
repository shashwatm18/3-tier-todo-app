import React, { useState } from 'react';
import { Check, Trash2, Edit2, Clock, X, Save } from 'lucide-react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, description?: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, editTitle.trim(), editDesc.trim() || undefined);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formattedDate = new Date(todo.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`todo-item-${todo.id}`}
      className={`group relative p-4 rounded-xl border transition-all duration-150 ${
        todo.completed
          ? 'bg-slate-50/70 border-slate-200/80 text-slate-500'
          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm text-slate-800'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3" onKeyDown={handleKeyDown}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 resize-none"
            />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim()}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3.5">
          {/* Custom Checkbox */}
          <button
            id={`toggle-todo-${todo.id}`}
            onClick={() => onToggleComplete(todo)}
            aria-label={todo.completed ? 'Mark uncompleted' : 'Mark completed'}
            className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              todo.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/30'
            }`}
          >
            {todo.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          {/* Content */}
          <div className="grow min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                onClick={() => onToggleComplete(todo)}
                className={`text-sm font-medium leading-snug cursor-pointer select-none transition ${
                  todo.completed
                    ? 'line-through text-slate-400'
                    : 'text-slate-900 group-hover:text-indigo-950'
                }`}
              >
                {todo.title}
              </h3>

              {/* Action Buttons (visible on hover or focus) */}
              <div className="shrink-0 flex items-center space-x-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  id={`edit-todo-${todo.id}`}
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`delete-todo-${todo.id}`}
                  onClick={() => {
                    if (isDeleting) {
                      onDelete(todo.id);
                    } else {
                      setIsDeleting(true);
                      setTimeout(() => setIsDeleting(false), 3000);
                    }
                  }}
                  className={`p-1 rounded-md transition ${
                    isDeleting
                      ? 'bg-rose-100 text-rose-700 font-medium text-[10px] px-1.5'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={isDeleting ? 'Click again to confirm delete' : 'Delete task'}
                >
                  {isDeleting ? (
                    'Confirm?'
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {todo.description && (
              <p
                className={`mt-1 text-xs leading-relaxed ${
                  todo.completed ? 'text-slate-400 line-through' : 'text-slate-600'
                }`}
              >
                {todo.description}
              </p>
            )}

            <div className="mt-2.5 flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formattedDate}</span>
              </span>
              <span className="font-mono text-[10px] px-1 py-0.2 bg-slate-100 rounded text-slate-500">
                #{todo.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
