<script setup lang="ts">
import { ref } from 'vue';
import type { DbStatusResponse } from '../types';
import { getBaseUrl, setBaseUrl } from '../services/api';

defineProps<{
  dbStatus: DbStatusResponse | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const showUrlModal = ref(false);
const customUrlInput = ref(getBaseUrl());

function saveCustomUrl() {
  setBaseUrl(customUrlInput.value);
  showUrlModal.value = false;
  emit('refresh');
}

function resetUrl() {
  customUrlInput.value = '';
  setBaseUrl('');
  showUrlModal.value = false;
  emit('refresh');
}
</script>

<template>
  <div class="glass-panel connection-card">
    <div class="card-header">
      <div class="status-indicator-block">
        <div 
          class="status-light"
          :class="dbStatus?.connected ? 'status-connected' : 'status-disconnected'"
        >
          <span class="pulse-dot"></span>
        </div>
        <div>
          <h2 class="card-title">Microsoft SQL Server</h2>
          <p class="card-subtitle">
            {{ dbStatus?.connected ? 'Conexión activa TDS (Puerto 1433)' : 'Desconectado / Verificando...' }}
          </p>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          id="btn-config-url"
          class="btn btn-secondary btn-sm" 
          title="Configurar URL del servidor API Cloud o Local"
          @click="showUrlModal = true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          API Endpoint
        </button>

        <button 
          id="btn-ping-db"
          class="btn btn-primary btn-sm" 
          :disabled="loading" 
          @click="emit('refresh')"
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
          {{ loading ? 'Verificando...' : 'Test Ping TDS' }}
        </button>
      </div>
    </div>

    <!-- Detalles del Servidor -->
    <div class="specs-grid">
      <div class="spec-item">
        <span class="spec-label">Host de Base de Datos</span>
        <span class="spec-value code-font">{{ dbStatus?.config?.server || 'localhost' }}:{{ dbStatus?.config?.port || 1433 }}</span>
      </div>

      <div class="spec-item">
        <span class="spec-label">Base de Datos</span>
        <span class="spec-value">{{ dbStatus?.databaseName || dbStatus?.config?.database || 'CloudTestDb' }}</span>
      </div>

      <div class="spec-item">
        <span class="spec-label">Latencia Ping</span>
        <span class="spec-value" :class="dbStatus?.connected ? 'color-emerald' : 'color-rose'">
          {{ dbStatus ? `${dbStatus.latencyMs} ms` : '--' }}
        </span>
      </div>

      <div class="spec-item">
        <span class="spec-label">Cifrado SSL / Encrypt</span>
        <span class="spec-value">
          {{ dbStatus?.config?.encrypt ? 'Activado (TLS)' : 'Estándar (Dev)' }}
        </span>
      </div>
    </div>

    <!-- Error Banner si no conecta -->
    <div v-if="dbStatus && !dbStatus.connected" class="error-banner">
      <div class="error-icon">⚠️</div>
      <div class="error-details">
        <strong>Fallo de conexión SQL Server:</strong>
        <p>{{ dbStatus.error }}</p>
      </div>
    </div>

    <!-- Modal para Configurar URL del API -->
    <div v-if="showUrlModal" class="modal-overlay" @click.self="showUrlModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Configurar Endpoint del Backend API</h3>
          <button class="close-btn" @click="showUrlModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">
            Si has desplegado el backend en la nube (Azure App Service, Railway, Render, etc.) o estás ejecutando la aplicación de escritorio Tauri, ingresa la URL pública aquí:
          </p>
          <label class="form-label" for="input-api-url">URL Base de la API:</label>
          <input 
            id="input-api-url"
            v-model="customUrlInput" 
            type="text" 
            class="form-input" 
            placeholder="Ejemplo: https://mi-app-cloud.azurewebsites.net"
          />
          <span class="hint-text">Dejar en blanco para usar la ruta por defecto (localhost:5000 / proxy relativo).</span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="resetUrl">Restablecer a Localhost</button>
          <button class="btn btn-primary" @click="saveCustomUrl">Guardar y Conectar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connection-card {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.status-indicator-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-light {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-connected {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-disconnected {
  background: rgba(244, 63, 94, 0.15);
  color: var(--accent-rose);
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.6rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.spec-label {
  font-size: 0.72rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.spec-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.code-font {
  font-family: var(--font-mono);
}

.color-emerald { color: var(--accent-emerald); }
.color-rose { color: var(--accent-rose); }

.error-banner {
  margin-top: 1rem;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.error-icon {
  font-size: 1.25rem;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.hint-text {
  display: block;
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 0.4rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
