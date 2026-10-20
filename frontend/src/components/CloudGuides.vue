<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<'azure' | 'docker' | 'render' | 'tauri'>('azure');
const copiedIndex = ref<string | null>(null);

function copyToClipboard(text: string, id: string) {
  navigator.clipboard.writeText(text);
  copiedIndex.value = id;
  setTimeout(() => {
    copiedIndex.value = null;
  }, 2000);
}
</script>

<template>
  <div class="glass-panel guides-container">
    <div class="guides-header">
      <div>
        <h2 class="section-title">Guías de Despliegue en la Nube</h2>
        <p class="section-desc">Instrucciones listas para producción para desplegar este stack en la nube y en escritorio con Tauri.</p>
      </div>

      <div class="guides-tabs">
        <button 
          id="guide-tab-azure"
          class="tab-btn" 
          :class="{ active: activeTab === 'azure' }" 
          @click="activeTab = 'azure'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          </svg>
          Microsoft Azure
        </button>

        <button 
          id="guide-tab-docker"
          class="tab-btn" 
          :class="{ active: activeTab === 'docker' }" 
          @click="activeTab = 'docker'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
          Docker Compose
        </button>

        <button 
          id="guide-tab-render"
          class="tab-btn" 
          :class="{ active: activeTab === 'render' }" 
          @click="activeTab = 'render'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          Render / Railway
        </button>

        <button 
          id="guide-tab-tauri"
          class="tab-btn" 
          :class="{ active: activeTab === 'tauri' }" 
          @click="activeTab = 'tauri'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Tauri Desktop
        </button>
      </div>
    </div>

    <!-- Guía Azure -->
    <div v-if="activeTab === 'azure'" class="guide-body">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-content">
          <h4>Crear Azure SQL Database</h4>
          <p>En el portal de Azure o mediante Azure CLI, aprovisiona una base de datos SQL Server y permite el acceso a servicios de Azure en el Firewall:</p>
          <div class="code-box">
            az sql server create --name sql-cloud-demo --resource-group rg-cloud-test --location eastus --admin-user cloud_user --admin-password "CloudPass123!*"
            <button class="copy-btn" @click="copyToClipboard('az sql server create --name sql-cloud-demo --resource-group rg-cloud-test --location eastus --admin-user cloud_user --admin-password &quot;CloudPass123!*&quot;', 'az1')">
              {{ copiedIndex === 'az1' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-content">
          <h4>Configurar Variables de Entorno en Azure App Service</h4>
          <p>Agrega los valores en "Configuration -> Application Settings" de tu Web App:</p>
          <div class="code-box">
DB_SERVER=sql-cloud-demo.database.windows.net
DB_PORT=1433
DB_USER=cloud_user@sql-cloud-demo
DB_PASSWORD=CloudPass123!*
DB_NAME=CloudTestDb
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
            <button class="copy-btn" @click="copyToClipboard('DB_SERVER=sql-cloud-demo.database.windows.net\nDB_PORT=1433\nDB_USER=cloud_user@sql-cloud-demo\nDB_PASSWORD=CloudPass123!*\nDB_NAME=CloudTestDb\nDB_ENCRYPT=true\nDB_TRUST_SERVER_CERTIFICATE=false', 'az2')">
              {{ copiedIndex === 'az2' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">3</div>
        <div class="step-content">
          <h4>Desplegar Contenedor Fullstack en Azure App Service</h4>
          <p>Usa la imagen generada con <code class="inline-code">Dockerfile.fullstack</code>:</p>
          <div class="code-box">
            az webapp up --name mi-cloud-deploy-sql --resource-group rg-cloud-test --plan asp-cloud --runtime "NODE:20-lts"
            <button class="copy-btn" @click="copyToClipboard('az webapp up --name mi-cloud-deploy-sql --resource-group rg-cloud-test --plan asp-cloud --runtime &quot;NODE:20-lts&quot;', 'az3')">
              {{ copiedIndex === 'az3' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía Docker -->
    <div v-if="activeTab === 'docker'" class="guide-body">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-content">
          <h4>Levantar todo el Stack con Docker Compose</h4>
          <p>Este comando levanta: SQL Server 2022 (Linux container), Backend Express TypeScript y Frontend Vue en Nginx:</p>
          <div class="code-box">
            docker compose up -d --build
            <button class="copy-btn" @click="copyToClipboard('docker compose up -d --build', 'doc1')">
              {{ copiedIndex === 'doc1' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-content">
          <h4>Puertos Expuestos</h4>
          <ul class="guide-list">
            <li><strong>Frontend Vue 3:</strong> <a href="http://localhost:8080" target="_blank" class="link-cyan">http://localhost:8080</a></li>
            <li><strong>Backend API:</strong> <a href="http://localhost:5000" target="_blank" class="link-cyan">http://localhost:5000</a></li>
            <li><strong>SQL Server 2022:</strong> <code class="inline-code">localhost:1433</code></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Guía Render / Railway -->
    <div v-if="activeTab === 'render'" class="guide-body">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-content">
          <h4>Despliegue con un Clic (PaaS)</h4>
          <p>Tanto Render como Railway soportan despliegues basados en Dockerfile con compilación multi-stage:</p>
          <div class="code-box">
            # En la raíz del repositorio:
            docker build -f Dockerfile.fullstack -t mi-cloud-app:latest .
            <button class="copy-btn" @click="copyToClipboard('docker build -f Dockerfile.fullstack -t mi-cloud-app:latest .', 'ren1')">
              {{ copiedIndex === 'ren1' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía Tauri -->
    <div v-if="activeTab === 'tauri'" class="guide-body">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-content">
          <h4>Ejecutar como Aplicación de Escritorio con Tauri</h4>
          <p>Tauri empaqueta la interfaz Vue 3 + TypeScript en un binario nativo ligero en Rust:</p>
          <div class="code-box">
            # En la carpeta frontend:
            npm run tauri dev
            <button class="copy-btn" @click="copyToClipboard('cd frontend && npm run tauri dev', 'tau1')">
              {{ copiedIndex === 'tau1' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-content">
          <h4>Compilar el Instalador Nativo (.msi / .exe)</h4>
          <div class="code-box">
            npm run tauri build
            <button class="copy-btn" @click="copyToClipboard('cd frontend && npm run tauri build', 'tau2')">
              {{ copiedIndex === 'tau2' ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guides-container {
  padding: 1.5rem;
}

.guides-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.guides-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.guide-body {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.step-num {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: #0b0f19;
  font-weight: 800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-content h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: var(--text-main);
}

.step-content p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.code-box {
  position: relative;
  padding-right: 5rem;
  white-space: pre-wrap;
}

.copy-btn {
  position: absolute;
  right: 0.6rem;
  top: 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.guide-list {
  list-style: none;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-cyan {
  color: var(--accent-cyan);
  text-decoration: underline;
}

.inline-code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
}
</style>
