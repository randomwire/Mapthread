# Changelog

All notable changes to Mapthread will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.6] - 2026-02-20

### Improved
- External services section reformatted to match WordPress.org scanner expectations — renamed header to `== External services ==`, added explicit `Privacy Policy:` URLs for every service
- Third-party libraries separated into dedicated `== Third-Party Libraries ==` readme section
- Source code repository link added to plugin Description section for reviewer visibility

---

## [1.5.5] - 2026-02-20

### Fixed
- Replaced inline `<script>` on settings page with properly enqueued JavaScript via `wp_enqueue_script()` (new file: `includes/js/mapthread-settings.js`)

### Added
- Source code and build instructions section in readme for compiled/minified assets (links to GitHub repository)

### Improved
- External services documentation — added explicit service URLs for Esri (`server.arcgisonline.com`) and Open-Elevation (`api.open-elevation.com`), plus terms of use and privacy links

---

## [1.5.4] - 2026-02-19

### Added
- Attribution info button — replaces the attribution bar (which overlapped the scale indicator on mobile) with a discrete info icon that opens an overlay panel
- Standardized typography across all map text elements (Helvetica Neue stack) with wildcard reset to isolate from WordPress theme overrides

### Fixed
- Thunderforest layer attribution parsing leaving stray "Data" text in imagery section

### Improved
- SCSS refactored — consolidated scattered flat selectors under single `#mapthread-map` nesting block, removed redundant font-family declarations

---

## [1.5.3] - 2026-02-19

### Added
- Auto-detect imperial units (miles/feet) for US-based readers via browser timezone
- Elevation stats bar layout updated for longer imperial values
- Map scale indicator now matches the detected unit system

---

## [1.5.2] - 2026-02-19

### Fixed
- Removed external CDN dependency — replaced `emoji-picker-element` (which fetched data from jsdelivr) with a self-contained curated emoji grid and custom emoji paste input
- Block apiVersion updated from 2 to 3 for WordPress 7.0+ compatibility

### Improved
- External services section in readme.txt expanded with per-service data usage details, terms of service, and privacy policy links (WordPress.org review requirement)

---

## [1.5.1] - 2026-02-17

### Fixed
- Smooth zoom transitions in follow mode using flyTo at current camera position instead of abrupt integer zoom jumps
- Missing `findSegmentAtDistance()` function in elevation profile (removed in v1.5.0 refactor but call site was missed)

---

## [1.5.0] - 2026-02-16

### Added
- Settings page (Settings > Mapthread) for configuring map tile providers
- Support for Mapbox, Thunderforest, JawgMaps, and Stadia Maps tile providers
- Per-provider API key storage and style selection
- Toggleable free layers (Satellite, Topographic) with Street Map always available as fallback
- Dynamic layer switcher — frontend dropdown reflects configured providers
- Default Map Style dropdown in block editor now shows all available layers

### Improved
- Layer panel scrolls when many styles are enabled (JS-calculated max-height based on map bounds)

---

## [1.4.1] - 2026-02-16

### Added
- Elevation stats bar above chart showing Gain, Loss, Max, Min, and Distance
- Lucide trending-up/trending-down icons for gain/loss stats
- Responsive stats bar — secondary stats (Max, Min, Distance) hide on narrow maps via container query

### Changed
- Elevation profile background changed from semi-transparent blur to solid white
- Chart axis labels darkened for better readability
- Elevation stats moved from canvas-drawn overlay to proper DOM elements

### Fixed
- Dark-mode browser extensions breaking fullscreen icon rendering — dropped plugin CSS, inlined only needed container rules

---

## [1.4.0] - 2026-02-15

### Added
- Optional GPX download button — toggle via "Allow GPX download" in Map GPX block settings

### Changed
- Map controls moved from top-left to top-right; attribution moved to top-left
- Fullscreen control separated from zoom button group
- Layer dropdown opens leftward (away from screen edge)
- All control icons replaced with Lucide SVGs for consistent appearance
- Hide-map icon changed from × to directional arrow

---

## [1.3.9] - 2026-02-12

### Added
- GPX route (`<rte>`) support — files with route points are now parsed alongside tracks

---

## [1.3.8] - 2026-02-12

### Improved
- Combined latitude and longitude into a single Coordinates field in Map Marker settings — paste directly from Google Maps or Gaia GPS
- Mobile: map starts hidden by default with a "Show map" tooltip, prioritising story content on first load

---

## [1.3.7] - 2026-02-11

### Fixed
- Elevation gain/loss overcounting — added 7-point median filter to remove GPS spikes, widened moving average to 11 points, raised dead-band threshold to 10m; readings now within 4% of Gaia GPS

### Improved
- Elevation stats text legibility on chart (increased opacity)

---

## [1.3.6] - 2026-02-11

### Improved
- Map dismiss button on desktop now overlays the page — article expands to full width when map is hidden; restore tile floats in bottom-right corner

---

## [1.3.5] - 2026-02-11

### Added
- Ctrl/Cmd+scroll to zoom map — bare scroll over map no longer hijacks page scrolling
- Brief hint overlay guides users to use Ctrl (or ⌘ on macOS) to zoom; shown once per page load

---

## [1.3.4] - 2026-02-10

### Added
- Map dismiss button — collapse the map to a small restore tile to read the full-width article; restore with one tap (works on both desktop and mobile)

---

## [1.3.3] - 2026-02-09

### Improved
- Continuous animation loop for map following — camera now glides smoothly to target after scrolling stops instead of freezing mid-animation

---

## [1.3.2] - 2026-02-09

### Fixed
- Track drift when another plugin loads a conflicting Leaflet version — switched to Canvas renderer which is immune to SVG transform corruption

---

## [1.3.1] - 2026-02-09

### Fixed
- Track alignment bug when another plugin loads a conflicting Leaflet CSS version

### Added
- Donate link on WordPress admin Plugins page row

---

## [1.3.0] - 2026-02-09

### Changed
- **BREAKING**: Renamed plugin from "Pathway" to "Mapthread"
  - Main plugin file: pathway.php → mapthread.php
  - PHP classes: Pathway → Mapthread, Pathway_Elevation_API → Mapthread_Elevation_API
  - Block namespaces: pathway/* → mapthread/* (breaks existing content)
  - REST API endpoint: pathway/v1 → mapthread/v1
  - JavaScript identifiers: pathway- → mapthread-
  - CSS classes: pathway- → mapthread-
  - Text domain: pathway → mapthread
  - All documentation updated

### Migration Notes
- This is a complete rename with no backward compatibility
- Plugin has no active users, so clean break is appropriate
- Future installations will use "Mapthread" throughout

---

## [1.2.0] - 2026-02-09

### Added
- **Elevation Profile Chart** - Visual elevation graph at bottom of map
  - Powered by Chart.js with custom overlay plugin
  - Shows elevation changes along GPX track
  - Displays current position indicator as user scrolls
  - Marker position indicators show waypoint locations on chart
  - Open-Elevation API integration for elevation data lookup
- **Elevation Profile Toggle** - Block setting to enable/disable elevation chart
  - Default: enabled
  - Setting hidden when no GPX file loaded (UI cleanup)
- **Emoji Marker Support** - Select emoji icons for map markers
  - Curated emoji grid in block editor
  - Colorful emoji rendering on frontend map
  - Emoji markers scale and animate on scroll
- **UI Improvements**
  - Repositioned Leaflet attribution to top-right (no longer covered by elevation profile)
  - Elevation profile toggle only shown when GPX file is loaded
  - Marker positions displayed on elevation chart regardless of progress indicator setting

### Changed
- Map attribution control moved from bottom-right to top-right corner
- Elevation chart always updates with active marker position

### Technical
- Chart.js ^4.5.1 integration for elevation visualization
- Custom emoji grid component (no external dependencies)
- Open-Elevation API for elevation data (https://api.open-elevation.com)
- Custom Chart.js plugin for marker overlays and progress indicator
- Improved scroll state management for chart updates

---

## [1.1.0] - 2026-02-03

### Added
- **Address Search with Geocoding** - Search for locations by name in the Map Marker block
  - Autocomplete suggestions powered by OpenStreetMap Nominatim
  - Mini map preview shows selected location before confirming
  - Auto-fills latitude, longitude, and address fields
- **Markers-Only Mode** - Display maps with just markers, no GPX track required
  - Map bounds automatically calculated from marker positions
  - Full scroll-following behavior works without GPX
- **GPX Bounds Fallback** - If Map GPX block has no file uploaded, map falls back to marker bounds

### Changed
- Map Marker "Address" field now doubles as search input
- Improved map initialization to handle various content configurations

### Technical
- Added `AddressSearch` React component with debounced API calls
- Nominatim API integration with proper User-Agent headers
- `calculateBoundsFromMarkers()` function for marker-only bounds

---

## [1.0.0] - 2026-02-01

### Added
- **Map GPX Block** - Upload and display GPX tracks from the block editor
- **Map Marker Block** - Place numbered waypoints throughout story content
- **Auto-Following Map** - Map automatically pans/zooms as readers scroll
- **Follow Mode** - Smart pause/resume when users interact with map
- **Click-to-Scroll** - Click map markers to jump to story sections
- **Desktop Layout** - 2-column layout with sticky map (60/40 split)
- **Mobile Responsive** - Sticky map at top on mobile devices
- **Theme Color Integration** - Automatically uses WordPress theme primary colors
- **Performance Optimization** - Client-side GPX parsing with sessionStorage caching
- **Validation** - Real-time validation for GPX files and marker coordinates
- **Distance Calculation** - Warns when markers are >50km from GPX track
- **Multiple Markers** - Support for unlimited markers per post
- **Tooltips** - Marker titles displayed on hover
- **Clean Numbered Pins** - Modern circular marker design
- **Smooth Transitions** - 800ms pan/zoom animations
- **Browser Support** - Chrome 105+ and Safari 15.4+
- **Theme Compatibility** - Tested on Twenty Twenty-Four and Twenty Twenty-Five

### Technical
- Leaflet.js integration for map rendering
- OpenStreetMap tile provider
- Client-side GPX parsing (no server dependencies)
- WordPress block editor (Gutenberg) integration
- @wordpress/scripts build toolchain
- SCSS for styling with CSS custom properties
- sessionStorage for GPX caching
- Responsive breakpoint at 768px

### Documentation
- Comprehensive README with usage instructions
- Installation guide
- Troubleshooting section
- Browser compatibility matrix
- Theme compatibility notes
- FAQ section

---

[1.5.6]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.6
[1.5.5]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.5
[1.5.4]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.4
[1.5.3]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.3
[1.5.2]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.2
[1.5.1]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.1
[1.5.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.5.0
[1.4.1]: https://github.com/randomwire/Mapthread/releases/tag/v1.4.1
[1.4.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.4.0
[1.3.9]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.9
[1.3.8]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.8
[1.3.7]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.7
[1.3.6]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.6
[1.3.5]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.5
[1.3.4]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.4
[1.3.3]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.3
[1.3.2]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.2
[1.3.1]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.1
[1.3.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.3.0
[1.2.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.2.0
[1.1.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.1.0
[1.0.0]: https://github.com/randomwire/Mapthread/releases/tag/v1.0.0
