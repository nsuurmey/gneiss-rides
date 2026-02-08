# Gneiss Rides

A client-side web app that overlays your cycling ride data onto geologic maps. Upload a TCX or GPX file and see your route colored by the underlying geology, with an elevation profile showing geologic formations — and the ancient fossils that lived there.

![Alt text](midjourney-gneiss-rides.png)

## What's in V4 (Fossil Finder)

V4 adds the **Paleobiology Database (PBDB)** integration, turning Gneiss Rides into a portable natural history museum:

- **Fossil Sidebar** — Hover over any geologic formation to see known fossil taxa (genus/species) from that area
- **Triple-Filter Queries** — Fossils are matched by spatial bounding box, geologic age, and formation name to avoid false matches
- **Fossil Indicators** — Small icons on the elevation profile mark fossiliferous sections of your ride
- **Image Search** — Click any fossil entry to search for specimen images without leaving the app
- **Direct PBDB Links** — Every fossil occurrence links to its official Paleobiology Database page

All previous features (geologic map overlay, elevation profile, GPX/TCX support, PNG export) remain fully functional.

---

## Running on a Chromebook (Linux / Beginner Guide)

This section walks you through everything from scratch. No prior programming experience needed.

### Step 1: Enable Linux on your Chromebook

1. Open **Settings** (click the clock in the bottom-right, then the gear icon)
2. In the left sidebar, click **Advanced** > **Developers**
3. Next to "Linux development environment", click **Turn on**
4. Follow the prompts — accept the defaults for disk size (10 GB is fine)
5. A terminal window will open when setup finishes. This is where you'll type commands.

### Step 2: Update your system packages

Copy and paste each line into the terminal, then press Enter:

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Node.js

The version of Node.js in the default Chromebook repos is often too old. Use the NodeSource installer to get a current version:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify it worked:

```bash
node --version
npm --version
```

You should see `v20.x.x` (or higher) for node and `10.x.x` (or higher) for npm.

### Step 4: Install Git and clone the project

```bash
sudo apt install -y git
git clone https://github.com/nsuurmey/gneiss-rides.git
cd gneiss-rides
```

### Step 5: Install dependencies and start the app

```bash
npm install
npm run dev
```

You'll see output like:

```
  VITE v6.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Open the app

Open the **Chrome browser** on your Chromebook and go to:

```
http://localhost:5173
```

You should see the Gneiss Rides upload page.

### Step 7: Use the app

1. **Get a ride file** — Export a `.tcx` or `.gpx` file from Strava, Garmin Connect, or any GPS cycling app
2. **Drag and drop** the file onto the page (or click to browse)
3. **Wait for processing** — The app queries the Macrostrat API for geology along your route
4. **Explore the dashboard:**
   - **Map** — Your ride path colored by geologic age
   - **Elevation profile** — Distance vs. elevation with geologic color bands
   - **Legend** — Formation names, intervals, and lithology
   - **Fossil Sidebar** (V4) — Toggle "Discover Fossils" to load fossil data from PBDB
5. **Export** — Click the export button to save the dashboard as a PNG image

### Stopping and restarting

- To **stop** the dev server, press `Ctrl + C` in the terminal
- To **restart** later, open the Linux terminal and run:

```bash
cd gneiss-rides
npm run dev
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: node` | Re-run the Node.js install commands from Step 3 |
| `EACCES` permission errors | Don't use `sudo` with `npm install` — if your files are owned by root, run `sudo chown -R $USER:$USER ~/gneiss-rides` |
| Port 5173 already in use | Another dev server is running. Close it with `Ctrl + C` or use `npm run dev -- --port 3000` |
| Browser shows "This site can't be reached" | Make sure the terminal still shows the dev server running. Try `http://localhost:5173` (not https) |
| `npm install` hangs or is very slow | Your Chromebook may be low on memory. Close other tabs and try again |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

## Getting started

```bash
npm install
npm run dev
```

Open the URL printed in your terminal (typically `http://localhost:5173`).

## Supported file formats

| Format | Status |
|--------|--------|
| `.tcx` | Supported |
| `.gpx` | Supported |

## Building for production

```bash
npm run build
```

Static output is written to `dist/` and can be deployed to any static host (GitHub Pages, Vercel, Netlify, etc.).

## Running tests

```bash
npm test
```

## Tech stack

- React 18 + TypeScript (Vite)
- Tailwind CSS
- Leaflet (map)
- D3.js (elevation profile chart)
- Macrostrat API (geologic data)
- Paleobiology Database / PBDB (fossil data)

## License

Apache 2.0 — see [LICENSE](LICENSE).
