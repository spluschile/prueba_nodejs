<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DeploymentTest } from '../types';
import { createDeployment, deleteDeployment } from '../services/api';

const props = defineProps<{
  deployments: DeploymentTest[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// Filtros
const searchQuery = ref('');
const selectedEnv = ref('ALL');

// Modal de Creación
const showModal = ref(false);
const submitting = ref(false);
const errorMsg = ref('');

const newTest = ref({
  title: '',
  environment: 'Azure App Service',
  status: 'SUCCESS' as 'SUCCESS' | 'FAILED' | 'WARNING',
  responseTimeMs: 35,
  notes: '',
  testedBy: 'DevOps Cloud Tester',
});

const environments = [
  'Azure App Service',
  'AWS RDS / Elastic Beanstalk',
  'Render.com',
  'Railway.app',
  'Local Docker Compose',
  'Tauri Desktop Client',
  'Localhost',
];

const filteredDeployments = computed(() => {
  return props.deployments.filter(item => {
    const matchesEnv = selectedEnv.value === 'ALL' || item.Environment === selectedEnv.value;
    const query = searchQuery.value.toLowerCase().trim();
    const matchesQuery = !query || 
      item.Title.toLowerCase().includes(query) ||
      (item.Notes && item.Notes.toLowerCase().includes(query)) ||
      item.TestedBy.toLowerCase().includes(query);
    return matchesEnv && matchesQuery;
  });
});

async function handleCreateTest() {
  if (!newTest.value.title.trim()) {
    errorMsg.value = 'El título de la prueba es requerido.';
    return;
  }

  submitting.value = true;
  errorMsg.value = '';

  try {
    await createDeployment({
      title: newTest.value.title.trim(),
      environment: newTest.value.environment,
      status: newTest.value.status,
      responseTimeMs: Number(newTest.value.responseTimeMs) || 10,
      notes: newTest.value.notes.trim() || undefined,
      testedBy: newTest.value.testedBy.trim() || 'Cloud Tester',
    });

    // Resetear formulario
    newTest.value.title = '';
    newTest.value.notes = '';
    showModal.value = false;
    emit('refresh');
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al guardar la prueba.';
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  if (!confirm(`¿Eliminar la prueba de despliegue #${id}?`)) return;

  try {
    await deleteDeployment(id);
    emit('refresh');
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
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
  <div class="glass-panel deployment-section">
    <!-- Header de la Sección -->
    <div class="section-top">
      <div>
        <h2 class="section-title">Pruebas de Despliegue en SQL Server</h2>
        <p class="section-desc">
          Registros en tiempo real guardados en la tabla <code class="inline-code">DeploymentTests</code> de SQL Server.
        </p>
      </div>

      <button id="btn-nueva-prueba" class="btn btn-primary" @click="showModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nueva Prueba Cloud
      </button>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="filters-bar">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          id="search-tests-input"
          v-model="searchQuery" 
          type="text" 
          class="form-input search-input" 
          placeholder="Buscar por título, notas o tester..." 
        />
      </div>

      <div class="select-box">
        <select id="select-env-filter" v-model="selectedEnv" class="form-select">
          <option value="ALL">Todos los entornos</option>
          <option v-for="env in environments" :key="env" :value="env">{{ env }}</option>
        </select>
      </div>
    </div>

    <!-- Tabla de Registros -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px;">ID</th>
            <th>Prueba / Validación</th>
            <th>Entorno Cloud</th>
            <th style="width: 120px;">Estado</th>
            <th style="width: 110px;">Latencia</th>
            <th>Probado Por</th>
            <th style="width: 150px;">Fecha</th>
            <th style="width: 70px; text-align: center;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && deployments.length === 0">
            <td colspan="8" class="table-empty">
              <span class="loading-spinner"></span>
              Cargando registros desde SQL Server...
            </td>
          </tr>

          <tr v-else-if="filteredDeployments.length === 0">
            <td colspan="8" class="table-empty">
              No se encontraron registros de pruebas con los filtros seleccionados.
            </td>
          </tr>

          <tr v-for="item in filteredDeployments" :key="item.Id" class="table-row">
            <td class="font-mono text-dim">#{{ item.Id }}</td>
            <td>
              <div class="test-title">{{ item.Title }}</div>
              <div v-if="item.Notes" class="test-notes">{{ item.Notes }}</div>
            </td>
            <td>
              <span class="env-pill">{{ item.Environment }}</span>
            </td>
            <td>
              <span 
                class="badge" 
                :class="{
                  'badge-success': item.Status === 'SUCCESS',
                  'badge-failed': item.Status === 'FAILED',
                  'badge-warning': item.Status === 'WARNING',
                }"
              >
                {{ item.Status }}
              </span>
            </td>
            <td>
              <span class="font-mono font-bold" :class="item.ResponseTimeMs < 50 ? 'color-emerald' : 'color-amber'">
                {{ item.ResponseTimeMs }} ms
              </span>
            </td>
            <td class="text-muted">{{ item.TestedBy }}</td>
            <td class="text-dim text-sm">{{ formatDate(item.CreatedAt) }}</td>
            <td style="text-align: center;">
              <button 
                :id="`btn-delete-${item.Id}`"
                class="btn-icon-danger" 
                title="Eliminar prueba"
                @click="handleDelete(item.Id)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Agregar Nueva Prueba -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Registrar Nueva Prueba de Despliegue</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleCreateTest">
          <div class="modal-body form-grid">
            <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

            <div class="form-group">
              <label class="form-label" for="test-title">Título de la Prueba:</label>
              <input 
                id="test-title"
                v-model="newTest.title" 
                type="text" 
                class="form-input" 
                placeholder="Ej. Prueba de migración Azure SQL / Docker Nginx"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="test-env">Entorno de Despliegue:</label>
                <select id="test-env" v-model="newTest.environment" class="form-select">
                  <option v-for="env in environments" :key="env" :value="env">{{ env }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="test-status">Resultado / Estado:</label>
                <select id="test-status" v-model="newTest.status" class="form-select">
                  <option value="SUCCESS">SUCCESS (Exitoso)</option>
                  <option value="WARNING">WARNING (Advertencia)</option>
                  <option value="FAILED">FAILED (Fallido)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="test-latency">Latencia de Respuesta (ms):</label>
                <input 
                  id="test-latency"
                  v-model.number="newTest.responseTimeMs" 
                  type="number" 
                  min="1" 
                  max="10000" 
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="test-author">Tester / Responsable:</label>
                <input 
                  id="test-author"
                  v-model="newTest.testedBy" 
                  type="text" 
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="test-notes">Notas / Observaciones:</label>
              <textarea 
                id="test-notes"
                v-model="newTest.notes" 
                class="form-textarea" 
                rows="3" 
                placeholder="Detalles sobre SSL, configuración de variables de entorno o endpoints..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancelar</button>
            <button id="btn-submit-test" type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Insertando en BD...' : 'Guardar en SQL Server' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deployment-section {
  padding: 1.5rem;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.section-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.inline-code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.search-input {
  padding-left: 2.4rem;
}

.select-box {
  width: 220px;
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th {
  background: rgba(15, 23, 42, 0.9);
  padding: 0.85rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.table-empty {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-dim);
}

.test-title {
  font-weight: 600;
  color: var(--text-main);
}

.test-notes {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.env-pill {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-icon-danger {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.btn-icon-danger:hover {
  color: var(--accent-rose);
  background: rgba(244, 63, 94, 0.1);
}

/* Modal Form styles */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid var(--accent-rose);
  color: #ffb4c2;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.font-mono { font-family: var(--font-mono); }
.font-bold { font-weight: 700; }
.text-dim { color: var(--text-dim); }
.text-muted { color: var(--text-muted); }
.text-sm { font-size: 0.75rem; }
.color-emerald { color: var(--accent-emerald); }
.color-amber { color: var(--accent-amber); }
</style>
