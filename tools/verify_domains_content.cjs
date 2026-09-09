const https = require('https');

function fetchDomain(hostname, path = '/') {
  return new Promise((resolve) => {
    const req = https.request({
      hostname,
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Civer-Audit-Bot/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          hostname,
          path,
          statusCode: res.statusCode,
          headers: res.headers,
          length: data.length,
          title: (data.match(/<title>(.*?)<\/title>/i) || [])[1] || 'SIN TITULO',
          snippet: data.substring(0, 300)
        });
      });
    });
    req.on('error', (e) => resolve({ hostname, path, error: e.message }));
    req.end();
  });
}

async function main() {
  console.log('=== AUDITORIA CRUZADA DE DOMINIOS EN VIVO ===\n');

  const appstore = await fetchDomain('appstore.civer.cloud', '/');
  console.log('1. https://appstore.civer.cloud/:');
  console.log('   Status:', appstore.statusCode);
  console.log('   Título:', appstore.title);
  console.log('   Cache-Control:', appstore.headers ? appstore.headers['cache-control'] : 'N/A');
  console.log('   Bytes:', appstore.length);

  const manifest = await fetchDomain('appstore.civer.cloud', '/api/v1/ota/manifest.json');
  console.log('\n2. https://appstore.civer.cloud/api/v1/ota/manifest.json:');
  console.log('   Status:', manifest.statusCode);
  console.log('   Contenido:', manifest.snippet);

  const apkHead = await new Promise((resolve) => {
    const req = https.request({
      hostname: 'appstore.civer.cloud',
      path: '/downloads/com.civer.appstore-v1.0.3-release.apk',
      method: 'HEAD'
    }, (res) => {
      resolve({
        statusCode: res.statusCode,
        contentLength: res.headers['content-length'],
        contentType: res.headers['content-type']
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
  console.log('\n3. APK Download (v1.0.3):');
  console.log('   Status:', apkHead.statusCode);
  console.log('   Tamaño (bytes):', apkHead.contentLength);
  console.log('   Content-Type:', apkHead.contentType);

  const manager = await fetchDomain('manager.civer.cloud', '/');
  console.log('\n4. https://manager.civer.cloud/:');
  console.log('   Status:', manager.statusCode);
  console.log('   Título:', manager.title);
  console.log('   Cache-Control:', manager.headers ? manager.headers['cache-control'] : 'N/A');
  console.log('   Bytes:', manager.length);
}

main();
