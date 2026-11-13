/**
 * Vercel Serverless Function - Multi-Device API & Cloud Storage
 * Works automatically with Vercel KV / Upstash Redis if configured,
 * or serves as a fallback API handler so Vercel never returns 404/HTML errors.
 */

const fs = require('fs');
const path = require('path');

const TMP_FILE = path.join('/tmp', 'csp_data.json');

// Helper to interact with Vercel KV / Upstash Redis REST API
async function getKvData() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/csp_vault_data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result) {
      return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    }
  } catch (err) {
    console.error('KV get error:', err);
  }
  return null;
}

async function setKvData(data) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  try {
    const res = await fetch(`${url}/set/csp_vault_data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(typeof data === 'string' ? data : JSON.stringify(data))
    });
    return res.ok;
  } catch (err) {
    console.error('KV set error:', err);
    return false;
  }
}

// Fallback to /tmp memory file
function getTmpData() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8') || '{}');
    }
  } catch (e) {}
  return {
    records: {},
    deposits: [],
    payouts: [],
    settings: { centerName: 'CSP Daily Balance Manager', password: '' }
  };
}

function saveTmpData(data) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Load existing data: KV first, then /tmp fallback
  const isKvActive = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  let vaultData = await getKvData();
  if (!vaultData) {
    vaultData = getTmpData();
  }

  // Ensure structure
  vaultData.records = vaultData.records || {};
  vaultData.deposits = vaultData.deposits || [];
  vaultData.payouts = vaultData.payouts || [];
  vaultData.settings = vaultData.settings || { centerName: 'CSP Daily Balance Manager', password: '' };

  // 1. GET /api/status
  if (pathname === '/api/status' || pathname.endsWith('/status')) {
    return res.status(200).json({
      status: 'online',
      environment: 'vercel',
      kvConnected: isKvActive,
      serverTime: new Date().toISOString()
    });
  }

  // 2. GET /api/all-data
  if (pathname === '/api/all-data' || pathname.endsWith('/all-data')) {
    return res.status(200).json({
      success: true,
      kvConnected: isKvActive,
      records: vaultData.records,
      deposits: vaultData.deposits,
      payouts: vaultData.payouts,
      settings: vaultData.settings,
      serverTime: new Date().toISOString()
    });
  }

  // 3. POST /api/sync-all
  if (pathname === '/api/sync-all' || pathname.endsWith('/sync-all')) {
    const body = req.body || {};
    if (body.records) vaultData.records = body.records;
    if (body.deposits) vaultData.deposits = body.deposits;
    if (body.payouts) vaultData.payouts = body.payouts;
    if (body.settings) vaultData.settings = body.settings;

    if (isKvActive) {
      await setKvData(vaultData);
    } else {
      saveTmpData(vaultData);
    }

    return res.status(200).json({
      success: true,
      kvConnected: isKvActive,
      message: 'Data saved successfully'
    });
  }

  // 4. GET /api/day
  if (pathname === '/api/day' || pathname.endsWith('/day')) {
    const date = url.searchParams.get('date');
    return res.status(200).json({
      success: true,
      date: date,
      record: vaultData.records[date] || null
    });
  }

  // 5. POST /api/save
  if (pathname === '/api/save' || pathname.endsWith('/save')) {
    const body = req.body || {};
    if (!body.date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const existing = vaultData.records[body.date] || {};
    vaultData.records[body.date] = { ...existing, ...body, updatedAt: new Date().toISOString() };
    
    if (isKvActive) {
      await setKvData(vaultData);
    } else {
      saveTmpData(vaultData);
    }

    return res.status(200).json({ success: true, record: vaultData.records[body.date] });
  }

  // 6. Deposits
  if (pathname === '/api/deposits' || pathname.endsWith('/deposits')) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, deposits: vaultData.deposits });
    }
    const body = req.body || [];
    vaultData.deposits = Array.isArray(body) ? body : (body.deposits || vaultData.deposits);
    if (isKvActive) {
      await setKvData(vaultData);
    } else {
      saveTmpData(vaultData);
    }
    return res.status(200).json({ success: true, message: 'Deposits saved' });
  }

  // 7. Payouts
  if (pathname === '/api/payouts' || pathname.endsWith('/payouts')) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, payouts: vaultData.payouts });
    }
    const body = req.body || [];
    vaultData.payouts = Array.isArray(body) ? body : (body.payouts || vaultData.payouts);
    if (isKvActive) {
      await setKvData(vaultData);
    } else {
      saveTmpData(vaultData);
    }
    return res.status(200).json({ success: true, message: 'Payouts saved' });
  }

  // 8. Settings
  if (pathname === '/api/settings' || pathname.endsWith('/settings')) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, settings: vaultData.settings });
    }
    const body = req.body || {};
    vaultData.settings = { ...vaultData.settings, ...body };
    if (isKvActive) {
      await setKvData(vaultData);
    } else {
      saveTmpData(vaultData);
    }
    return res.status(200).json({ success: true, settings: vaultData.settings });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
};

