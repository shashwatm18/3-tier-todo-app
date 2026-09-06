import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  ListTodo,
  Sparkles,
  Layers,
  Database,
  Server,
  Code2,
} from 'lucide-react';
import { Todo, FilterStatus, BackendHealth } from './types';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  checkBackendHealth,
  setApiBaseUrl,
  getApiBaseUrl,
  resetLocalSeed,
} from './services/api';
import { TodoItem } from './components/TodoItem';
import { AddTodoForm } from './components/AddTodoForm';
import { ConnectionBanner } from './components/ConnectionBanner';
import { BackendGuideModal } from './components/BackendGuideModal';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [backendHealth, setBackendHealth] = useState<BackendHealth>({
    status: 'checking',
    endpoint: getApiBaseUrl(),
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Check backend health
  const refreshHealth = useCallback(async () => {
    setBackendHealth((prev) => ({ ...prev, status: 'checking' }));
    const health = await checkBackendHealth();
    setBackendHealth(health);
  }, []);

  // Load todos
  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchTodos();
      setTodos(result.todos);
      // Also update health status based on whether live backend responded
      if (result.isLiveBackend) {
        setBackendHealth((prev) => ({ ...prev, status: 'healthy' }));
      }
    } catch (err) {
      console.error('Error loading todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    loadTodos();
  }, [refreshHealth, loadTodos]);

  // Handle Add Todo
  const handleAddTodo = async (title: string, description?: string) => {
    try {
      const { todo, isLiveBackend } = await createTodo({ title, description });
      setTodos((prev) => [todo, ...prev]);
      showToast(
        isLiveBackend
          ? 'Todo saved to PostgreSQL database.'
          : 'Todo added (preview mode).',
      );
    } catch (err) {
      console.error('Failed to create todo:', err);
      showToast('Failed to add todo.');
    }
  };

  // Handle Toggle Complete
  const handleToggleComplete = async (todo: Todo) => {
    const nextCompleted = !todo.completed;
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: nextCompleted } : t)),
    );

    try {
      await updateTodo(todo.id, { completed: nextCompleted });
    } catch (err) {
      console.error('Failed to update completion status:', err);
      // Rollback
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: todo.completed } : t)),
      );
      showToast('Failed to update todo status.');
    }
  };

  // Handle Update Title/Description
  const handleUpdateTodo = async (id: number, title: string, description?: string) => {
    try {
      const { todo } = await updateTodo(id, { title, description });
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
      showToast('Todo updated.');
    } catch (err) {
      console.error('Failed to update todo:', err);
      showToast('Failed to update todo.');
    }
  };

  // Handle Delete Todo
  const handleDeleteTodo = async (id: number) => {
    const todoToDelete = todos.find((t) => t.id === id);
    // Optimistic delete
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodo(id);
      showToast('Todo deleted.');
    } catch (err) {
      console.error('Failed to delete todo:', err);
      if (todoToDelete) {
        setTodos((prev) => [...prev, todoToDelete]);
      }
      showToast('Failed to delete todo.');
    }
  };

  // Update backend base URL
  const handleUpdateBaseUrl = (newUrl: string) => {
    setApiBaseUrl(newUrl);
    setBackendHealth({ status: 'checking', endpoint: newUrl });
    setTimeout(() => {
      refreshHealth();
      loadTodos();
    }, 200);
  };

  // Reset sample seed data
  const handleResetSeed = () => {
    resetLocalSeed();
    loadTodos();
    showToast('Reset sample dummy todos.');
  };

  // Filter & Search Todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Filter by status
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = todo.description && todo.description.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [todos, filter, searchQuery]);

  // Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-800 animate-fade-in flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Branding */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <CheckSquare className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  3-Tier Todo Application
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" /> React + Vite
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    <Server className="w-3.5 h-3.5 text-emerald-500" /> Python FastAPI
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    <Database className="w-3.5 h-3.5 text-blue-500" /> PostgreSQL
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                id="header-guide-btn"
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Architecture & Setup</span>
              </button>
            </div>
          </div>
        </header>

        {/* Connection & Status Banner */}
        <ConnectionBanner
          health={backendHealth}
          onRefreshHealth={() => {
            refreshHealth();
            loadTodos();
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onUpdateBaseUrl={handleUpdateBaseUrl}
          onResetSeed={handleResetSeed}
        />

        {/* Progress & Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 mb-6">
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="text-slate-600">Task Completion Progress</span>
            <span className="text-slate-900 font-semibold">
              {completedCount} of {totalCount} done ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Add Todo Form */}
        <AddTodoForm onAdd={handleAddTodo} isLoading={isLoading} />

        {/* Controls: Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Search Box */}
          <div className="relative grow max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-todos-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shrink-0 text-xs">
            <button
              id="filter-all-btn"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              id="filter-active-btn"
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'active'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              id="filter-completed-btn"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Todo List Items */}
        <main className="space-y-2.5">
          {isLoading && todos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-3"></div>
              <p>Loading tasks...</p>
            </div>
          ) : filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onUpdate={handleUpdateTodo}
              />
            ))
          ) : (
            <div
              id="empty-todos-placeholder"
              className="py-12 px-6 bg-white rounded-xl border border-dashed border-slate-300 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                {searchQuery ? <Filter className="w-5 h-5" /> : <ListTodo className="w-5 h-5" />}
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                {searchQuery ? 'No matching tasks found' : 'No tasks in this view'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No todos match your search term "${searchQuery}".`
                  : filter === 'completed'
                  ? 'You have not completed any tasks yet.'
                  : 'All caught up! Add a new task above or load the dummy seed dataset.'}
              </p>
              {!searchQuery && (
                <button
                  id="empty-seed-btn"
                  onClick={handleResetSeed}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Seed Tasks</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white/70 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          3-Tier Architecture: React/Vite (Frontend) → REST JSON → FastAPI (Backend) → SQLAlchemy → PostgreSQL
        </p>
      </footer>

      {/* Local Backend Guide Modal */}
      <BackendGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        apiBaseUrl={backendHealth.endpoint}
      />
    </div>
  );
}
