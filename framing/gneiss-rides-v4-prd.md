# Supplemental PRD: Gneiss Rides (V4.0) - The Fossil Finder

## 1. Feature Vision

**"Gneiss Rides: Deep Time Edition."**
V4.0 transforms the app into a portable natural history museum. By integrating the **Paleobiology Database (PBDB)**, we allow users to see the ancient life forms that once inhabited the very formations they are cycling across.

---

## 2. Functional Requirements

### 2.1 The "Fossil Sidebar" (Information Layer)

* **Trigger:** When a user hovers over the **Map** or the **Elevation/Geology Graph**, the current formation is highlighted (from V3 logic).
* **Action:** A collapsible sidebar (or "Drawer") becomes active.
* **Content:**
* A list of known taxa (Genus/Species) associated with that formation and geographic bounding box.
* Classification info (e.g., "Invertebrate | Brachiopod").
* A "Search for Images" button for each fossil entry.



### 2.2 The "Visual Search" Integration

* **Requirement:** Users shouldn't have to leave the app to see the fossils.
* **Logic:** Clicking the "Search for Images" button should trigger a curated search (via Google Custom Search API or a similar lightweight modal) that displays images of the fossil.
* **Search Query Optimization:** The app should automatically format the search as: `[Fossil Name] + [Formation Name] + "fossil specimen"` to ensure high-quality, relevant results.

---

## 3. Data Integration Strategy (The PBDB Join)

Matching your GPS track to the Paleobiology Database requires a three-factor authentication to prevent "Ghost Fossils" (showing fossils that don't exist in your area).

### The "Triple-Filter" Logic:

To populate the sidebar, the app must query the `pbdb.org/data1.2/occs/list.json` API using these parameters:

1. **Spatial Filter:** Use the `lngmin, lngmax, latmin, latmax` of the current "hovered" segment of the ride.
2. **Temporal Filter:** Use the `max_ma` and `min_ma` (Millions of years) retrieved from Macrostrat in V3.
3. **Stratigraphic Filter:** Pass the `stratgroup` or `formation` name as a secondary keyword search to narrow the results.

---

## 4. User Interface & Experience (UX)

### 4.1 The "Fossil Indicator" on the Graph

* The Geology Bar Chart (X-axis) should have small **Fossil Icons** (e.g., a tiny ammonite or bone icon) placed atop segments where the PBDB returns a high density of occurrences. This alerts the rider: *"Hey, this section was particularly fossiliferous!"*

### 4.2 Sidebar Controls

* **Filter by Type:** A toggle to show only "Vertebrates," "Invertebrates," or "Plants."
* **Direct Link:** Each entry should link back to the official PBDB occurrence page for professional verification.

---

## 5. Technical Constraints & Logic Gaps

* **API Latency:** PBDB queries can be heavy.
* **Solution:** We will fetch fossil data **asynchronously** only when a user clicks a "Discover Fossils" toggle to avoid slowing down the initial map render.


* **Coordinate Precision:** Fossils are often mapped to a general area, not a specific trail coordinate.
* **Solution:** The app should display a disclaimer: *"Fossils listed are known to occur within this formation in this region, not necessarily on this exact trail."*



---

## 6. Success Metrics for V4

* **Discovery Rate:** Average number of "Fossil Searches" performed per ride upload.
* **Educational Depth:** Percentage of users who keep the Fossil Sidebar open for more than 60 seconds.

---