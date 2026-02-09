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

## Example Output

![Alt text](https://github.com/nsuurmey/gneiss-rides/blob/main/example-output-gneiss-rides.png)

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
