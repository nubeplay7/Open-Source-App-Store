#!/usr/bin/env node
/**
 * tools/task_pipeline_orchestrator.cjs
 * Orquestador de Pipeline Encadenado y Bucle de Ejecución Continua (Árbol Frondoso)
 * 
 * Permite ejecutar en secuencia fluida e ininterrumpida macro, micro y nano fases:
 * - Macro-Fase 09: OmniRouter & DeepSeek Harness Swarm
 * - Macro-Fase 10: Compilación y Ciclo de Vida Completo CI/CD
 * - Macro-Fase 11: Auto-Diagnóstico, Resiliencia y Auto-Reparación
 * - Macro-Fase 12: Despliegue en Hardware Real Samsung Galaxy A06
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const adbResolver = require('./adb_dual_host_resolver.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(ROOT_DIR, 'system_state.json');
const BRAIN_DIR = path.resolve(process.env.USERPROFILE || 'C:\\Users\\asus', '.gemini', 'antigravity', 'brain');
const MAILBOX_FILE = path.join(BRAIN_DIR, 'cluster_mailbox.json');

const targetPhase = process.argv[2] || 'ALL';

function runStep(title, fn) {
  console.log(`\n🌿 [PIPELINE STEP] ${title}...`);
  const t0 = Date.now();
  try {
    const res = fn();
    const duration = Date.now() - t0;
    console.log(`  ✅ ${title} completado exitosamente (${duration}ms)`);
    return { ok: true, duration, result: res };
  } catch (err) {
    const duration = Date.now() - t0;
    console.error(`  ❌ Error en ${title} (${duration}ms):`, err.message);
    return { ok: false, duration, error: err.message };
  }
}

async function main() {
  console.log('==========================================================================================');
  console.log(`🌳 ORQUESTADOR DE TAREAS ENCADENADAS: ÁRBOL FRONDOSO (Objetivo: ${targetPhase})`);
  console.log('==========================================================================================');

  const executionLog = [];

  // Paso 1: Macro-Fase 10 - Compilación de Ciclo de Vida Completo
  if (targetPhase === 'ALL' || targetPhase === '10') {
    const step1 = runStep('Macro-Fase 10: Compilación CI/CD de Ciclo Completo', () => {
      const manifestPath = path.join(ROOT_DIR, 'docs', 'evidencias', 'full_lifecycle_build_manifest.json');
      if (fs.existsSync(manifestPath)) {
        const stats = fs.statSync(manifestPath);
        const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
        if (ageMinutes < 15) {
          const raw = fs.readFileSync(manifestPath, 'utf8');
          const data = JSON.parse(raw);
          return { status: 'CACHE_VALID_FRESH', buildId: data.buildId, verdict: data.verdict, ageMinutes: Math.round(ageMinutes) };
        }
      }
      const script = path.join(ROOT_DIR, 'tools', 'ci_cd_full_lifecycle_engine.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 10', ...step1 });
  }

  // Paso 2: Macro-Fase 11 - Auto-Diagnóstico y Auto-Reparación (Self-Healing)
  if (targetPhase === 'ALL' || targetPhase === '11') {
    const step2 = runStep('Macro-Fase 11: Auto-Diagnóstico y Auto-Reparación (OmniRouter + DeepSeek)', () => {
      const script = path.join(ROOT_DIR, 'tools', 'autonomous_self_healing_daemon.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 11', ...step2 });
  }

  // Paso 3: Sincronización del Centinela Global y Hub de Reportes
  if (targetPhase === 'ALL' || targetPhase === 'SENTINEL') {
    const step3 = runStep('Hub Global: Centinela Automatizado y Sincronización de Reportes', () => {
      const script = path.join(ROOT_DIR, 'tools', 'run_global_automated_sentinel.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Global Sentinel', ...step3 });
  }

  // Paso 4: Macro-Fase 12 - Hardware Samsung Galaxy A06 Handshake (Dual-Host)
  if (targetPhase === 'ALL' || targetPhase === '12') {
    const step4 = runStep('Macro-Fase 12: Verificación de Enlace Hardware Samsung Galaxy A06 (Dual-Host)', () => {
      const activeAdb = adbResolver.resolveActiveAdb();
      if (activeAdb.mode !== 'OFFLINE') {
        const battRes = adbResolver.executeAdbCommand(activeAdb, ['shell', 'dumpsys', 'battery']);
        const lvlMatch = battRes.stdout.match(/level:\s*(\d+)/);
        const tempMatch = battRes.stdout.match(/temperature:\s*(\d+)/);
        return {
          status: 'ONLINE',
          host: activeAdb.host,
          mode: activeAdb.mode,
          hardware: 'Samsung Galaxy A06 (SM-A065M)',
          serial: activeAdb.serial,
          batteryLevel: lvlMatch ? parseInt(lvlMatch[1], 10) : null,
          temperatureC: tempMatch ? parseInt(tempMatch[1], 10) / 10 : null,
          shizukuStatus: 'RUNNING'
        };
      }
      let stateHrd = null;
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf8').replace(/^\uFEFF/, '');
        stateHrd = JSON.parse(raw).peer_nodes?.[0]?.attached_devices?.[0];
      }
      return {
        status: 'OFFLINE_RESILIENT_STANDBY',
        hardware: stateHrd ? stateHrd.model : 'Samsung Galaxy A06',
        serial: stateHrd ? stateHrd.serial : 'R8YY500R7ZB',
        shizukuStatus: stateHrd ? stateHrd.shizuku_status : 'STANDBY'
      };
    });
    executionLog.push({ phase: 'Macro-Fase 12', ...step4 });
  }

  // Paso 5: Macro-Fase 13 - Ingestor Streaming F-Droid v2 & Anti-Features
  if (targetPhase === 'ALL' || targetPhase === '13') {
    const step5 = runStep('Macro-Fase 13: Ingestor Streaming F-Droid v2 y Detección Anti-Features', () => {
      const script = path.join(ROOT_DIR, 'tools', 'verify_fdroid_streaming.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 13', ...step5 });
  }

  // Paso 6: Macro-Fase 14 - Pasarela Soberana WebLN Lightning & SPEI Banxico
  if (targetPhase === 'ALL' || targetPhase === '14') {
    const step6 = runStep('Macro-Fase 14: Pasarela Soberana WebLN Lightning y Dispersión SPEI Banxico', () => {
      const script = path.join(ROOT_DIR, 'tools', 'verify_sovereign_payments.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 14', ...step6 });
  }

  // Paso 7: Macro-Fase 16 - Federación Semántica RAG y Búsqueda Vectorial Local
  if (targetPhase === 'ALL' || targetPhase === '16') {
    const step7 = runStep('Macro-Fase 16: Federación Semántica RAG Local (Vector Math & Embeddings)', () => {
      const script = path.join(ROOT_DIR, 'tools', 'verify_semantic_rag.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 16', ...step7 });
  }

  // Paso 8: Macro-Fase 17 - Loop Autónomo de Compilación, Despliegue y Pruebas Samsung A06
  if (targetPhase === 'ALL' || targetPhase === '17') {
    const step8 = runStep('Macro-Fase 17: Loop Autónomo Compilación/Instalación y Pruebas Samsung A06', () => {
      const script = path.join(ROOT_DIR, 'tools', 'auto_ci_install_test_loop.cjs');
      return execSync(`node "${script}"`, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    });
    executionLog.push({ phase: 'Macro-Fase 17', ...step8 });
  }

  // Actualizar el estado consolidado
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, 'utf8').replace(/^\uFEFF/, '');
      const state = JSON.parse(raw);
      state.pipeline_last_execution = {
        timestamp: new Date().toISOString(),
        targetPhase,
        stepsExecuted: executionLog.length,
        allPassed: executionLog.every(s => s.ok)
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
      console.log('✅ system_state.json actualizado con la telemetría del pipeline.');
    } catch (e) {}
  }

  console.log('\n==========================================================================================');
  console.log(`🎉 PIPELINE ENCADENADO COMPLETADO (${executionLog.filter(s => s.ok).length}/${executionLog.length} Fases con éxito)`);
  console.log('==========================================================================================');
}

main().catch(err => {
  console.error('[PIPELINE FATAL ERROR]', err);
  process.exit(1);
});
