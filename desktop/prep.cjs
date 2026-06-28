// Copies the production web build (../deploy/public_html) into ./web so it can be
// bundled into the Electron app. Run `npm run deploy` in the repo root first to
// regenerate the web build.
const fs = require('fs');
const path = require('path');

const SOURCE = path.resolve(__dirname, '..', 'deploy', 'public_html');
const DEST = path.resolve(__dirname, 'web');

if (!fs.existsSync(path.join(SOURCE, 'index.html'))) {
    console.error(
        `\nMissing web build at ${SOURCE}.\n` +
            `Run "npm run deploy" in the repo root first, then retry.\n`
    );
    process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(SOURCE, DEST, { recursive: true });

console.log(`Copied web build:\n  ${SOURCE}\n  -> ${DEST}`);
