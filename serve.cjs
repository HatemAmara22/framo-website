const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const routes = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/privacy.html', ['privacy.html', 'text/html; charset=utf-8']],
  ['/landing.css', ['landing.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']],
  ['/assets/coast.svg', [path.join('assets', 'coast.svg'), 'image/svg+xml']],
  ['/assets/boat.svg', [path.join('assets', 'boat.svg'), 'image/svg+xml']],
  ['/assets/favicon.svg', [path.join('assets', 'favicon.svg'), 'image/svg+xml']],
  ['/assets/framo-icon.png', [path.join('assets', 'framo-icon.png'), 'image/png']],
  ['/assets/framo-icon-rounded.png', [path.join('assets', 'framo-icon-rounded.png'), 'image/png']],
]);

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  const pathname = request.url.split('?')[0];
  // Any picture or font in assets/ (and assets/fonts/) works without listing it here (names only: no folders, no '..').
  const types = { svg: 'image/svg+xml', png: 'image/png', woff2: 'font/woff2' };
  const match = /^\/assets\/((?:fonts\/)?[\w-]+)\.(svg|png|woff2)$/.exec(pathname);
  const asset = match ? [path.join('assets', ...`${match[1]}.${match[2]}`.split('/')), types[match[2]]] : null;
  const route = routes.get(pathname) || asset;
  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  fs.readFile(path.join(__dirname, route[0]), (error, data) => {
    if (error) {
      response.writeHead(500);
      response.end('Unable to read website asset');
      return;
    }
    response.writeHead(200, { 'Content-Type': route[1], 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', (error) => {
  console.error(`Preview server could not start: ${error.message}`);
  process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => console.log('Framo preview: http://127.0.0.1:4173'));
