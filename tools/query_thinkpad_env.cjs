const { execSync } = require('child_process');
const SSH_KEY = 'C:\\Users\\asus\\.ssh\\id_rsa_antigravity';
const HOST = 'Usuario@192.168.1.74';

const script = `
Write-Host '=== JAVA & SDK ON THINKPAD ==='
Get-Command java, gradle, javac -ErrorAction SilentlyContinue | Format-Table Name, Source -AutoSize
Test-Path "$env:LOCALAPPDATA\\Android\\Sdk"
Get-ChildItem 'C:\\Program Files\\Java', 'C:\\Program Files\\Android' -ErrorAction SilentlyContinue | Format-Table Name, FullName -AutoSize
`;

const b64 = Buffer.from(script, 'utf16le').toString('base64');
try {
  const res = execSync(`ssh -i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=no ${HOST} "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf-8', timeout: 10000 });
  console.log(res);
} catch (e) {
  console.error('Error querying ThinkPad:', e.message);
}
