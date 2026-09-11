/**
 * CIVER CLUSTER MESH & DISCOVERYWEB BRIDGE (Node.js)
 * 
 * Interconecta las conversaciones activas del IDE Antigravity (ASUS y ThinkPad)
 * y los microservicios de DiscoveryWeb (puertos 8765 y 8766) como un clúster federado.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const BRAIN_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain';
const THINKPAD_IP = '100.96.218.12';
const THINKPAD_LAN = '192.168.1.74';
const DISCOVERY_HUD_PORT = 8766;

class CiverClusterMesh {
  constructor() {
    this.repoRoot = path.resolve(__dirname, '..');
    this.stateFile = path.join(this.repoRoot, 'system_state.json');
  }

  /**
   * Indexa las conversaciones locales de Antigravity como nodos del enjambre
   */
  indexActiveConversations() {
    if (!fs.existsSync(BRAIN_DIR)) return [];
    try {
      const entries = fs.readdirSync(BRAIN_DIR, { withFileTypes: true });
      const convs = entries
        .filter(e => e.isDirectory() && /^[0-9a-f]{8}-[0-9a-f]{4}/.test(e.name))
        .map(e => {
          const transcriptPath = path.join(BRAIN_DIR, e.name, '.system_generated', 'logs', 'transcript.jsonl');
          const hasTranscript = fs.existsSync(transcriptPath);
          let mtime = 0;
          if (hasTranscript) {
            mtime = fs.statSync(transcriptPath).mtimeMs;
          }
          return {
            conversationId: e.name,
            hasTranscript,
            lastModified: mtime ? new Date(mtime).toISOString() : null
          };
        })
        .sort((a, b) => (b.lastModified ? new Date(b.lastModified).getTime() : 0) - (a.lastModified ? new Date(a.lastModified).getTime() : 0));

      return convs.slice(0, 10);
    } catch (err) {
      console.error('Error indexando conversaciones:', err.message);
      return [];
    }
  }

  /**
   * Sondea el estado del nodo DiscoveryWeb en la ThinkPad
   */
  async probeDiscoveryWeb() {
    return new Promise((resolve) => {
      const req = http.get(`http://${THINKPAD_IP}:${DISCOVERY_HUD_PORT}/api/accounts`, { timeout: 2000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ online: true, accounts: JSON.parse(data) });
          } catch {
            resolve({ online: true, raw: data });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ online: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ online: false, error: 'TIMEOUT_2S' });
      });
    });
  }

  /**
   * Ejecuta un pulso completo de telemetría de clúster
   */
  async pulse() {
    console.log('====================================================');
    console.log('🌐 CIVER CLUSTER MESH — PULSO DE TELEMETRÍA AGÉNTICA');
    console.log('====================================================');

    const convs = this.indexActiveConversations();
    console.log(`[IDE Antigravity] ${convs.length} conversaciones recientes indexadas en el clúster.`);
    if (convs[0]) {
      console.log(`   -> Última activa: ${convs[0].conversationId} (${convs[0].lastModified})`);
    }

    const dw = await this.probeDiscoveryWeb();
    console.log(`[DiscoveryWeb ThinkPad] Estado: ${dw.online ? 'EN LÍNEA' : 'STANDBY/STANDALONE'}`);

    // Actualizar system_state.json
    if (fs.existsSync(this.stateFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        state.last_pulse = new Date().toISOString();
        state.active_conversations_count = convs.length;
        state.discoveryweb_thinkpad_online = dw.online;
        fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2), 'utf8');
        console.log('[System State] system_state.json actualizado con éxito.');
      } catch (err) {
        console.error('[System State] Error guardando estado:', err.message);
      }
    }

    console.log('====================================================\n');
  }
}

// Ejecución si se llama directamente
if (require.main === module) {
  const mesh = new CiverClusterMesh();
  mesh.pulse().then(() => process.exit(0));
}

module.exports = { CiverClusterMesh };
