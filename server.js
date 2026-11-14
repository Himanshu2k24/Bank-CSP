/**
 * CSP Daily Balance Manager - Backend Server
 * Pure Node.js (Zero external dependencies)
 * Fully Synchronizes: Daily Hisab, Deposits, Payouts, Settings & Master Password
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
const DEPOSITS_FILE = path.join(DATA_DIR, 'deposits.json');
const PAYOUTS_FILE = path.join(DATA_DIR, 'payouts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure database files exist
function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}
ensureFile(RECORDS_FILE, {});
ensureFile(DEPOSITS_FILE, []);
ensureFile(PAYOUTS_FILE, []);
ensureFile(SETTINGS_FILE, { centerName: 'CSP Balance Manager', password: '' });
ensureFile(DELETED_FILE, []);

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readJson(file, fallback) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || 'null') ?? fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Write error for', file, e);
    return false;
  }
}

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES ---

  // 1. GET /api/status - Server info
  if (req.method === 'GET' && pathname === '/api/status') {
    const ips = getNetworkIPs();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrls: ips.map(ip => `http://${ip}:${PORT}`),
      serverTime: new Date().toISOString()
    }));
    return;
  }

  // 2. GET /api/all-data - Complete data bundle for cross-device sync
  if (req.method === 'GET' && pathname === '/api/all-data') {
    const records = readJson(RECORDS_FILE, {});
    const deposits = readJson(DEPOSITS_FILE, []);
    const payouts = readJson(PAYOUTS_FILE, []);
    const settings = readJson(SETTINGS_FILE, {});
    const deleted = readJson(DELETED_FILE, []);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      records: records,
      deposits: deposits,
      payouts: payouts,
      settings: settings,
      deleted: deleted,
      serverTime: new Date().toISOString()
    }));
    return;
  }

  // 3. POST /api/sync-all - Save all data (records, deposits, payouts, settings, deleted)
  if (req.method === 'POST' && pathname === '/api/sync-all') {
    try {
      const body = await parseBody(req);
      if (body.records) writeJson(RECORDS_FILE, body.records);
      if (body.deposits) writeJson(DEPOSITS_FILE, body.deposits);
      if (body.payouts) writeJson(PAYOUTS_FILE, body.payouts);
      if (body.settings) writeJson(SETTINGS_FILE, body.settings);
      if (body.deleted) writeJson(DELETED_FILE, body.deleted);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'All data synchronized successfully' }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 4. GET /api/day?date=YYYY-MM-DD
  if (req.method === 'GET' && pathname === '/api/day') {
    const date = parsedUrl.query.date;
    const records = readJson(RECORDS_FILE, {});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, date: date, record: records[date] || null }));
    return;
  }

  // 5. POST /api/save - Save daily hisab record
  if (req.method === 'POST' && pathname === '/api/save') {
    try {
      const body = await parseBody(req);
      if (!body.date) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Date is required' }));
        return;
      }
      const records = readJson(RECORDS_FILE, {});
      const existing = records[body.date] || {};
      const merged = { ...existing, ...body, updatedAt: new Date().toISOString() };
      records[body.date] = merged;
      writeJson(RECORDS_FILE, records);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, record: merged }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 6. GET /api/deposits & POST /api/deposits
  if (pathname === '/api/deposits') {
    if (req.method === 'GET') {
      const deposits = readJson(DEPOSITS_FILE, []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deposits: deposits }));
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          writeJson(DEPOSITS_FILE, body);
        } else if (body.deposits && Array.isArray(body.deposits)) {
          writeJson(DEPOSITS_FILE, body.deposits);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Deposits saved' }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // 7. GET /api/payouts & POST /api/payouts
  if (pathname === '/api/payouts') {
    if (req.method === 'GET') {
      const payouts = readJson(PAYOUTS_FILE, []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, payouts: payouts }));
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          writeJson(PAYOUTS_FILE, body);
        } else if (body.payouts && Array.isArray(body.payouts)) {
          writeJson(PAYOUTS_FILE, body.payouts);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Payouts saved' }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // 8. GET /api/settings & POST /api/settings (for password & shop name)
  if (pathname === '/api/settings') {
    if (req.method === 'GET') {
      const settings = readJson(SETTINGS_FILE, {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, settings: settings }));
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const existing = readJson(SETTINGS_FILE, {});
        const updated = { ...existing, ...body };
        writeJson(SETTINGS_FILE, updated);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, settings: updated }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // 9. GET /api/deleted & POST /api/deleted (for deleted records audit history)
  if (pathname === '/api/deleted') {
    if (req.method === 'GET') {
      const deleted = readJson(DELETED_FILE, []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deleted: deleted }));
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          writeJson(DELETED_FILE, body);
        } else if (body.deleted && Array.isArray(body.deleted)) {
          writeJson(DELETED_FILE, body.deleted);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Deleted history saved' }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getNetworkIPs();
  console.log('================================================================');
  console.log('   CSP Daily Balance Manager Server is RUNNING!                ');
  console.log('================================================================');
  console.log(` > On this PC: http://localhost:${PORT}`);
  if (ips.length > 0) {
    console.log(` > On other systems (Phone / Laptop): http://${ips[0]}:${PORT}`);
  }
  console.log('================================================================');
});
