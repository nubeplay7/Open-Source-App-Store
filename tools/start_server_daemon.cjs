const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\asus\\OneDrive - Universidad Veracruzana\\Escritorio\\mesh-shared-vault\\sitio-descarga';
const logFile = 'C:\\Users\\asus\\tools\\server-3000.log';

const out = fs.openSync(logFile, 'a');
const err = fs.openSync(logFile, 'a');

const sub = spawn(process.execPath, [path.join(targetDir, 'server.js')], {
  cwd: targetDir,
  detached: true,
  stdio: ['ignore', out, err]
});

sub.unref();

console.log(`[DAEMON] Servidor civer.cloud iniciado desacoplado exitosamente con PID: ${sub.pid}`);
process.exit(0);
