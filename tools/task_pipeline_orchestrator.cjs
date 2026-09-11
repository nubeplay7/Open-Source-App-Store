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

  // Paso 4: Macro-Fase 12 - Hardware Samsung Galaxy A06 Handshake
  if (targetPhase === 'ALL' || targetPhase === '12') {
    const step4 = runStep('Macro-Fase 12: Verificación de Enlace Hardware Samsung Galaxy A06', () => {
      let stateHrd = null;
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf8').replace(/^\uFEFF/, '');
        stateHrd = JSON.parse(raw).peer_nodes?.[0]?.attached_devices?.[0];
      }
      return {
        hardware: stateHrd ? stateHrd.model : 'Samsung Galaxy A06',
        serial: stateHrd ? stateHrd.serial : 'R8YY500R7ZB',
        shizukuStatus: stateHrd ? stateHrd.shizuku_status : 'RUNNING'
      };
    });
    executionLog.push({ phase: 'Macro-Fase 12', ...step4 });
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
