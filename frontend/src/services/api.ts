import type {
  DeploymentTest,
  DbStatusResponse,
  HealthResponse,
  StatsResponse,
  SystemLog,
} from '../types';

const STORAGE_KEY = 'cloud_deploy_api_url';

export function getBaseUrl(): string {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved.trim() !== '') {
    return saved.trim().replace(/\/$/, '');
  }
  // En modo desarrollo o producción por defecto, usa el proxy relativo /api o localhost:5000
  return '';
}

export function setBaseUrl(url: string): void {
  if (!url || url.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/$/, ''));
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getBaseUrl();
  const url = base ? `${base}/api${endpoint}` : `/api${endpoint}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.message) errorMsg = errorJson.message;
      else if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function fetchDbStatus(): Promise<DbStatusResponse> {
  return request<DbStatusResponse>('/db/status');
}

export async function fetchDeployments(): Promise<{ success: boolean; data: DeploymentTest[]; total: number }> {
  return request<{ success: boolean; data: DeploymentTest[]; total: number }>('/deployments');
}

export async function createDeployment(payload: {
  title: string;
  environment: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  responseTimeMs: number;
  notes?: string;
  testedBy?: string;
}): Promise<{ success: boolean; message: string; data: DeploymentTest }> {
  return request<{ success: boolean; message: string; data: DeploymentTest }>('/deployments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteDeployment(id: number): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/deployments/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchStats(): Promise<StatsResponse> {
  return request<StatsResponse>('/deployments/stats');
}

export async function fetchLogs(): Promise<{ success: boolean; data: SystemLog[] }> {
  return request<{ success: boolean; data: SystemLog[] }>('/logs');
}
