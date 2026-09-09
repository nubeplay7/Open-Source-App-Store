const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const THINKPAD_HOST = 'Usuario@192.168.1.74';

try {
  console.log('Probando ADB en ThinkPad vía 192.168.1.74...');
  const out = execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${THINKPAD_HOST} "adb devices -l"`, { encoding: 'utf-8', timeout: 25000 });
  console.log('SALIDA ADB:\n' + out);
} catch (e) {
  console.error('ERROR ADB:', e.message);
}
