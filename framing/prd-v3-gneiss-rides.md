# Product Requirements Document: Gneiss Rides (V3.0)

## 1. Document Objective

The objective of V3 is to synchronize the spatial and temporal data views to allow for better cross-referencing and to stabilize the "Export to Image" feature for professional social sharing (Strava/LinkedIn).

---

## 2. New Feature Specifications

### 2.1 Bi-Directional Linked Tooltips (The "Observer" Pattern)

To allow for precise correlation between terrain and performance, the map and the elevation/geology graph must be state-linked.

* **Graph-to-Map:** Hovering over any point on the Elevation/Geology profile must trigger a "ghost marker" or highlight the corresponding GPS coordinate on the map.
* **Map-to-Graph:** Hovering over the ride path on the map must trigger a vertical "scrubber line" on the graph at the corresponding distance/time.
* **Technical Requirement:** Implement a shared `activePoint` state. When the cursor enters one component, it broadcasts the `index` or `timestamp` to the other component to update the UI in real-time.

### 2.2 Continuous Geology Shading (Forward-Fill Logic)

Current visualizations show "gaps" or color mixing between sampled points. V3 will implement a "Zero-Order Hold" logic for geologic units.

* **Requirement:** Unless the Macrostrat API explicitly returns a new formation, the previous formation's color must be "stretched" continuously to the next point.
* **Logic:** Instead of individual bars, the geology background should be rendered as continuous polygons. A color change should only occur at the boundary where the API indicates a new `unit_id`.
* **Edge Case:** If a "No Data" result is returned, the fill should cease (transparent/white) until the next valid data point is found, rather than interpolating between two distant known units.

### 2.3 UI/UX: Legend Hierarchy Refinement

To align with professional stratigraphic standards, the legend labels will be re-ordered.

* **Format:** `[Geologic Age] | [Formation Name]`
* **Example:** "Cretaceous | Dakota Sandstone" (instead of "Dakota Sandstone | Cretaceous").

---

## 3. Bug Fixes & Technical Stability (Export Engine)

### 3.1 PNG Export: Path Integrity

**Issue:** The ride path disappears or "shifts" relative to the geologic map during export.

* **Root Cause Analysis:** This usually stems from a mismatch between the **Canvas Render Resolution** and the **SVG Path Projection**.
* **Requirement:** The export function must force a re-render of the path using the exact bounding box of the map at the moment of capture.
* **Fix:** Ensure the coordinate system (CRS) of the path overlay is locked to the map's base layer during the `toBlob` or `toDataURL` conversion process.

### 3.2 PNG Export: Aspect Ratio & "Black Space"

**Issue:** Exported images contain large black borders/negative space on the right.

* **Root Cause Analysis:** The canvas is capturing the browser's viewport extent rather than the data's bounding box.
* **Fix:** Implement a "Fit to Bounds" logic for export.
1. Calculate the `padding` around the ride coordinates.
2. Set the canvas dimensions to match the ride's aspect ratio.
3. Crop the final output to the `min/max` latitude and longitude of the ride, plus a 10% buffer.



---

## 4. Updated User Flow

1. **Upload:** User drops TCX.
2. **Analyze:** User hovers over a steep climb on the graph.
3. **Sync:** A marker appears on the map precisely at the switchback where the climb started.
4. **Confirm:** The legend shows "Permian | Cutler Group" at that exact spot.
5. **Export:** User clicks "Export." The system crops the image to the ride boundaries and generates a high-res PNG without black borders or shifted paths.

---

## 5. Success Metrics for V3

* **Visual Accuracy:** 100% color continuity on the geology bar for contiguous formations.
* **Export Fidelity:** 0% reported cases of "shifted paths" in user-generated images.
* **Engagement:** Increase in "Export" clicks due to the improved aesthetic of the final image.

