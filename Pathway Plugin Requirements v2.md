# Pathway Plugin Requirements v2

# Objective

Enable people to easily share stories which connect a narrative (the story) to the space over which it occurred (the map). Primarily for travel/hiking/expedition content.

The functionality will be provided by a WordPress plugin which works alongside any block theme to allow users to read a story (consisting of text, images, and videos) which relate to a map (consisting of a route/track and waypoints).

## Use Case Examples

- Travel blogger wanting to share a story about a hike or a road trip
- Runner wanting to showcase their favourite runs
- Expedition company wanting to share the route that their tour follows
- Journalist/historian wanting to illustrate a story related to a trading route

## Inspiration

- [Koya Bound](https://walkkumano.com/koyabound/)
- [Animated Map Path for Interactive Storytelling](http://tympanus.net/codrops/2015/12/16/animated-map-path-for-interactive-storytelling/)
- [Riding the New Silk Road](https://www.nytimes.com/newsgraphics/2013/07/21/silk-road/index.html)
- [The Great New Zealand Road Trip](https://ucnz.maps.arcgis.com/apps/MapJournal/index.html?appid=0af109d093dd477faeb299fb26d3c7a8) (ArcGIS StoryMaps)

---

# Definitions

- **Waypoint** `<wpt>`: An intermediate point or place on a route or line of travel
    - One specific GPS coordinate (latitude/longitude) with a name or description
    - Manually created - "drop a pin" or "mark location"
    - Examples: "Trailhead," "Summit," "Good viewpoint," "Water source"
    - **Note:** GPX waypoints will NOT be displayed in MVP. Only Map Marker blocks create visible pins.
- **Route** `<rte>`: An ordered series of two or more waypoints (planned path)
    - A series of waypoints defining an intended path
    - **Note:** Not displayed in MVP.
- **Track** `<trk>`: An ordered list of points describing a path in detail (actual recorded path)
    - A breadcrumb trail of GPS coordinates recorded as you move
    - Captured automatically at intervals during activity
    - **This is what will be displayed on the map.**
- **Map Marker** (editorial): A waypoint tied to narrative sections, defined by the editor using Map Marker blocks

---

# Core Blocks

## Map GPX Block

**Purpose:** Upload and reference the GPX file for the entire journey.

**Quantity:** One per post/page (recommended). Multiple blocks will trigger an editor warning; only the first will be used.

**Attributes:**

- `attachmentId` (int): WordPress media library attachment ID of the GPX file
- `fileName` (string): Display name for editor
- `pointCount` (int): Number of track points (for editor display)
- `bounds` (object): `{north, south, east, west}` for initial map view

**Editor Display:**

- Simple text placeholder: "GPX uploaded: `filename.gpx` (X points)"
- No live map preview in editor
- Shows warnings:
    - Missing GPX file
    - Invalid GPX format
    - Empty GPX (no tracks)
    - File size > 10MB
    - Point count > 50k points
    - Multiple Map GPX blocks detected

**Frontend Render:**

- Renders as `<div class="pathway-map-gpx" data-attachment-id="123" data-bounds="..."></div>`
- On mobile, this div can be targeted for map placement via CSS
- Contains no visible content by default

**GPX File Handling:**

- Uploaded to WordPress media library (standard attachment)
- File constraints: 10MB max, 50k points max (soft limits with warnings)
- If deleted: show broken attachment placeholder in editor, graceful failure on frontend

---

## Map Marker Block

**Purpose:** Mark significant locations in the story that trigger map pan/zoom.

**Quantity:** Zero or many per post/page.

**Attributes:**

- `id` (string): Unique identifier (auto-generated)
- `title` (string): Marker label (displayed on map pin)
- `lat` (float): Latitude (decimal degrees)
- `lng` (float): Longitude (decimal degrees)
- `address` (string, optional): Editor note/reference only, not used programmatically
- `zoom` (int, optional): Override zoom level (default: 14)

**Editor Display:**

- Placeholder showing: `📍 [title] (lat, lng)`
- Input fields:
    - Title (text)
    - Latitude (text, decimal degrees, e.g., `51.5074`)
    - Longitude (text, decimal degrees, e.g., `0.1278`)
    - Address (text, helper/note only)
    - Zoom level (number, optional)
- Validation warnings:
    - Missing lat/lng
    - Marker is X km from GPX track
    - No Map GPX block found

**Frontend Render:**

- Renders as `<div class="pathway-marker" data-lat="X" data-lng="Y" data-title="..." data-zoom="14"></div>`
- Invisible by default (acts as scroll trigger)
- Theme can optionally style as visible anchor (e.g., subtle icon with title)

**Relationship to GPX:**

- Independent of GPX `<wpt>` elements
- If no Map GPX block exists: warning in editor, marker displays but no path on frontend

---

# Frontend Display

## Layout

### Desktop/Tablet (≥768px)

- **Two-column grid layout with 3:2 width ratio (story:map)**
    - Left column: Story content (text, images, videos, Map Marker blocks)
    - Right column: Interactive map (sticky, full viewport height)
- Plugin provides default CSS:
    
    ```css
    .pathway-story-container {    display: grid;    grid-template-columns: 3fr 2fr;    gap: 2rem;}.pathway-map {    position: sticky;    top: 0;    height: 100vh;}
    
    ```
    
- Theme can override via higher specificity or `!important`

### Mobile (<768px)

- **Single column, sticky map at top**
- Map: `position: sticky; top: 0; height: 30vh;`
- Story content scrolls below
- Same scroll-follow behavior as desktop

---

## Map Behaviour

### On Page Load

- Display entire GPX track (zoomed to fit bounds)
- Map oriented north
- Track displayed as polyline
- No markers visible until scroll

### On Scroll (Follow Mode)

- **Active Marker Logic:**
    - Active marker = first Map Marker block whose top edge crosses 25% of viewport height
- **Map Response:**
    - Pan to active marker's lat/lng
    - Zoom to marker's zoom level (or default 14)
    - Transition: 800ms ease-in-out
    - Display marker pin at that location
- **Manual Interaction:**
    - If user manually pans/zooms map, follow mode is suspended
    - Any subsequent scroll event that changes active marker re-enables follow mode

### Map Clicks/Taps

- Clicking/tapping a marker pin on the map scrolls the story content to that Map Marker block

---

## **What's Displayed on Map**

### GPX Track

- `<trk>` elements rendered as polyline
- Default style: Blue (`#3388ff`), 3px width
- Zoomed to fit bounds on page load

### Map Markers

- Custom SVG pin design at locations defined by Map Marker blocks
- **Numbering:** Automatically numbered 1, 2, 3... in content order
- **Color:** Uses theme's primary color via CSS variable `wp--preset--color--primary`
    - Fallback: `#e74c3c` (red) if theme has no primary color
    - Optional: Editor can override via `pathway-marker-color` variable
- **On hover:** Display marker title as tooltip
- **On click:** Scroll story content to corresponding Map Marker block

### Not Displayed (MVP)

- GPX waypoints `<wpt>`
- GPX routes `<rte>`
- Moving/animated position marker along track
- Custom marker icons

### Map Configuration

- Tiles: OpenStreetMap (default)
- Default zoom: 14 (when following marker)
- Fit-to-bounds zoom on initial load
- Attribution: OSM + Leaflet required

---

# Technical Architecture

## Technology Stack

- **WordPress:** 6.0+ (Block API v2 stable)
- **PHP:** 7.4+ (WP 6.0 requirement)
- **JavaScript:** ES6+ (transpiled via @wordpress/scripts)
- **Map Library:** Leaflet.js (latest stable)
- **Map Tiles:** OpenStreetMap
- **Build Tool:** @wordpress/scripts
- **Browser Support:** Latest stable version of Chrome and Safari

## Data Architecture

### Storage Pattern

- **Everything in block attributes** (no custom DB tables, no post meta)
- GPX files stored in WordPress media library (standard attachments)
- Block relationships maintained via `attachmentId` references

### GPX Parsing

- **Client-side** using browser native XML parser
- Parse on page load (async to avoid blocking)
- Cache parsed coordinates in browser `sessionStorage` (invalidate on GPX change)
- Track simplification: Use Leaflet's built-in `smoothFactor` for tracks >10k points

### Performance Targets

- Initial map render: <1s on 3G
- Scroll-triggered pan/zoom: <100ms response time
- Support tracks up to 50k points (with decimation)

## File Structure

```
pathway/
├── pathway.php                 # Main plugin file
├── includes/
│   ├── class-pathway.php       # Core plugin class
│   └── blocks/
│       ├── map-gpx/
│       │   ├── block.json
│       │   ├── edit.js
│       │   ├── save.js
│       │   └── style.css
│       └── map-marker/
│           ├── block.json
│           ├── edit.js
│           ├── save.js
│           └── style.css
├── assets/
│   ├── js/
│   │   └── pathway-frontend.js  # Map init & scroll handler
│   └── css/
│       └── pathway-frontend.css # Layout & map container
└── build/                       # Generated by @wordpress/scripts

```

---

# Block Editor Integration

## WordPress Block API

- Use Block API v2 (`"apiVersion": 2`)
- Register blocks via `block.json` (preferred method)
- Use `@wordpress/scripts` for build pipeline
- Follow WordPress Coding Standards

## Editor UX

- **No live map preview** in editor (MVP cut)
- **Metadata display only:**
    - Map GPX block shows filename, point count
    - Map Marker blocks show title, coordinates
- **Validation warnings** in sidebar:
    - Missing GPX file
    - Invalid coordinates
    - Marker outside GPX bounds
    - Multiple Map GPX blocks
    - Marker without GPX block

## Block Supports

- Map GPX: No alignment, no custom colors
- Map Marker: No alignment, basic color support for visible markers (if theme styles them)

---

# Error Handling

## Editor Errors

| Error | Behavior |
| --- | --- |
| No GPX file attached | Show warning, allow save |
| Invalid GPX format | Show error, block save until fixed |
| GPX file deleted | Show broken attachment, allow save |
| Multiple Map GPX blocks | Show warning (first used), allow save |
| Map Marker without GPX | Show warning, allow save |
| Invalid lat/lng | Show error, block save until fixed |
| Marker >50km from track | Show warning, allow save |

## Frontend Errors

| Error | Behavior |
| --- | --- |
| GPX file missing | No map displayed, no JS errors |
| GPX parse failure | Console warning, no map |
| No Map Markers | Show full track, no follow behavior |
| Marker with invalid coords | Skip that marker, log warning |

---

# Theme Compatibility

## Layout Ownership

- **Plugin provides default layout** via CSS (2-column grid on desktop)
- **Theme can override** using higher specificity selectors
- **Template support:** Plugin detects if theme provides custom template (future enhancement)

## Styling Inheritance

- Map Markers can inherit theme link colours, typography
- Map container uses theme's max-width/padding if available
- Minimal plugin-specific styles (just layout structure)

## Template Hierarchy (Future)

- Theme can provide `single-pathway.php` template
- Plugin falls back to standard `single.php` or `page.php`

---

# WordPress.org Plugin Requirements

Must comply with:

- [Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [Detailed Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- Key requirements:
    - GPL-compatible license
    - No phone-home or tracking without opt-in
    - No including external libraries without disclosure
    - Prefix all functions/classes/globals
    - Escape all output, sanitize all input
    - Use WordPress HTTP API for external requests
    - No cryptomining, SEO spam, or affiliate links

---

# Future Enhancements (Post-MVP)

## Phase 2

- Animated position marker moving along track between Map Markers
- Display GPX `<wpt>` waypoints as distinct pins
- Auto-generate Map Markers from photo EXIF GPS data

## Phase 3

- Elevation profile graph below map
- Multiple GPX files per post
- Display additional track data (heart rate, speed, elevation)

## Phase 4

- Alternative map tile providers (Mapbox, Google, Apple)
- Import from Strava/AllTrails/Komoot
- Export to GPX/KML

---

# Success Metrics (Post-Launch)

- Plugin activations on WordPress.org
- Map interaction rate (clicks, pans, zooms)
- Mobile vs desktop usage
- Average GPX file size/point count

---

# Definition of Done (MVP)

- [ ]  Map GPX block: upload, validate, store GPX files
- [ ]  Map Marker block: input lat/lng, title, optional zoom
- [ ]  Frontend: 2-column layout (desktop), sticky map at top (mobile)
- [ ]  Frontend: Track displayed on map from GPX
- [ ]  Frontend: Scroll triggers map pan/zoom to active marker
- [ ]  Frontend: Click/tap marker pins to scroll to content
- [ ]  Editor: Validation warnings for common errors
- [ ]  Performance: <1s map load, <100ms scroll response
- [ ]  Browser support: Latest version of Chrome and Safari
- [ ]  WordPress.org compliance: All guidelines met
- [ ]  Documentation: README, FAQ, screenshots
- [ ]  Testing: Manual QA on 3 popular block themes

---

# Dependencies

## External Libraries

- Leaflet.js (MIT license) - bundled or CDN?
    - Answer: Bundle for reliability

## WordPress Dependencies

- `@wordpress/blocks`
- `@wordpress/block-editor`
- `@wordpress/components`
- `@wordpress/data`
- `@wordpress/element`
- `@wordpress/i18n`

## Build Dependencies

- `@wordpress/scripts`
- Node.js 18+
- npm 9+