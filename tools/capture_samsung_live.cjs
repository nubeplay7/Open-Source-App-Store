const { execSync } = require('child_process');
const fs = require('fs');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const HOST = 'Usuario@192.168.1.74';

try {
  console.log('1. Tomando captura en Samsung...');
  execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${HOST} "adb -s R8YY500R7ZB shell screencap -p /sdcard/samsung_appstore_live.png"`, { timeout: 15000 });
  
  console.log('2. Extrayendo captura a ThinkPad...');
  execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${HOST} "adb -s R8YY500R7ZB pull /sdcard/samsung_appstore_live.png C:\\Users\\Usuario\\samsung_appstore_live.png"`, { timeout: 15000 });

  console.log('3. Copiando a máquina local...');
  execSync(`scp -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${HOST}:C:/Users/Usuario/samsung_appstore_live.png ./evidencias/samsung_appstore_live.png`, { timeout: 20000 });

  if (fs.existsSync('./evidencias/samsung_appstore_live.png')) {
    const stats = fs.statSync('./evidencias/samsung_appstore_live.png');
    console.log('✅ Captura exitosa:', stats.size, 'bytes');
  }
} catch (e) {
  console.error('Error capturando pantalla:', e.message);
}
