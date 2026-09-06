export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string | null;
  completed?: boolean;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export type FilterStatus = 'all' | 'active' | 'completed';

export interface BackendHealth {
  status: 'healthy' | 'offline' | 'checking';
  app?: string;
  version?: string;
  endpoint: string;
  latencyMs?: number;
  error?: string;
}
