<script setup lang="ts">
import type { SystemLog } from '../types';

defineProps<{
  logs: SystemLog[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
</script>

<template>
  <div class="glass-panel logs-card">
    <div class="logs-header">
      <div class="title-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <h3>Registro de Auditoría SQL Server (SystemLogs)</h3>
      </div>
      <button class="btn btn-secondary btn-sm" :disabled="loading" @click="emit('refresh')">
        Actualizar Logs
      </button>
    </div>

    <div class="logs-terminal">
      <div v-if="logs.length === 0" class="log-empty">
        No hay registros en la tabla SystemLogs aún.
      </div>

      <div v-for="log in logs" :key="log.Id" class="log-entry">
        <span class="log-time">{{ formatTime(log.CreatedAt) }}</span>
        <span class="log-badge" :class="log.EventType === 'TEST_CREATED' ? 'badge-blue' : 'badge-gray'">
          {{ log.EventType }}
        </span>
        <span class="log-msg">{{ log.Message }}</span>
        <span v-if="log.Details" class="log-details">{{ log.Details }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logs-card {
  padding: 1.5rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.logs-terminal {
  background: #050811;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1rem;
  max-height: 250px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-entry {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  line-height: 1.4;
}

.log-time {
  color: var(--text-dim);
  font-size: 0.72rem;
  flex-shrink: 0;
}

.log-badge {
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  flex-shrink: 0;
}

.badge-blue {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-cyan);
}

.badge-gray {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
}

.log-msg {
  color: var(--text-main);
  flex: 1;
}

.log-details {
  color: var(--text-dim);
  font-size: 0.72rem;
}

.log-empty {
  text-align: center;
  color: var(--text-dim);
  padding: 1rem;
}
</style>
