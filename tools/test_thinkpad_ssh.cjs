const { exec } = require('child_process');

console.log('=== TEST SSH VERBOSE ===');
const cmd = `ssh -vvv -i "C:\\Users\\asus\\.ssh\\id_rsa_antigravity" -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no Usuario@192.168.1.74 "echo THINKPAD_ALIVE"`;

const proc = exec(cmd, (err, stdout, stderr) => {
  console.log('STDOUT:\n', stdout);
  console.log('STDERR:\n', stderr);
  if (err) {
    console.log('ERR CODE:', err.code);
  }
});
