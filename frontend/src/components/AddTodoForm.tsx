import React, { useState } from 'react';
import { Plus, AlignLeft } from 'lucide-react';

interface AddTodoFormProps {
  onAdd: (title: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setShowDescription(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="add-todo-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 mb-6 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
    >
      <div className="flex items-center gap-2">
        <input
          id="new-todo-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done? (e.g. Test PostgreSQL connection)"
          disabled={isLoading || isSubmitting}
          className="grow px-3 py-2 text-sm bg-transparent placeholder-slate-400 text-slate-900 focus:outline-hidden"
        />

        <button
          type="button"
          id="toggle-description-btn"
          onClick={() => setShowDescription(!showDescription)}
          className={`p-2 rounded-lg transition ${
            showDescription || description
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Add detailed description"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          id="submit-todo-btn"
          type="submit"
          disabled={!title.trim() || isLoading || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Todo</span>
        </button>
      </div>

      {/* Expandable Description Area */}
      {showDescription && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <textarea
            id="new-todo-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add optional notes, requirements, or steps..."
            rows={2}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>
      )}
    </form>
  );
};
