import { Todo, TodoCreate, TodoUpdate, BackendHealth } from '../types';

const DEFAULT_API_BASE = '/api';
const STORAGE_KEY_BASE = 'todo_app_api_url';
const STORAGE_KEY_OFFLINE_TODOS = 'todo_app_local_preview_todos';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_BASE);
    if (saved) return saved;
  }
  return DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_BASE, url.trim().replace(/\/$/, ''));
  }
}

// 12 realistic seed items matching backend/seed.py
export const INITIAL_SEED_TODOS: Todo[] = [
  {
    id: 1,
    title: 'Set up local PostgreSQL database',
    description: "Install PostgreSQL locally and create the database named 'todo_db' using psql or createdb.",
    completed: true,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 2,
    title: 'Configure environment variables (.env)',
    description: 'Copy .env.example to .env and verify database connection credentials and port settings.',
    completed: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 3,
    title: 'Run seed script to populate sample tasks',
    description: 'Execute python seed.py to create tables and insert initial dummy items.',
    completed: true,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 4,
    title: 'Start FastAPI backend server',
    description: 'Run uvicorn app.main:app --reload --port 8000 to launch the REST API server locally.',
    completed: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 5,
    title: 'Explore interactive Swagger API documentation',
    description: 'Navigate to http://localhost:8000/docs in your browser to test endpoints interactively.',
    completed: false,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 6,
    title: 'Launch React + Vite frontend client',
    description: 'Run npm run dev to start the React UI on http://localhost:3000.',
    completed: false,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 7,
    title: 'Test adding a new custom todo',
    description: 'Use the frontend input field to create a new task and verify it persists in PostgreSQL.',
    completed: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 8,
    title: 'Test toggle completion status',
    description: 'Click the checkmark checkbox to toggle task completed state via PUT /todos/{id}.',
    completed: false,
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 9,
    title: 'Filter todos by active and completed states',
    description: 'Switch between All, Active, and Completed view tabs to verify filtering logic.',
    completed: false,
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 10,
    title: 'Test search bar filtering functionality',
    description: 'Type keywords in the search box to filter tasks by title or description in real-time.',
    completed: false,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 11,
    title: 'Review SQLAlchemy model and Pydantic schemas',
    description: 'Inspect app/models.py and app/schemas.py to understand ORM mapping and validation rules.',
    completed: false,
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 12,
    title: 'Perform API test using curl commands',
    description: 'Run curl -X GET http://localhost:8000/todos from the terminal to inspect JSON responses.',
    completed: false,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
];

// Helper for local mock storage
function getLocalMockTodos(): Todo[] {
  if (typeof window === 'undefined') return INITIAL_SEED_TODOS;
  const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_TODOS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_OFFLINE_TODOS, JSON.stringify(INITIAL_SEED_TODOS));
    return INITIAL_SEED_TODOS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEED_TODOS;
  }
}

function saveLocalMockTodos(todos: Todo[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_OFFLINE_TODOS, JSON.stringify(todos));
  }
}

export async function checkBackendHealth(customBaseUrl?: string): Promise<BackendHealth> {
  const baseUrl = customBaseUrl || getApiBaseUrl();
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      return {
        status: 'healthy',
        app: data.app || '3-Tier Todo API',
        version: data.version || '1.0.0',
        endpoint: baseUrl,
        latencyMs,
      };
    } else {
      return {
        status: 'offline',
        endpoint: baseUrl,
        error: `HTTP ${res.status} ${res.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      status: 'offline',
      endpoint: baseUrl,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend not reachable',
    };
  }
}

/**
 * Fetch all todos from the FastAPI backend.
 * Falls back to local storage if the backend is unreachable.
 */
export async function fetchTodos(options?: {
  completed?: boolean;
  search?: string;
}): Promise<{ todos: Todo[]; isLiveBackend: boolean }> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();

  if (options?.completed !== undefined) {
    params.append('completed', String(options.completed));
  }
  if (options?.search) {
    params.append('search', options.search);
  }

  const queryStr = params.toString() ? `?${params.toString()}` : '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${baseUrl}/todos${queryStr}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: Todo[] = await res.json();
      return { todos: data, isLiveBackend: true };
    }
  } catch (err) {
    // Backend unreachable - fallback to local storage
  }

  // Fallback to local storage for seamless preview
  let localTodos = getLocalMockTodos();
  if (options?.completed !== undefined) {
    localTodos = localTodos.filter((t) => t.completed === options.completed);
  }
  if (options?.search) {
    const term = options.search.toLowerCase();
    localTodos = localTodos.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)),
    );
  }
  return { todos: localTodos, isLiveBackend: false };
}

/**
 * Create a new todo item.
 */
export async function createTodo(data: TodoCreate): Promise<{ todo: Todo; isLiveBackend: boolean }> {
  const baseUrl = getApiBaseUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const created: Todo = await res.json();
      return { todo: created, isLiveBackend: true };
    }
  } catch (err) {
    // Fallback
  }

  // Fallback local storage
  const localTodos = getLocalMockTodos();
  const newTodo: Todo = {
    id: localTodos.length > 0 ? Math.max(...localTodos.map((t) => t.id)) + 1 : 1,
    title: data.title.trim(),
    description: data.description ? data.description.trim() : null,
    completed: Boolean(data.completed),
    created_at: new Date().toISOString(),
  };
  localTodos.unshift(newTodo);
  saveLocalMockTodos(localTodos);
  return { todo: newTodo, isLiveBackend: false };
}

/**
 * Update an existing todo item.
 */
export async function updateTodo(
  id: number,
  data: TodoUpdate,
): Promise<{ todo: Todo; isLiveBackend: boolean }> {
  const baseUrl = getApiBaseUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const updated: Todo = await res.json();
      return { todo: updated, isLiveBackend: true };
    }
  } catch (err) {
    // Fallback
  }

  // Fallback local storage
  const localTodos = getLocalMockTodos();
  const index = localTodos.findIndex((t) => t.id === id);
  if (index !== -1) {
    const existing = localTodos[index];
    const updated: Todo = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      completed: data.completed !== undefined ? data.completed : existing.completed,
    };
    localTodos[index] = updated;
    saveLocalMockTodos(localTodos);
    return { todo: updated, isLiveBackend: false };
  }

  throw new Error(`Todo with ID ${id} not found`);
}

/**
 * Delete a todo item.
 */
export async function deleteTodo(id: number): Promise<{ success: boolean; isLiveBackend: boolean }> {
  const baseUrl = getApiBaseUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/todos/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return { success: true, isLiveBackend: true };
    }
  } catch (err) {
    // Fallback
  }

  // Fallback local storage
  const localTodos = getLocalMockTodos();
  const filtered = localTodos.filter((t) => t.id !== id);
  saveLocalMockTodos(filtered);
  return { success: true, isLiveBackend: false };
}

/**
 * Reset local preview storage with fresh seed data
 */
export function resetLocalSeed(): void {
  saveLocalMockTodos(INITIAL_SEED_TODOS);
}
