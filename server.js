/**
 * CSP Daily Balance Manager - Backend Server
 * Pure Node.js (Zero external dependencies)
 * Enables multi-device live sync (Father's PC & Son's phone/laptop)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'records.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure records file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
}

// Ensure settings file exists
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ centerName: 'CSP Balance Manager' }), 'utf8');
}

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

// Helper to get local network IP addresses
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// Read database
function readRecords() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Error reading records.json:', err);
    return {};
  }
}

// Write database
function writeRecords(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing records.json:', err);
    return false;
  }
}

// Request Body Parser
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
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

// Server handler
const server = http.createServer(async (req, res) => {
  // CORS Headers for multi-device cross-origin safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES ---

  // 1. GET /api/status - Server info & IP addresses for multi-device connection
  if (req.method === 'GET' && pathname === '/api/status') {
    const ips = getNetworkIPs();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrls: ips.map(ip => `http://${ip}:${PORT}`),
      primaryNetworkUrl: ips.length > 0 ? `http://${ips[0]}:${PORT}` : `http://localhost:${PORT}`,
      serverTime: new Date().toISOString()
    }));
    return;
  }

  // 2. GET /api/day?date=YYYY-MM-DD - Get record for specific date
  if (req.method === 'GET' && pathname === '/api/day') {
    const date = parsedUrl.query.date;
    if (!date) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Date parameter required' }));
      return;
    }

    const records = readRecords();
    const record = records[date] || null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, date: date, record: record }));
    return;
  }

  // 3. GET /api/records - Get all saved records
  if (req.method === 'GET' && pathname === '/api/records') {
    const records = readRecords();
    // Return as array sorted by date descending
    const list = Object.keys(records).map(k => records[k]).sort((a, b) => b.date.localeCompare(a.date));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, records: list }));
    return;
  }

  // 4. POST /api/save - Save or update day record (preserves morning data when night data added)
  if (req.method === 'POST' && pathname === '/api/save') {
    try {
      const body = await parseBody(req);
      if (!body.date) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Date field is required' }));
        return;
      }

      const records = readRecords();
      const existing = records[body.date] || {};

      // Merge data so morning inputs remain preserved if only night is sent or vice versa
      const mergedRecord = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString()
      };

      records[body.date] = mergedRecord;
      writeRecords(records);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, record: mergedRecord }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 5. DELETE /api/day?date=YYYY-MM-DD - Delete record
  if (req.method === 'DELETE' && pathname === '/api/day') {
    const date = parsedUrl.query.date;
    if (!date) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Date parameter required' }));
      return;
    }

    const records = readRecords();
    if (records[date]) {
      delete records[date];
      writeRecords(records);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Deleted' }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html if not found (SPA behavior)
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
  console.log(` > On this PC (Father's System): http://localhost:${PORT}`);
  if (ips.length > 0) {
    console.log(` > On your Phone / Other PC (Same Wi-Fi): http://${ips[0]}:${PORT}`);
  }
  console.log('================================================================');
});

