const API_BASE_URL = 'https://taskmanagermobile.onrender.com/api';

export interface User {
  id: string;
  email: string;
  // add other user fields as needed
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  notifications?: Array<{
    type: '1-day-before' | '1-hour-before' | 'on-due' | 'custom';
    time?: string; // ISO string for custom
  }>;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed: ${errorText}`);
  }

  return res.json();
}


export async function fetchTasks(token: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch tasks');
  }
  return res.json();
}

export async function updateTask(token: string, taskId: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update task');
  }
  return res.json();
}
