const http = require('http');
const fs = require('fs');
const path = require('path');

let latestData = null;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // POST /update — main app sends build data
  if (req.method === 'POST' && req.url === '/update') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { latestData = JSON.parse(body); } catch {}
      res.writeHead(200); res.end('ok');
    });
    return;
  }

  // GET /data — overlay polls for latest build
  if (req.method === 'GET' && req.url === '/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(latestData));
    return;
  }

  // Serve static files (overlay.html, images, fonts)
  const urlPath = req.url === '/' ? '/overlay.html' : req.url.split('?')[0];
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

const PORT = process.env.PORT || 3030;
}).listen(PORT, () => {
  console.log(`Deadlock overlay relay running on port ${PORT}`);
});
