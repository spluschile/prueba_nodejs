<script setup lang="ts">
import { computed } from 'vue';
import type { StatsSummary, DbStatusResponse } from '../types';

const props = defineProps<{
  summary: StatsSummary | null;
  dbStatus: DbStatusResponse | null;
}>();

const successRate = computed(() => {
  if (!props.summary || props.summary.TotalTests === 0) return 100;
  return Math.round((props.summary.SuccessCount / props.summary.TotalTests) * 100);
});
</script>

<template>
  <div class="metrics-grid">
    <div class="glass-panel metric-card">
      <div class="metric-icon icon-blue">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
      <div class="metric-content">
        <span class="metric-title">Pruebas en BD</span>
        <span class="metric-number">{{ summary?.TotalTests ?? 0 }}</span>
        <span class="metric-sub">Registros almacenados</span>
      </div>
    </div>

    <div class="glass-panel metric-card">
      <div class="metric-icon icon-emerald">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="metric-content">
        <span class="metric-title">Tasa de Éxito</span>
        <span class="metric-number color-emerald">{{ successRate }}%</span>
        <span class="metric-sub">{{ summary?.SuccessCount ?? 0 }} exitosas / {{ summary?.FailedCount ?? 0 }} fallidas</span>
      </div>
    </div>

    <div class="glass-panel metric-card">
      <div class="metric-icon icon-amber">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="metric-content">
        <span class="metric-title">Latencia Media</span>
        <span class="metric-number">{{ summary?.AvgLatencyMs ? Math.round(summary.AvgLatencyMs) : (dbStatus?.latencyMs ?? 0) }} ms</span>
        <span class="metric-sub">Tiempo de respuesta TDS</span>
      </div>
    </div>

    <div class="glass-panel metric-card">
      <div class="metric-icon icon-indigo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      </div>
      <div class="metric-content">
        <span class="metric-title">Motor SQL</span>
        <span class="metric-number text-truncate">SQL Server</span>
        <span class="metric-sub text-truncate">{{ dbStatus?.serverVersion || 'Detectando...' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
.icon-emerald { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.icon-amber { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
.icon-indigo { background: rgba(99, 102, 241, 0.15); color: var(--accent-indigo); }

.metric-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-title {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.metric-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.metric-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
