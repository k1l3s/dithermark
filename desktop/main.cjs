// Electron main process for the self-contained Dithermark desktop app.
//
// The web app references its assets with absolute paths (/assets/app.js) and
// spawns web workers, neither of which works under the file:// protocol. So
// instead of loadFile(), we run a tiny static HTTP server bound to localhost
// (inside this process — no external server) and point the window at it. The
// COOP/COEP/CORP headers enable cross-origin isolation so SharedArrayBuffer is
// available, which lets the dither workers share image buffers (faster path).

const { app, BrowserWindow, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEB_ROOT = path.join(__dirname, 'web');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.wasm': 'application/wasm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

function sendError(res, status) {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${status}`);
}

function createStaticServer() {
    return http.createServer((req, res) => {
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch {
            return sendError(res, 400);
        }
        if (pathname === '/' || pathname === '') {
            pathname = '/index.html';
        }

        // resolve and guard against path traversal outside the web root
        const filePath = path.join(WEB_ROOT, pathname);
        if (filePath !== WEB_ROOT && !filePath.startsWith(WEB_ROOT + path.sep)) {
            return sendError(res, 403);
        }

        fs.stat(filePath, (err, stat) => {
            if (err || !stat.isFile()) {
                return sendError(res, 404);
            }
            const headers = {
                'Content-Type':
                    MIME_TYPES[path.extname(filePath).toLowerCase()] ||
                    'application/octet-stream',
                'Content-Length': stat.size,
                // cross-origin isolation -> enables SharedArrayBuffer
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cross-Origin-Resource-Policy': 'same-origin',
            };
            res.writeHead(200, headers);
            const stream = fs.createReadStream(filePath);
            stream.on('error', () => sendError(res, 500));
            stream.pipe(res);
        });
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        const server = createStaticServer();
        server.on('error', reject);
        // port 0 -> OS assigns a free port; bound to loopback only
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            resolve(`http://127.0.0.1:${port}`);
        });
    });
}

function createWindow(baseUrl) {
    const win = new BrowserWindow({
        width: 1280,
        height: 860,
        backgroundColor: '#0d0d0d',
        title: 'Dithermark',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // open external links (FAQ, Source) in the user's default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://127.0.0.1')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    win.loadURL(baseUrl);
}

app.whenReady()
    .then(startServer)
    .then(baseUrl => {
        createWindow(baseUrl);
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow(baseUrl);
            }
        });
    })
    .catch(err => {
        console.error('Failed to start Dithermark:', err);
        app.quit();
    });

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
