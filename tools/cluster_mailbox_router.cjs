#!/usr/bin/env node
/**
 * tools/cluster_mailbox_router.cjs
 * Enrutador de Buzón Inter-Conversación y Orquestador de Enjambre (Modo Paperclip)
 * Conecta las conversaciones activas del IDE Antigravity (Master ASUS + ThinkPad + DiscoveryWeb)
 * a través de una cola de mensajes persistente en disco.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAILBOX_PATH = path.resolve(
  process.env.APPDATA || 'C:\\Users\\asus\\AppData\\Roaming',
  '..',
  '.gemini',
  'antigravity',
  'brain',
  'cluster_mailbox.json'
);

const MESH_SCRIPT = path.resolve(__dirname, 'civer_cluster_mesh.cjs');
const CURRENT_CONV_ID = '254b0209-02cf-4731-ac62-aff5147af710';

function loadMailbox() {
  try {
    if (!fs.existsSync(MAILBOX_PATH)) {
      fs.mkdirSync(path.dirname(MAILBOX_PATH), { recursive: true });
      fs.writeFileSync(MAILBOX_PATH, JSON.stringify({ version: '1.0.0', messages: [] }, null, 2), 'utf8');
      return { version: '1.0.0', messages: [] };
    }
    const raw = fs.readFileSync(MAILBOX_PATH, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch (e) {
    return { version: '1.0.0', messages: [] };
  }
}

function saveMailbox(data) {
  try {
    fs.mkdirSync(path.dirname(MAILBOX_PATH), { recursive: true });
    fs.writeFileSync(MAILBOX_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error al guardar buzón:', e.message);
  }
}

const args = process.argv.slice(2);
const command = args[0] || 'list';

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

switch (command) {
  case 'list': {
    const mb = loadMailbox();
    console.log(`\n📬 BUZÓN INTER-CONVERSACIÓN CIVER CLOUD (${mb.messages.length} mensajes)`);
    console.log(`Ubicación: ${MAILBOX_PATH}\n`);
    if (mb.messages.length === 0) {
      console.log('No hay mensajes en la cola.');
    } else {
      mb.messages.slice(0, 15).forEach(m => {
        const icon = m.status === 'UNREAD' ? '📩' : '📖';
        console.log(`${icon} [${m.id}] ${m.timestamp} | De: ${m.from.substring(0, 8)}... -> Para: ${m.to.substring(0, 8)}...`);
        console.log(`   Asunto: ${m.subject}`);
        console.log(`   Cuerpo: ${m.body.substring(0, 80)}${m.body.length > 80 ? '...' : ''}\n`);
      });
    }
    break;
  }

  case 'send': {
    const from = getArgValue('--from') || CURRENT_CONV_ID;
    const to = getArgValue('--to') || 'ALL_FEDERATED_PEERS';
    const subject = getArgValue('--subject') || 'Notificación de Enjambre Civer';
    const body = getArgValue('--body') || 'Sin contenido';

    const mb = loadMailbox();
    const newMsg = {
      id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      from,
      to,
      subject,
      body,
      status: 'DELIVERED',
      read: false
    };

    mb.messages.unshift(newMsg);
    if (mb.messages.length > 200) mb.messages.pop();
    saveMailbox(mb);

    console.log(`✅ Mensaje enviado y encolado en buzón: [${newMsg.id}]`);
    console.log(`   De: ${from}`);
    console.log(`   Para: ${to}`);
    console.log(`   Asunto: ${subject}`);
    break;
  }

  case 'broadcast': {
    const from = getArgValue('--from') || CURRENT_CONV_ID;
    const subject = getArgValue('--subject') || '🚨 Emisión Global de Enjambre Civer Cloud';
    const body = getArgValue('--body') || 'Sincronización de hito del clúster completada con éxito.';

    const mb = loadMailbox();
    const broadcastMsg = {
      id: `bcast-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      from,
      to: 'BROADCAST_ALL_CONVERSATIONS',
      subject,
      body,
      status: 'BROADCASTED',
      read: false
    };

    mb.messages.unshift(broadcastMsg);
    saveMailbox(mb);

    console.log(`📡 DIFUSIÓN GLOBAL DESPACHADA A TODAS LAS CONVERSACIONES:`);
    console.log(`   ID: ${broadcastMsg.id}`);
    console.log(`   Asunto: ${subject}`);
    console.log(`   Mensaje: ${body}`);
    break;
  }

  case 'read': {
    const id = getArgValue('--id');
    if (!id) {
      console.error('Error: Especifica --id <msgId>');
      process.exit(1);
    }
    const mb = loadMailbox();
    const msg = mb.messages.find(m => m.id === id);
    if (!msg) {
      console.error(`Mensaje ${id} no encontrado.`);
      process.exit(1);
    }
    msg.read = true;
    msg.status = 'READ';
    saveMailbox(mb);
    console.log(`\n📖 [${msg.id}] ${msg.timestamp}`);
    console.log(`De: ${msg.from} -> Para: ${msg.to}`);
    console.log(`Asunto: ${msg.subject}`);
    console.log(`\n${msg.body}\n`);
    break;
  }

  default:
    console.log('Uso: node tools/cluster_mailbox_router.cjs [list|send|broadcast|read]');
    break;
}
