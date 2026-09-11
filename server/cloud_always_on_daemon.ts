/**
 * CIVER CLOUD ALWAYS-ON DAEMON & API GATEWAY
 * 
 * Servidor permanente y ligero diseñado para correr 24/7 en el Droplet de DigitalOcean
 * o en el nodo maestro local, respondiendo a /api/* y manteniendo la tienda activa.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { runFullCanaryProbes } from './health_canary_prober';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3080;
const REPO_ROOT = path.resolve(__dirname, '..');
const OTA_MANIFEST_PATH = path.join(REPO_ROOT, 'public', 'ota-manifest.json');
const SYSTEM_STATE_PATH = path.join(REPO_ROOT, 'system_state.json');

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Civer-Client');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url || '/';

  // 1. Health Check Básico
  if (url === '/api/health' || url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      timestamp: new Date().toISOString(),
      node: process.env.NODE_ROLE || 'ALWAYS_ON_GATEWAY',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }));
    return;
  }

  // 2. Health Canary Prober del Clúster
  if (url === '/api/cluster/health') {
    try {
      const probes = await runFullCanaryProbes();
      const allHealthy = probes.every(p => p.status === 'HEALTHY');
      res.writeHead(allHealthy ? 200 : 207, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        clusterStatus: allHealthy ? 'HEALTHY' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        probesCount: probes.length,
        probes
      }, null, 2));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. Manifiesto OTA Oficial
  if (url === '/api/v1/ota/manifest.json' || url === '/ota-manifest.json') {
    if (fs.existsSync(OTA_MANIFEST_PATH)) {
      const data = fs.readFileSync(OTA_MANIFEST_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Manifest not found' }));
    }
    return;
  }

  // 4. Estado Vivo del Clúster
  if (url === '/api/cluster/state' || url === '/system_state.json') {
    if (fs.existsSync(SYSTEM_STATE_PATH)) {
      const data = fs.readFileSync(SYSTEM_STATE_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'System state not found' }));
    }
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/health',
      '/api/cluster/health',
      '/api/cluster/state',
      '/api/v1/ota/manifest.json'
    ]
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 CIVER CLOUD ALWAYS-ON GATEWAY ACTIVO`);
  console.log(`   Puerto: ${PORT} (0.0.0.0)`);
  console.log(`   PID:    ${process.pid}`);
  console.log(`   Ruta:   ${REPO_ROOT}`);
  console.log(`====================================================`);
});

// Manejo elegante de señales para evitar procesos zombies
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
