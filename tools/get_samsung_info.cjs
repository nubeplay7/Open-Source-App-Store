const { execSync } = require('child_process');

const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const HOST = 'Usuario@192.168.1.74';

function runAdb(cmd) {
  return execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${HOST} "adb -s R8YY500R7ZB ${cmd}"`, { encoding: 'utf-8', timeout: 10000 }).trim();
}

try {
  console.log('Model:', runAdb('shell getprop ro.product.model'));
  console.log('Android Version:', runAdb('shell getprop ro.build.version.release'));
  console.log('Battery:', runAdb('shell dumpsys battery | findstr /i level'));
  console.log('Resolution:', runAdb('shell wm size'));
  console.log('Density:', runAdb('shell wm density'));
} catch (e) {
  console.error('Error querying Samsung:', e.message);
}
