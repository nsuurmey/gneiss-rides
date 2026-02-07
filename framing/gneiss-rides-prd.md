# Product Requirements Document: Gneiss Rides (V1.0)

## 1. Product Vision & Problem Statement

**Vision:** To bridge the gap between physical performance and Earth history, providing geoscientists and outdoor enthusiasts with a narrative of the terrain they conquer.

**Problem:** Geologists and earth-science hobbyists often ride through complex terrain without a simple way to retrospectively correlate their physical exertion (heart rate/climb) with specific geologic formations. Existing tools (Strava, Garmin) focus on the *where* and *how fast*, but ignore the *what*—the lithology and age of the substrate.

---

## 2. Target Audience & User Personas

* **The Professional Geoscientist (Primary):** Needs technical accuracy and prefers USGS-standard visualizations. Uses the data for "passive" field reconnaissance or pure hobbyist enjoyment.
* **The "Geo-Curious" Athlete:** A mountain biker or trail runner who wants to learn about their local environment but isn't necessarily trained in stratigraphy.

---

## 3. Goals & Success Metrics (KPIs)

* **Core Goal:** Provide a seamless "Upload-to-Insight" workflow that takes less than 30 seconds.
* **KPI 1:** **Export Rate.** The percentage of users who download the high-resolution infographic for social sharing (Strava/Instagram).
* **KPI 2:** **API Latency.** Maintaining a < 3s processing time for a standard 2-hour ride file.

---

## 4. User Stories

* **As a rider,** I want to upload my `.tcx` file so that I can see my path overlaid on a geologic map.
* **As a geologist,** I want the elevation profile to be color-coded by geologic age so I can see if that "brutal climb" correlates with a specific hard-capped lithology (e.g., a basalt flow or limestone).
* **As a user,** I want to toggle between age-based colors and lithology-based colors to better understand the rock types I encountered.
* **As a Strava user,** I want a "clean" high-res export so I can show my followers that I climbed 1,000 feet of Precambrian granite today.

---

## 5. Functional Requirements (Features)

### 5.1 Data Ingestion & Processing

* **File Support:** Support for `.tcx` (primary) with fallback for `.gpx`.
* **Sampling Logic:** The system must downsample high-frequency GPS data (e.g., 1Hz) to a resolution that respects Macrostrat API limits while maintaining spatial accuracy at trail turns.
* **API Integration:** Dynamic lookup of `lat/lon` via Macrostrat.org to retrieve:
* Formation Name
* Interval/Age Name (e.g., "Cretaceous")
* Lithology (e.g., "Sandstone")
* Standard Hex Codes for USGS color schemes.



### 5.2 The Dashboard (The "Killer Feature")

* **Interactive Map View:** Mapbox or Leaflet-based map with a geologic overlay (transparency slider included).
* **The "Geo-Profile" Graph:**
* **X-Axis:** Distance (miles/km).
* **Y-Axis:** Elevation (primary), Heart Rate/Speed (secondary).
* **Background:** Vertical color bands representing geologic units.
* **Dynamic Labels:** Hovering over the graph reveals the specific Age Name or Lithology.


* **The Shading Toggle:** A dropdown menu to switch the color logic between **Geologic Age** and **Lithology**.

### 5.3 Export Engine

* **High-Res Render:** Generate a 1080x1080 or 1920x1080 image containing the map, the profile, and a legend.
* **"No Data" Handling:** If a coordinate falls outside a mapped polygon, that section of the bar chart/background remains white/null.

---

## 6. Non-Functional Requirements

* **Performance:** Client-side processing of the TCX file where possible to reduce server load.
* **Privacy:** No permanent storage of user GPS files; data is processed in-memory and discarded after the session (unless user accounts are added in V2).
* **Scalability:** The app should be "lightweight" enough to run on a basic static hosting service (GitHub Pages/Vercel).

---

## 7. User Flow & UX Considerations

1. **Land:** Simple "Drag & Drop" interface.
2. **Process:** Loading spinner with "Querying the Deep Past..." or similar geo-humor.
3. **Explore:** The dual-pane dashboard appears.
4. **Refine:** User selects "Lithology" from the dropdown to see rock types.
5. **Share:** Click "Export for Strava."

---

## 8. Future Roadmap (V2 and beyond)

* **Direct Integration:** Connect via Strava API to automatically pull latest rides.
* **Community Maps:** A "Heatmap" of which geologic formations are most "shredded" by the community.
* **Photo Integration:** Geotagged photos from the ride overlaid on the geologic map.
* **3D View:** A 3D terrain model (using Mapbox RGB elevation) with geology draped over the top.

---

### Critical Gap Check:

One detail we should nail down: **Coordinate Projection.** TCX files use  (decimal degrees). We’ll need to ensure the distance calculation on the X-axis of your graph uses a Haversine formula or similar to account for the Earth's curvature, especially for long-distance "epic" rides.

Distance Calculation: The Haversine FormulaTo calculate the distance between two GPS coordinates ($lat_1, lon_1$) and ($lat_2, lon_2$) on the X-axis of your graph, use the following:Formula:a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)c = 2 ⋅ atan2( √a, √(1−a) )d = R ⋅ cWhere:φ is latitude, λ is longitude (in radians)Δφ = $lat_2 - lat_1$Δλ = $lon_2 - lon_1$R is Earth's mean radius (use 6,371 km or 3,959 miles)d is the distance between the two points

