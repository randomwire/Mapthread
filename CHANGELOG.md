# Changelog

All notable changes to Pathway will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-01

### Added
- **Map GPX Block** - Upload and display GPX tracks from the block editor
- **Map Marker Block** - Place numbered waypoints throughout story content
- **Auto-Following Map** - Map automatically pans/zooms as readers scroll
- **Follow Mode** - Smart pause/resume when users interact with map
- **Click-to-Scroll** - Click map markers to jump to story sections
- **Desktop Layout** - 2-column layout with sticky map (60/40 split)
- **Mobile Responsive** - Sticky map at top (30vh) on mobile devices
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
  - emoji-picker-element integration in block editor
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
- emoji-picker-element ^1.28.1 for emoji selection UI
- Open-Elevation API for elevation data (https://api.open-elevation.com)
- Custom Chart.js plugin for marker overlays and progress indicator
- Improved scroll state management for chart updates

---

## [Unreleased]

### Planned for v1.3
- Multiple GPX files per post
- Container block for theme-independent layout
- Elevation profile on mobile devices

---

[1.2.0]: https://github.com/randomwire/Pathways/releases/tag/v1.2.0
[1.1.0]: https://github.com/randomwire/Pathways/releases/tag/v1.1.0
[1.0.0]: https://github.com/randomwire/Pathways/releases/tag/v1.0.0
