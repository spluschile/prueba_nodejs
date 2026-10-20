<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type {
  DeploymentTest,
  DbStatusResponse,
  StatsSummary,
  SystemLog,
  HealthResponse,
} from './types';
import {
  fetchHealth,
  fetchDbStatus,
  fetchDeployments,
  fetchStats,
  fetchLogs,
} from './services/api';

import ConnectionCard from './components/ConnectionCard.vue';
import MetricsBar from './components/MetricsBar.vue';
import DeploymentManager from './components/DeploymentManager.vue';
import CloudGuides from './components/CloudGuides.vue';
import LogsViewer from './components/LogsViewer.vue';

const activeNavTab = ref<'dashboard' | 'guides' | 'logs'>('dashboard');

const loading = ref(false);
const dbStatus = ref<DbStatusResponse | null>(null);
const health = ref<HealthResponse | null>(null);
const deployments = ref<DeploymentTest[]>([]);
const statsSummary = ref<StatsSummary | null>(null);
const logs = ref<SystemLog[]>([]);
const globalError = ref('');

async function loadAllData() {
  loading.value = true;
  globalError.value = '';

  try {
    const [healthRes, dbRes, depRes, statsRes, logsRes] = await Promise.allSettled([
      fetchHealth(),
      fetchDbStatus(),
      fetchDeployments(),
      fetchStats(),
      fetchLogs(),
    ]);

    if (healthRes.status === 'fulfilled') health.value = healthRes.value;
    if (dbRes.status === 'fulfilled') dbStatus.value = dbRes.value;
    if (depRes.status === 'fulfilled') deployments.value = depRes.value.data;
    if (statsRes.status === 'fulfilled') statsSummary.value = statsRes.value.summary;
    if (logsRes.status === 'fulfilled') logs.value = logsRes.value.data;

    if (dbRes.status === 'rejected' && depRes.status === 'rejected') {
      globalError.value = 'No se pudo comunicar con el servidor backend API (puerto 5000). Asegúrate de que el backend esté ejecutándose con "npm run dev".';
    }
  } catch (err: any) {
    globalError.value = err.message || 'Error al sincronizar con el backend.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="app-wrapper">
    <!-- Header Principal -->
    <header class="app-header">
      <div class="header-container">
        <div class="brand-wrapper">
          <div class="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
          </div>
          <div>
            <h1 class="brand-title">CloudDeploy SQL Tester</h1>
            <div class="brand-subtitle">
              <span>Pruebas de Despliegue en la Nube</span>
              <div class="stack-tags">
                <span class="tag tag-vue">Vue 3</span>
                <span class="tag tag-ts">TypeScript</span>
                <span class="tag tag-tauri">Tauri</span>
                <span class="tag tag-sql">SQL Server</span>
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <nav class="tabs-navigation">
            <button 
              id="nav-tab-dashboard"
              class="tab-btn" 
              :class="{ active: activeNavTab === 'dashboard' }"
              @click="activeNavTab = 'dashboard'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Panel de Pruebas
            </button>

            <button 
              id="nav-tab-guides"
              class="tab-btn" 
              :class="{ active: activeNavTab === 'guides' }"
              @click="activeNavTab = 'guides'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Guías Cloud
            </button>

            <button 
              id="nav-tab-logs"
              class="tab-btn" 
              :class="{ active: activeNavTab === 'logs' }"
              @click="activeNavTab = 'logs'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              Auditoría
            </button>
          </nav>

          <button 
            id="btn-global-refresh"
            class="btn btn-secondary btn-sm" 
            :disabled="loading" 
            @click="loadAllData"
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              :class="{ 'spin-anim': loading }"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            {{ loading ? 'Actualizando...' : 'Recargar' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Notificación de error global -->
    <div v-if="globalError" class="global-alert">
      <div class="alert-content">
        <span>⚠️ {{ globalError }}</span>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main class="main-content">
      <!-- Fila Superior: Tarjeta de Conexión SQL Server -->
      <ConnectionCard 
        :db-status="dbStatus" 
        :loading="loading" 
        @refresh="loadAllData" 
      />

      <!-- Barra de Métricas y KPIs -->
      <MetricsBar 
        :summary="statsSummary" 
        :db-status="dbStatus" 
      />

      <!-- Tab: Dashboard / Gestor de Pruebas -->
      <section v-if="activeNavTab === 'dashboard'">
        <DeploymentManager 
          :deployments="deployments" 
          :loading="loading" 
          @refresh="loadAllData" 
        />
      </section>

      <!-- Tab: Guías Cloud -->
      <section v-if="activeNavTab === 'guides'">
        <CloudGuides />
      </section>

      <!-- Tab: Logs y Auditoría -->
      <section v-if="activeNavTab === 'logs'">
        <LogsViewer 
          :logs="logs" 
          :loading="loading" 
          @refresh="loadAllData" 
        />
      </section>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <span>Cloud Deploy SQL Server Tester &bull; Vue 3 + TypeScript + Tauri</span>
        <span class="node-pill">Node {{ health?.system?.nodeVersion || 'v20' }} &bull; Express API</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.global-alert {
  background: rgba(244, 63, 94, 0.15);
  border-bottom: 1px solid rgba(244, 63, 94, 0.3);
  color: #fecdd3;
  padding: 0.75rem 2rem;
  font-size: 0.85rem;
  text-align: center;
}

.alert-content {
  max-width: 1400px;
  margin: 0 auto;
}

.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-subtle);
  background: rgba(10, 14, 23, 0.95);
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.node-pill {
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
