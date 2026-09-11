#!/usr/bin/env node
/**
 * tools/package_wordpress_plugins.cjs
 * Empaquetador automático de Plugins WordPress FOSS para Civer Cloud
 * Genera archivos .zip estándar para instalación directa en cualquier sitio WordPress
 */

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const PLUGINS_SRC_DIR = path.resolve(__dirname, '..', 'php', 'wordpress-plugins');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'plugins');

function addFolderToZip(zip, folderPath, rootPath) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

    if (stat.isDirectory()) {
      addFolderToZip(zip, fullPath, rootPath);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(relativePath, content);
    }
  }
}

async function packagePlugin(pluginSlug) {
  const pluginFolder = path.join(PLUGINS_SRC_DIR, pluginSlug);
  if (!fs.existsSync(pluginFolder)) {
    console.warn(`[SKIP] Plugin no encontrado: ${pluginFolder}`);
    return null;
  }

  const zip = new JSZip();
  // WordPress exige que el zip contenga la carpeta raíz con el slug
  const zipRoot = zip.folder(pluginSlug);
  
  const items = fs.readdirSync(pluginFolder);
  for (const item of items) {
    const fullPath = path.join(pluginFolder, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addFolderToZip(zipRoot.folder(item), fullPath, fullPath);
    } else {
      const content = fs.readFileSync(fullPath);
      zipRoot.file(item, content);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const outputFile = path.join(OUTPUT_DIR, `${pluginSlug}.zip`);
  fs.writeFileSync(outputFile, zipBuffer);
  console.log(`[ZIP] Generado: ${outputFile} (${zipBuffer.length} bytes)`);
  return {
    slug: pluginSlug,
    file: `${pluginSlug}.zip`,
    sizeBytes: zipBuffer.length
  };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('======================================================');
  console.log('Empaquetando Plugins WordPress de la Laguna Civer Cloud');
  console.log('======================================================');

  const pluginFolders = fs.readdirSync(PLUGINS_SRC_DIR).filter(f => {
    return fs.statSync(path.join(PLUGINS_SRC_DIR, f)).isDirectory();
  });

  const results = [];
  for (const slug of pluginFolders) {
    const res = await packagePlugin(slug);
    if (res) results.push(res);
  }

  const manifestPath = path.join(OUTPUT_DIR, 'plugins_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    plugins: results
  }, null, 2), 'utf8');

  console.log(`\n✅ ${results.length} plugins empaquetados exitosamente.`);
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
