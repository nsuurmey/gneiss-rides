# Gneiss Rides

A client-side web app that overlays your cycling ride data onto geologic maps. Upload a TCX file and see your route colored by the underlying geology, with an elevation profile showing geologic formations along the way.


![Alt text](midjourney-gneiss-rides.png)

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

## Getting started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the URL printed in your terminal (typically `http://localhost:5173`).

## Usage

1. **Upload a ride file** — Drag and drop a `.tcx` file onto the landing page, or click to browse your filesystem.
2. **Wait for processing** — The app parses your GPS data and queries the [Macrostrat API](https://macrostrat.org/) for geologic information along your route. A progress bar tracks the lookup.
3. **Explore the dashboard** — Once processing completes you'll see:
   - **Map** — Your ride path drawn on an OpenStreetMap base layer, with each segment colored by geologic age.
   - **Elevation profile** — A distance-vs-elevation chart with color bands representing the geologic units you rode over.
   - **Legend** — Formation names, geologic intervals, and lithology for every unit on your route.
4. **Start over** — Click "New ride" in the header to upload a different file.

## Supported file formats

| Format | Status |
|--------|--------|
| `.tcx` | Supported |
| `.gpx` | Planned (Phase 2) |

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

## License

Apache 2.0 — see [LICENSE](LICENSE).
