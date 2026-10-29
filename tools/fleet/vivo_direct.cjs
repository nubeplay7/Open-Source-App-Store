/**
 * Control directo e inalámbrico del Vivo V2341 desde ASUS (sin SSH intermedio).
 * Ejecuta comandos individuales o flujos JSON completos directamente sobre Wi-Fi TCP/IP.
 * Uso:
 *   node tools/fleet/vivo_direct.cjs tap <x> <y>
 *   node tools/fleet/vivo_direct.cjs tapText "<texto>"
 *   node tools/fleet/vivo_direct.cjs snap [ruta.png]
 *   node tools/fleet/vivo_direct.cjs dump [ruta.xml]
 *   node tools/fleet/vivo_direct.cjs flow <flow.json> [carpeta_salida]
 *   node tools/fleet/vivo_direct.cjs shell <comando...>
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADB = 'C:\\tools\\platform-tools\\adb.exe';
const TARGET = process.env.VIVO_ADDR || '192.168.1.133:5555';

function adb(args, opts = {}) {
  return execFileSync(ADB, args, { timeout: 90000, maxBuffer: 64 * 1024 * 1024, ...opts });
}

function ensureConnected() {
  try {
    const list = adb(['devices']).toString();
    if (list.includes(TARGET + '\tdevice')) {
      return;
    }
  } catch (e) {}

  const out = adb(['connect', TARGET]).toString();
  if (!/connected to/.test(out)) {
    throw new Error('No se pudo conectar a ' + TARGET + ': ' + out);
  }
}

function dumpXml(destFile) {
  adb(['-s', TARGET, 'shell', 'uiautomator', 'dump', '/sdcard/_dump.xml']);
  const localDest = destFile || path.join(__dirname, '../../docs/evidence/vivo_live_dump.xml');
  fs.mkdirSync(path.dirname(localDest), { recursive: true });
  adb(['-s', TARGET, 'pull', '/sdcard/_dump.xml', localDest]);
  return localDest;
}

function tapText(needle) {
  const tmpXml = path.join(__dirname, '../../docs/evidence/_tmp_dump.xml');
  dumpXml(tmpXml);
  const content = fs.readFileSync(tmpXml, 'utf-8');
  
  // Buscar nodos con text o content-desc que contengan needle
  const regex = /<node[^>]*?(?:text="([^"]*)"|content-desc="([^"]*)")[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"[^>]*?>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const fullTag = match[0];
    const textMatch = fullTag.match(/text="([^"]*)"/);
    const descMatch = fullTag.match(/content-desc="([^"]*)"/);
    const boundsMatch = fullTag.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    
    const text = (textMatch && textMatch[1]) || '';
    const desc = (descMatch && descMatch[1]) || '';
    
    if (text.includes(needle) || desc.includes(needle)) {
      if (boundsMatch) {
        const x1 = parseInt(boundsMatch[1], 10);
        const y1 = parseInt(boundsMatch[2], 10);
        const x2 = parseInt(boundsMatch[3], 10);
        const y2 = parseInt(boundsMatch[4], 10);
        const cx = Math.floor((x1 + x2) / 2);
        const cy = Math.floor((y1 + y2) / 2);
        console.log(`[TAPTEXT] '${needle}' -> (${cx}, ${cy})`);
        adb(['-s', TARGET, 'shell', 'input', 'tap', String(cx), String(cy)]);
        return true;
      }
    }
  }
  console.warn(`[TAPTEXT WARN] '${needle}' no encontrado`);
  return false;
}

function snap(file) {
  const dest = file || path.join(__dirname, '../../docs/evidence/vivo_direct.png');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const t0 = Date.now();
  adb(['-s', TARGET, 'shell', 'screencap', '-p', '/sdcard/_snap.png']);
  adb(['-s', TARGET, 'pull', '/sdcard/_snap.png', dest]);
  const stats = fs.statSync(dest);
  console.log(`[SNAP] ${dest} ${(stats.size / 1024).toFixed(1)} KB en ${Date.now() - t0} ms`);
}

function runFlow(flowPath, outDir) {
  const raw = fs.readFileSync(flowPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const steps = Array.isArray(parsed) ? parsed : (parsed.steps || [parsed]);
  const out = outDir || path.join(__dirname, '../../docs/evidence', path.basename(flowPath, '.json'));
  fs.mkdirSync(out, { recursive: true });

  const logFile = path.join(out, 'flow.log');
  fs.writeFileSync(logFile, `INICIO FLOW DIRECT ${new Date().toISOString()}\n`);

  function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
  }

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const op = s.op || s.action;
    const a = s.a !== undefined ? s.a : (s.text !== undefined ? s.text : (s.ms !== undefined ? s.ms : s.name));
    const b = s.b;
    log(`[${i + 1}/${steps.length}] ${op} ${a || ''} ${b || ''}`);

    switch (op) {
      case 'wake':
        adb(['-s', TARGET, 'shell', 'input', 'keyevent', '224']);
        adb(['-s', TARGET, 'shell', 'input', 'keyevent', '82']);
        break;
      case 'key':
        adb(['-s', TARGET, 'shell', 'input', 'keyevent', String(a)]);
        break;
      case 'tap':
        adb(['-s', TARGET, 'shell', 'input', 'tap', String(a), String(b)]);
        break;
      case 'swipe':
        adb(['-s', TARGET, 'shell', 'input', 'swipe', String(a), String(b), String(s.c), String(s.d), '300']);
        break;
      case 'text':
        adb(['-s', TARGET, 'shell', 'input', 'text', String(a).replace(/ /g, '%s')]);
        break;
      case 'launch':
        adb(['-s', TARGET, 'shell', 'monkey', '-p', String(a), '-c', 'android.intent.category.LAUNCHER', '1']);
        break;
      case 'wait':
        const ms = parseInt(a, 10) || 1000;
        const end = Date.now() + ms;
        while (Date.now() < end) {}
        break;
      case 'tapText':
        tapText(String(a));
        break;
      case 'snap':
        snap(path.join(out, `${a}.png`));
        break;
      case 'dump':
        dumpXml(path.join(out, `${a}.xml`));
        break;
      case 'shell':
        const res = adb(['-s', TARGET, 'shell', String(a)]).toString();
        log(res);
        break;
      case 'push':
        adb(['-s', TARGET, 'push', String(a), String(b)]);
        break;
      default:
        log(`OP DESCONOCIDA: ${op}`);
    }
  }
  log(`FIN FLOW DIRECT ${new Date().toISOString()}`);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) {
    console.error('Uso: node tools/fleet/vivo_direct.cjs <cmd> [args...]');
    process.exit(2);
  }
  ensureConnected();

  switch (cmd) {
    case 'snap':
      snap(rest[0]);
      break;
    case 'dump':
      console.log('[DUMP] ' + dumpXml(rest[0]));
      break;
    case 'tap':
      adb(['-s', TARGET, 'shell', 'input', 'tap', rest[0], rest[1]]);
      break;
    case 'tapText':
      tapText(rest[0]);
      break;
    case 'text':
      adb(['-s', TARGET, 'shell', 'input', 'text', rest.join(' ').replace(/ /g, '%s')]);
      break;
    case 'key':
      adb(['-s', TARGET, 'shell', 'input', 'keyevent', rest[0]]);
      break;
    case 'launch':
      adb(['-s', TARGET, 'shell', 'monkey', '-p', rest[0], '-c', 'android.intent.category.LAUNCHER', '1']);
      break;
    case 'flow':
      runFlow(rest[0], rest[1]);
      break;
    case 'push':
      adb(['-s', TARGET, 'push', rest[0], rest[1]]);
      console.log(`[PUSH] ${rest[0]} -> ${rest[1]}`);
      break;
    case 'shell':
      process.stdout.write(adb(['-s', TARGET, 'shell', ...rest]).toString());
      break;
    default:
      console.error('Comando desconocido: ' + cmd);
      process.exit(2);
  }
}

main();
