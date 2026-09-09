const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@192.168.1.74';

function runThinkPad(cmd) {
  return execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${THINKPAD_HOST} "${cmd}"`, { encoding: 'utf-8', timeout: 30000 });
}

console.log('=== VERIFICANDO DISPOSITIVOS USB EN THINKPAD ===');
try {
  const pnp = runThinkPad('powershell -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match \'Samsung|Android|SAMSUNG\' -or $_.HardwareID -match \'04E8\' } | Select-Object Name, DeviceID, Status | Format-Table -AutoSize"');
  console.log('Dispositivos PnP:\n', pnp);
} catch (e) {
  console.log('Error PnP:', e.message.split('\n')[0]);
}
