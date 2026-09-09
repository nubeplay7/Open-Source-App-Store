const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const LENOVO_HOSTS = ['Usuario@192.168.1.100', 'Usuario@100.79.100.72'];

for (const host of LENOVO_HOSTS) {
  try {
    console.log(`Probando SSH/ADB en Lenovo (${host})...`);
    const out = execSync(`ssh -i "${SSH_KEY}" -o ConnectTimeout=3 -o BatchMode=yes -o StrictHostKeyChecking=no ${host} "adb devices -l"`, { encoding: 'utf-8', timeout: 15000 });
    console.log(`SALIDA ADB en Lenovo (${host}):\n` + out);
    break;
  } catch (e) {
    console.log(`Fallo en Lenovo (${host}):`, e.message.split('\n')[0]);
  }
}
