const http = require('http');
const fs = require('fs');
const path = require('path');

// Per-token data store
const store = new Map();

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // POST /update/:token
  const postMatch = req.method === 'POST' && req.url.match(/^\/update\/([a-zA-Z0-9_-]+)$/);
  if (postMatch) {
    const token = postMatch[1];
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { store.set(token, JSON.parse(body)); } catch {}
      res.writeHead(200); res.end('ok');
    });
    return;
  }

  // POST /reset/:token
  const resetMatch = req.method === 'POST' && req.url.match(/^\/reset\/([a-zA-Z0-9_-]+)$/);
  if (resetMatch) {
    store.delete(resetMatch[1]);
    res.writeHead(200); res.end('ok');
    return;
  }

  // GET /data/:token
  const getMatch = req.method === 'GET' && req.url.match(/^\/data\/([a-zA-Z0-9_-]+)$/);
  if (getMatch) {
    const token = getMatch[1];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(store.get(token) || null));
    return;
  }

  // Serve static files
  const urlPath = req.url === '/' ? '/overlay.html' : req.url.split('?')[0];
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(process.env.PORT || 3030, () => {
  console.log(`Deadlock overlay relay running on port ${process.env.PORT || 3030}`);
});
