/**
 * Generador Universal de Documentos Imprimibles A4, Word (.doc) y PDF
 * Transforma documentos Markdown (docs/*.md) en informes ejecutivos de alta dirección
 * listos para encuadernar, imprimir y leer fuera de la computadora.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\asus\\OneDrive - Universidad Veracruzana\\Escritorio\\Open Source App Store - Civer App Store';
const docsDir = path.join(projectRoot, 'docs');
const outputDir = path.join(docsDir, 'imprimibles');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function parseMarkdownToHtml(md) {
  let html = md;

  // Escapar caracteres básicos
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Restaurar bloques especiales
  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1 class="chapter-title">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="subsection-title">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="sub-subsection-title">$1</h4>');

  // Blockquotes
  html = html.replace(/^\&gt;\s+(.*$)/gim, '<div class="callout-box">$1</div>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Inline code
  html = html.replace(/\`([^\`]+)\`/gim, '<code class="inline-code">$1</code>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="section-divider" />');

  // Tablas ASCII / Markdown
  // Detectar bloques de código plaintext (tablas con +----+ o recuadros)
  html = html.replace(/\`\`\`plaintext([\s\S]*?)\`\`\`/gim, (match, p1) => {
    return '<pre class="ascii-table-block">' + p1.trim() + '</pre>';
  });

  html = html.replace(/\`\`\`bash([\s\S]*?)\`\`\`/gim, (match, p1) => {
    return '<div class="terminal-box"><div class="terminal-header">Terminal / Shell</div><pre class="terminal-code">' + p1.trim() + '</pre></div>';
  });

  html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/gim, (match, p1) => {
    return '<pre class="code-block">' + p1.trim() + '</pre>';
  });

  // Listas ordenadas y desordenadas
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="bullet-item">$1</li>');
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="numbered-item"><span class="list-num">$1.</span> $2</li>');

  // Párrafos
  html = html.split('\n\n').map(chunk => {
    chunk = chunk.trim();
    if (!chunk) return '';
    if (chunk.startsWith('<h1') || chunk.startsWith('<h2') || chunk.startsWith('<h3') || 
        chunk.startsWith('<h4') || chunk.startsWith('<div') || chunk.startsWith('<pre') || 
        chunk.startsWith('<hr') || chunk.startsWith('<li')) {
      return chunk;
    }
    return '<p class="body-paragraph">' + chunk.replace(/\n/g, '<br/>') + '</p>';
  }).join('\n\n');

  // Insignias en tablas
  html = html.replace(/COMPLETO/g, '<span class="badge badge-complete">COMPLETO</span>');
  html = html.replace(/EN CURSO/g, '<span class="badge badge-in-progress">EN CURSO</span>');
  html = html.replace(/PLANIFIC\./g, '<span class="badge badge-planned">PLANIFIC.</span>');
  html = html.replace(/SIGUIENTE/g, '<span class="badge badge-next">SIGUIENTE</span>');

  return html;
}

function generatePrintableHtml(contentHtml, title) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-center {
        content: "CIVER APP STORE — Manual Corporativo & Roadmap Global | Página " counter(page) " de " counter(pages);
        font-family: 'Segoe UI', Inter, system-ui, -apple-system, sans-serif;
        font-size: 8pt;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        padding-top: 4mm;
        width: 100%;
      }
      @top-right {
        content: "CONFIDENCIAL / USO INTERNO Y LIBRE (FOSS)";
        font-family: 'Segoe UI', Inter, system-ui, sans-serif;
        font-size: 7pt;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
    }

    :root {
      --primary: #0f172a;
      --accent: #2563eb;
      --accent-dark: #1d4ed8;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border-color: #cbd5e1;
      --bg-alt: #f8fafc;
      --success: #059669;
      --warning: #d97706;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: var(--text-main);
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .document-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 10mm 15mm;
    }

    /* Portada Ejecutiva */
    .cover-page {
      page-break-after: always;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-left: 6px solid var(--accent);
      padding-left: 12mm;
      margin-bottom: 20mm;
    }

    .cover-header {
      margin-top: 25mm;
    }

    .cover-supertitle {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 5mm;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 900;
      line-height: 1.2;
      color: var(--primary);
      margin: 0 0 6mm 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: var(--text-muted);
      font-weight: 400;
      line-height: 1.4;
      max-width: 160mm;
      margin-bottom: 12mm;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6mm;
      background: var(--bg-alt);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6mm 8mm;
      margin-top: 20mm;
    }

    .meta-item {
      font-size: 9pt;
    }

    .meta-label {
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 1mm;
    }

    .meta-value {
      font-weight: 600;
      color: var(--primary);
    }

    .cover-footer {
      margin-bottom: 15mm;
      font-size: 8.5pt;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 4mm;
    }

    /* Tipografía y Encabezados */
    h1.chapter-title {
      font-size: 18pt;
      font-weight: 800;
      color: var(--primary);
      border-bottom: 2.5px solid var(--accent);
      padding-bottom: 2.5mm;
      margin-top: 10mm;
      margin-bottom: 6mm;
      page-break-before: always;
      break-before: page;
    }

    .cover-page + h1.chapter-title {
      page-break-before: avoid;
      break-before: avoid;
    }

    h2.section-title {
      font-size: 13.5pt;
      font-weight: 700;
      color: var(--primary);
      border-left: 3.5px solid var(--accent);
      padding-left: 3mm;
      margin-top: 7mm;
      margin-bottom: 4mm;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3.subsection-title {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin-top: 5mm;
      margin-bottom: 2.5mm;
      page-break-after: avoid;
      break-after: avoid;
    }

    h4.sub-subsection-title {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
      margin-top: 4mm;
      margin-bottom: 2mm;
    }

    p.body-paragraph {
      margin: 0 0 3.5mm 0;
      text-align: justify;
    }

    /* Cuadros Destacados */
    .callout-box {
      background-color: #f0fdf4;
      border-left: 4px solid var(--success);
      padding: 3mm 5mm;
      margin: 4mm 0;
      font-size: 9pt;
      color: #166534;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Bloques de Código y Tablas ASCII */
    .ascii-table-block {
      font-family: 'Consolas', 'Courier New', Courier, monospace;
      font-size: 7.2pt;
      line-height: 1.35;
      background: #0f172a;
      color: #f8fafc;
      padding: 3.5mm 4mm;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre;
      margin: 4mm 0;
      border: 1px solid #334155;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .terminal-box {
      background: #1e1e1e;
      border-radius: 5px;
      margin: 4mm 0;
      border: 1px solid #333333;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .terminal-header {
      background: #2d2d2d;
      color: #a3a3a3;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 1.5mm 3.5mm;
      border-radius: 5px 5px 0 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .terminal-code {
      font-family: 'Consolas', monospace;
      font-size: 8pt;
      color: #4ade80;
      padding: 3mm 4mm;
      margin: 0;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    .code-block {
      font-family: 'Consolas', monospace;
      font-size: 7.8pt;
      background: var(--bg-alt);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 3mm;
      margin: 3mm 0;
      page-break-inside: avoid;
    }

    .inline-code {
      font-family: 'Consolas', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 0.5mm 1.5mm;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    /* Listas */
    li.bullet-item {
      margin-bottom: 2mm;
      padding-left: 1mm;
    }

    li.numbered-item {
      margin-bottom: 2mm;
      list-style-type: none;
    }

    .list-num {
      font-weight: 700;
      color: var(--accent);
      margin-right: 2mm;
    }

    /* Divisores */
    .section-divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 6mm 0;
    }

    /* Insignias de Estado */
    .badge {
      display: inline-block;
      font-size: 6.8pt;
      font-weight: 700;
      padding: 0.5mm 2mm;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      vertical-align: middle;
    }

    .badge-complete {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .badge-in-progress {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }

    .badge-planned {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .badge-next {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    /* Estilos de Impresión Físicos */
    @media print {
      body {
        background: transparent;
      }
      .document-container {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Barra de Acción de Pantalla */
    .screen-actions-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: white;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
    }

    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-print:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>

  <div class="screen-actions-bar no-print">
    <div>
      <strong>Civer App Store</strong> — Visor de Documentos Imprimibles Oficiales (A4 Formatted)
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF (Ctrl + P)</button>
    </div>
  </div>

  <div class="document-container">
    <div class="cover-page">
      <div class="cover-header">
        <div class="cover-supertitle">Manual de Arquitectura y Operaciones Soberanas</div>
        <h1 class="cover-title">CIVER APP STORE</h1>
        <div class="cover-subtitle">
          Plan Maestro Global, Roadmap Hiperdimensional de 50 Fases, Inventario de Tablas y Manual Corporativo FOSS
        </div>
      </div>

      <div class="cover-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Organización Rectora</span>
          <span class="meta-value">Enjambre Autónomo Bené & Civer Cloud</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Versión de Documento</span>
          <span class="meta-value">3.0.0 (Edición Corporativa A4)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Dominio Oficial de Red</span>
          <span class="meta-value">appstore.civer.cloud (Cloudflare Edge)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Fecha de Consolidación</span>
          <span class="meta-value">Septiembre 2026</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Hardware de Campo Activo</span>
          <span class="meta-value">ASUS Desktop + ThinkPad T480s + Samsung A06</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Clasificación</span>
          <span class="meta-value">Distribución Libre / 100% FOSS Soberano</span>
        </div>
      </div>

      <div class="cover-footer">
        Este instructivo ha sido estructurado para consulta en pantalla, compilación a PDF e impresión física encuadernada en papel A4. Conserva el mapa de ruta integral para el enjambre de agentes y el equipo directivo.
      </div>
    </div>

    <!-- Contenido Transformado -->
    <div class="document-body">
      ${contentHtml}
    </div>
  </div>

</body>
</html>`;
}

function generateWordHtml(contentHtml, title) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
  size: 595.3pt 841.9pt;
  margin: 54.0pt 45.0pt 54.0pt 45.0pt;
  mso-header-margin: 35.4pt;
  mso-footer-margin: 35.4pt;
  mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11.0pt;
  line-height: 1.4;
  color: #1a1a1a;
}
h1 {
  font-size: 20.0pt;
  color: #0f172a;
  border-bottom: 2pt solid #2563eb;
  padding-bottom: 4pt;
  page-break-before: always;
}
h2 {
  font-size: 15.0pt;
  color: #1e293b;
  border-left: 3pt solid #2563eb;
  padding-left: 6pt;
}
h3 {
  font-size: 12.5pt;
  color: #334155;
}
pre {
  font-family: 'Consolas', monospace;
  font-size: 8.5pt;
  background-color: #f1f5f9;
  border: 1pt solid #cbd5e1;
  padding: 6pt;
}
p {
  margin-bottom: 6pt;
  text-align: justify;
}
.badge {
  font-weight: bold;
  padding: 1pt 4pt;
}
</style>
</head>
<body>
<div class="Section1">
  <div style="text-align: center; margin-bottom: 30pt; page-break-after: always;">
    <p style="font-size: 12pt; color: #2563eb; font-weight: bold; letter-spacing: 2pt;">MANUAL CORPORATIVO Y PLAN MAESTRO GLOBAL</p>
    <h1 style="font-size: 28pt; color: #0f172a; border: none; margin-top: 10pt;">CIVER APP STORE</h1>
    <p style="font-size: 14pt; color: #64748b;">Roadmap Hiperdimensional de 50 Fases, Directorio de Tablas y Guía Operativa FOSS</p>
    <br><br>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; border-color: #cbd5e1;">
      <tr style="background-color: #f8fafc;"><td><strong>Organización</strong></td><td>Enjambre Autónomo Bené & Civer Cloud</td></tr>
      <tr><td><strong>Versión</strong></td><td>3.0.0 (Edición Microsoft Word)</td></tr>
      <tr style="background-color: #f8fafc;"><td><strong>Dominio</strong></td><td>appstore.civer.cloud</td></tr>
      <tr><td><strong>Fecha</strong></td><td>Septiembre 2026</td></tr>
    </table>
  </div>

  ${contentHtml}
</div>
</body>
</html>`;
}

async function buildAll() {
  console.log('Iniciando compilador de documentos imprimibles para Civer App Store...');
  const sourceFile = path.join(docsDir, 'PLAN_MAESTRO_GLOBAL_ROADMAP.md');

  if (!fs.existsSync(sourceFile)) {
    console.error('No se encontro el archivo fuente:', sourceFile);
    process.exit(1);
  }

  const rawMd = fs.readFileSync(sourceFile, 'utf-8');
  console.log('Archivo fuente leido con exito:', rawMd.length, 'caracteres.');

  const parsedHtml = parseMarkdownToHtml(rawMd);

  // 1. Generar HTML para A4 / Impresion Web
  const a4Html = generatePrintableHtml(parsedHtml, 'CIVER APP STORE — Plan Maestro Global & Roadmap 50 Fases (A4)');
  const a4Path = path.join(outputDir, 'PLAN_MAESTRO_GLOBAL_ROADMAP_A4_IMPRIMIBLE.html');
  fs.writeFileSync(a4Path, a4Html, 'utf-8');
  console.log('Documento A4 para impresion generado en:', a4Path);

  // 2. Generar Documento Word (.doc)
  const wordDoc = generateWordHtml(parsedHtml, 'Civer App Store - Plan Maestro Global (Word)');
  const docPath = path.join(outputDir, 'PLAN_MAESTRO_GLOBAL_ROADMAP_WORD.doc');
  fs.writeFileSync(docPath, wordDoc, 'utf-8');
  console.log('Documento compatible con Microsoft Word generado en:', docPath);

  // 3. Generar README en la carpeta de imprimibles
  const readmeContent = `# Bóveda de Documentos Imprimibles Oficiales — Civer App Store

Esta carpeta contiene las versiones oficiales, paginadas y formateadas bajo estándar editorial corporativo del **Plan Maestro Global y Roadmap Hiperdimensional de 50 Fases** de Civer App Store:

## 📄 Archivos Disponibles

1. \`PLAN_MAESTRO_GLOBAL_ROADMAP_A4_IMPRIMIBLE.html\`
   - **Propósito:** Documento web estético con maquetación para papel A4, portada ejecutiva, encabezados y pies de página con contadores de página.
   - **Cómo Imprimir / Convertir a PDF:**
     1. Haz doble clic en \`PLAN_MAESTRO_GLOBAL_ROADMAP_A4_IMPRIMIBLE.html\` para abrirlo en Chrome o Edge.
     2. Presiona el botón azul superior **"🖨️ Imprimir / Guardar como PDF"** o el atajo \`Ctrl + P\`.
     3. Selecciona **"Guardar como PDF"** o tu impresora de oficina en formato A4.
     4. Listo: tendrás un documento de 20+ páginas encuadernable de alta prestancia.

2. \`PLAN_MAESTRO_GLOBAL_ROADMAP_WORD.doc\`
   - **Propósito:** Versión compatible con **Microsoft Word**, **LibreOffice Writer** y **WPS Office**.
   - **Cómo Usarlo:**
     1. Haz clic derecho y selecciona *Abrir con > Microsoft Word*.
     2. Puedes editar notas, agregar anotaciones manuales o imprimirlo directamente desde la suite de oficina.

---
*Generado automáticamente por el pipeline de publicación de Civer App Store.*
`;

  const readmePath = path.join(outputDir, 'README_IMPRIMIBLES.md');
  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log('README de instrucciones generado en:', readmePath);

  console.log('Pipeline de publicacion completado exitosamente.');
}

buildAll();
