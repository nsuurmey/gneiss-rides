# Gneiss Rides — Implementation Plan

## Technologies

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React (Vite + TypeScript) | Fast dev server, tree-shaking, static-hostable output |
| Map | Leaflet + react-leaflet | Free, no API key required, good tile-layer support |
| Charts | D3.js | Full control over custom geo-profile graph with color bands |
| File parsing | xml2js (or browser DOMParser) | Parse TCX/GPX XML client-side |
| Export | html2canvas or dom-to-image | Render dashboard to high-res PNG |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Hosting | GitHub Pages / Vercel | Static output, zero server cost |
| Testing | Vitest + React Testing Library | Vite-native, fast unit/component tests |

## File Structure

```
gneiss-rides/
├── docs/
│   └── plan.md
├── framing/                     # existing PRD & workflow docs
├── public/
│   └── sample.tcx               # sample file for development
├── src/
│   ├── main.tsx                  # entry point
│   ├── App.tsx                   # root layout & state
│   ├── components/
│   │   ├── FileDropzone.tsx      # drag-and-drop upload
│   │   ├── LoadingScreen.tsx     # processing state with geo-themed messages
│   │   ├── MapView.tsx           # Leaflet map with geologic overlay + ghost marker
│   │   ├── GeoProfile.tsx        # D3 elevation/geology graph + scrubber line
│   │   ├── Legend.tsx            # color legend (Age | Formation format)
│   │   ├── ControlBar.tsx        # toggles, unit selectors
│   │   └── ExportButton.tsx      # trigger high-res render
│   ├── hooks/
│   │   └── useActivePoint.ts     # shared activePoint state (observer pattern)
│   ├── lib/
│   │   ├── parseTcx.ts           # TCX → TrackPoint[]
│   │   ├── parseGpx.ts           # GPX → TrackPoint[] (fallback)
│   │   ├── downsample.ts         # reduce points for API limits
│   │   ├── haversine.ts          # distance calc (Haversine formula)
│   │   ├── macrostrat.ts         # fetch geology per coordinate
│   │   ├── forwardFill.ts        # zero-order hold geology fill logic
│   │   └── exportImage.ts        # render dashboard to PNG (fit-to-bounds)
│   ├── types/
│   │   └── index.ts              # shared TypeScript interfaces
│   └── styles/
│       └── index.css             # Tailwind directives + custom styles
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── vitest.config.ts
```

## Core Types

```ts
interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number;      // meters
  time: string;           // ISO timestamp
  heartRate?: number;
  distance: number;       // cumulative, km
}

interface GeoUnit {
  unitId: number;         // Macrostrat unit_id (used for transition detection)
  formationName: string;
  interval: string;       // e.g. "Cretaceous"
  lithology: string;      // e.g. "Sandstone"
  ageColor: string;       // USGS hex
  lithColor: string;      // USGS hex
  ageStart: number;       // Ma
  ageEnd: number;         // Ma
}

interface EnrichedPoint extends TrackPoint {
  geology: GeoUnit | null;
}

// V3: shared cursor state for bi-directional linked tooltips
interface ActivePointState {
  index: number | null;    // index into EnrichedPoint[]
  source: 'map' | 'graph' | null;
}
```

## Features & Tasks

### 1. TCX/GPX File Ingestion
- [ ] Parse TCX XML to extract lat, lon, elevation, time, heart rate
- [ ] Parse GPX XML as fallback format
- [ ] Compute cumulative distance via Haversine formula
- [ ] Downsample points to respect Macrostrat rate limits

### 2. Macrostrat API Integration
- [ ] Query `https://macrostrat.org/api/geologic_units/map` per coordinate
- [ ] Extract formation name, geologic interval, lithology, USGS hex colors
- [ ] Batch/throttle requests to stay within rate limits
- [ ] Handle unmapped coordinates gracefully (null geology)

### 3. Drag-and-Drop Upload UI
- [ ] Full-page dropzone accepting .tcx and .gpx files
- [ ] File validation (correct XML structure, has GPS data)
- [ ] Loading screen with geo-themed status messages

### 4. Interactive Map View
- [ ] Render ride path on Leaflet map
- [ ] Color path segments by geologic unit (age or lithology)
- [ ] Adjustable transparency overlay for geologic context
- [ ] Fit map bounds to ride extent

### 5. Geo-Profile Graph
- [ ] D3 area chart: X = distance, Y = elevation
- [ ] Vertical color bands behind the profile representing geologic units
- [ ] Secondary Y-axis options: heart rate, speed
- [ ] Hover tooltip showing formation name, age, lithology
- [ ] Toggle dropdown: age-based vs lithology-based coloring

### 6. Legend & Controls
- [ ] Dynamic legend listing visible geologic units with color swatches
- [ ] Unit toggle (miles/km, ft/m)
- [ ] Color-scheme selector (age vs lithology)

### 7. Export Engine
- [ ] Render combined map + profile + legend to canvas
- [ ] Output 1080x1080 and 1920x1080 PNG options
- [ ] White/null sections for unmapped coordinates
- [ ] Download trigger with filename based on ride date

### 8. Bi-Directional Linked Tooltips (V3)
- [ ] Create shared `activePoint` state via `useActivePoint` hook (observer pattern)
- [ ] Graph-to-Map: hovering on elevation profile shows ghost marker at corresponding GPS location
- [ ] Map-to-Graph: hovering on ride path shows vertical scrubber line on graph at matching distance
- [ ] Broadcast point index/timestamp from source component; update complementary component in real-time

### 9. Continuous Geology Shading — Forward Fill (V3)
- [ ] Implement zero-order hold: carry previous formation color forward until a new `unit_id` appears
- [ ] Render geology backgrounds as continuous polygons instead of individual bars
- [ ] Trigger color transitions only where API data indicates a different `unit_id`
- [ ] When API returns "No Data", stop shading (transparent/white) until valid data reappears

### 10. Legend Hierarchy Refinement (V3)
- [ ] Change legend label format to `[Geologic Age] | [Formation Name]` (e.g. "Cretaceous | Dakota Sandstone")

### 11. Export Bug Fixes (V3)
- [ ] Fix path disappearing/shifting: force path re-render using exact map bounding box at capture time
- [ ] Lock path overlay CRS to base layer during `toBlob()` / `toDataURL()` conversion
- [ ] Fix black borders: calculate ride bounding box + 10% buffer and set canvas dimensions to match ride aspect ratio
- [ ] Crop final output to min/max lat/lon of ride (fit-to-bounds logic)

## Phases

### Phase 1 — MVP

Goal: A working end-to-end flow from file upload to viewable dashboard.

| # | Task | Files |
|---|------|-------|
| 1 | Project scaffold (Vite + React + TS + Tailwind) | `package.json`, config files |
| 2 | Define shared types | `src/types/index.ts` |
| 3 | TCX parser | `src/lib/parseTcx.ts` |
| 4 | Haversine distance calculator | `src/lib/haversine.ts` |
| 5 | Point downsampler | `src/lib/downsample.ts` |
| 6 | Macrostrat API client | `src/lib/macrostrat.ts` |
| 7 | Drag-and-drop file upload | `src/components/FileDropzone.tsx` |
| 8 | Loading screen | `src/components/LoadingScreen.tsx` |
| 9 | Map view with colored path | `src/components/MapView.tsx` |
| 10 | Geo-profile graph (elevation + color bands) | `src/components/GeoProfile.tsx` |
| 11 | Legend component | `src/components/Legend.tsx` |
| 12 | Dashboard layout (App.tsx wiring) | `src/App.tsx` |

### Phase 2 — Polish

Goal: Complete feature set, export capability, and UX refinements.

| # | Task | Files |
|---|------|-------|
| 13 | GPX fallback parser | `src/lib/parseGpx.ts` |
| 14 | Age vs lithology toggle | `src/components/ControlBar.tsx` |
| 15 | Secondary axes (heart rate, speed) on profile | `src/components/GeoProfile.tsx` |
| 16 | Hover tooltips on profile graph | `src/components/GeoProfile.tsx` |
| 17 | Unit toggle (imperial/metric) | `src/components/ControlBar.tsx` |
| 18 | Map transparency slider | `src/components/MapView.tsx` |
| 19 | Export engine (PNG render) | `src/lib/exportImage.ts`, `src/components/ExportButton.tsx` |
| 20 | 1080x1080 and 1920x1080 export presets | `src/lib/exportImage.ts` |
| 21 | Error handling & edge cases | across all files |
| 22 | Unit & component tests | `src/**/*.test.ts(x)` |

### Phase 3 — V3 (Synchronized Views & Export Stability)

Goal: Synchronized map/graph interaction, continuous geology shading, legend refinement, and production-quality export.

| # | Task | Files |
|---|------|-------|
| 23 | Shared `activePoint` hook (observer pattern) | `src/hooks/useActivePoint.ts`, `src/types/index.ts` |
| 24 | Graph-to-Map ghost marker on hover | `src/components/MapView.tsx`, `src/components/GeoProfile.tsx` |
| 25 | Map-to-Graph vertical scrubber on hover | `src/components/GeoProfile.tsx`, `src/components/MapView.tsx` |
| 26 | Forward-fill geology shading (zero-order hold) | `src/lib/forwardFill.ts`, `src/components/GeoProfile.tsx` |
| 27 | Continuous polygon rendering for geology bands | `src/components/GeoProfile.tsx` |
| 28 | No-data gap handling (transparent until valid data) | `src/lib/forwardFill.ts` |
| 29 | Legend label format: Age \| Formation | `src/components/Legend.tsx` |
| 30 | Export fix: path re-render with locked CRS at capture | `src/lib/exportImage.ts`, `src/components/MapView.tsx` |
| 31 | Export fix: fit-to-bounds cropping (ride bbox + 10% buffer) | `src/lib/exportImage.ts` |
| 32 | V3 integration tests | `src/**/*.test.ts(x)` |

## API Reference

**Macrostrat Geologic Units**
```
GET https://macrostrat.org/api/geologic_units/map?lat={lat}&lng={lon}
```
Returns formation name, age interval, lithology, and USGS color codes.

## Constraints
- All GPS processing happens client-side (no server storage of user data).
- Standard 2-hour ride file must process in under 3 seconds.
- Output must be statically hostable (no backend required).

## V3 Success Metrics
- **Visual Accuracy:** 100% color continuity on geology bar for contiguous formations.
- **Export Fidelity:** Zero reported cases of path shifting in user-generated images.
- **Engagement:** Increased Export button usage due to improved aesthetic quality.
