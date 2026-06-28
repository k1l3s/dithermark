# Dithermark Desktop

A self-contained macOS desktop build of Dithermark (Electron).

The web app references assets with absolute paths and uses web workers, neither
of which works under `file://`. So `main.cjs` runs a tiny static HTTP server on
`127.0.0.1` (inside the Electron main process — no external server) and points
the window at it. Cross-origin-isolation headers are sent so `SharedArrayBuffer`
is available (faster dither-worker path).

Video conversion and Unsplash "Random image" are intentionally dropped — they
need the Node backend and aren't part of this standalone build. Core dithering,
the full palette UI, and the Amstrad CPC "Override colors" feature all work.

## Rebuild

From the **repo root**, regenerate the production web bundle first:

```sh
npm run deploy            # builds deploy/public_html (HTML + minified JS)
```

Then from **this `desktop/` directory**:

```sh
npm install               # first time only (Electron + electron-builder)
npm start                 # run the app in dev (copies web build, launches Electron)
npm run dist              # package dist/mac-arm64/Dithermark.app
```

`npm run prep` (run automatically by `start`/`dist`) copies
`../deploy/public_html` into `./web`, which is what gets bundled into the app.

## Install

After `npm run dist`, drag `dist/mac-arm64/Dithermark.app` into `/Applications`.

The app is **not notarized**, so on first launch macOS Gatekeeper will block it.
Right-click the app → **Open** → **Open** (only needed once), or allow it under
System Settings → Privacy & Security.
