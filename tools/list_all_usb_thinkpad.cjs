const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@192.168.1.74';

function runPowerShellEncoded(psCode) {
  const b64 = Buffer.from(psCode, 'utf16le').toString('base64');
  const fullCommand = `ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${THINKPAD_HOST} "powershell.exe -NoProfile -NonInteractive -EncodedCommand ${b64}"`;
  return execSync(fullCommand, { encoding: 'utf-8', timeout: 30000 });
}

console.log('=== LISTANDO TODOS LOS DISPOSITIVOS USB EN THINKPAD ===');
const psScript = `
Get-CimInstance Win32_USBHub | Select-Object Name, DeviceID, Status | Format-Table -AutoSize
Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'USB' -or $_.PNPClass -eq 'Android' } | Select-Object Name, Present, Status | Format-Table -AutoSize
`;

try {
  const res = runPowerShellEncoded(psScript);
  console.log(res);
} catch (e) {
  console.error('Error:', e.message);
}
