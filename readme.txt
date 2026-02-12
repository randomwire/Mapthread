=== Mapthread ===
Contributors: randomwire
Donate link: https://ko-fi.com/randomwire
Tags: maps, gpx, travel, storytelling, hiking
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.3.9
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your travel stories into interactive map experiences. Upload GPX files, place markers, watch the map follow as readers scroll.

== Description ==

**Mapthread** brings your adventures to life with interactive, auto-following maps.

Perfect for travel bloggers, hiking enthusiasts, and anyone who wants to tell location-based stories that engage readers.

= Core Features =

* **Auto-Following Maps** - Map pans and zooms as readers scroll through your story
* **GPX File Upload** - Support for GPS files from any device or app
* **Multiple Map Styles** - Switch between Street, Satellite, and Topographic views
* **Fullscreen Maps** - Expand maps to fullscreen for immersive viewing
* **Numbered Waypoints** - Place markers at key points in your narrative
* **Elevation Profiles** - Visual elevation charts for GPX tracks
* **Emoji Markers** - Fun, customizable emoji waypoint pins
* **Address Search** - Find locations by name with autocomplete
* **Smart Interactions** - Pause/resume following, click markers to jump to content
* **Beautiful Design** - Modern numbered pins, smooth animations, theme color integration
* **Mobile Responsive** - Optimized layouts for all screen sizes

= Perfect For =

* Hiking and backpacking blogs
* Travel storytelling
* Cycling route documentation
* Race and event recaps
* Historical narratives with geographic context

= How It Works =

1. Create a post and add the **Map GPX** block
2. Upload your GPX file from the media library
3. Write your story, inserting **Map Marker** blocks at key points
4. Add coordinates and titles to each marker
5. Publish - the map automatically follows as readers scroll!

= Technical Details =

* Leaflet.js for fast, interactive maps
* Chart.js for elevation profile visualization
* OpenStreetMap tiles and Nominatim geocoding (no API key required)
* Open-Elevation API for elevation data
* Client-side GPX parsing with sessionStorage caching
* Modern JavaScript with React-based block editor

= Browser Support =

Tested on Chrome 105+ and Safari 15.4+.

= Theme Compatibility =

Tested and working on:
* Twenty Twenty-Four
* Twenty Twenty-Five

Should work on most block themes. Classic themes are not tested/supported.

== Installation ==

= From WordPress.org =

1. Go to Plugins > Add New in your WordPress admin
2. Search for "Mapthread"
3. Click Install Now, then Activate

= Manual Installation =

1. Download the plugin ZIP file
2. Go to Plugins > Add New > Upload Plugin
3. Choose the ZIP file and click Install Now
4. Activate the plugin

= After Installation =

1. Create or edit a post
2. Add the "Map GPX" block and upload your GPX file
3. Add "Map Marker" blocks throughout your content
4. Publish and enjoy!

== Frequently Asked Questions ==

= What is a GPX file? =

GPX (GPS Exchange Format) is a standard file format for GPS data. Most fitness trackers, hiking apps, and GPS devices can export GPX files.

= Where do I get GPX files? =

You can export GPX files from:
* Fitness apps (Strava, Garmin Connect, etc.)
* Hiking apps (Gaia GPS, AllTrails, etc.)
* GPS devices (Garmin, Suunto, etc.)
* Google Maps (via third-party tools)

= Can I use multiple GPX files in one post? =

Not currently. Only the first Map GPX block per post is used.

= How do I get coordinates for markers? =

* Use the built-in address search (type any place name)
* Paste coordinates from Google Maps (right-click a location)
* Use coordinates from your GPS device or app

= Does it work with my theme? =

Mapthread is designed for block themes. It should work on most block themes.

= Is there a file size limit for GPX? =

We recommend GPX files under 10MB. Larger files will show a warning and may be slow to render.

= Can I customize the map/track/marker colors? =

Not currently. But you can set emojis for each Marker instead of the default.

= Does this work offline? =

No, Mapthread requires an internet connection to load map tiles from OpenStreetMap.

== Third-Party Services & Attribution ==

Mapthread uses the following open-source libraries and external services:

= JavaScript Libraries =

* **Leaflet.js** (BSD-2-Clause) - https://leafletjs.com/
  Interactive map rendering
* **Leaflet.fullscreen** (MIT) - https://github.com/brunob/leaflet.fullscreen
  Fullscreen map control
* **Chart.js** (MIT) - https://www.chartjs.org/
  Elevation profile visualization
* **emoji-picker-element** (MIT) - https://github.com/nolanlawson/emoji-picker-element
  Emoji selection interface

= External Services =

* **OpenStreetMap** (ODbL 1.0) - https://www.openstreetmap.org/
  Street map tiles and data
* **Esri World Imagery** - https://www.esri.com/
  Satellite map tiles
* **OpenTopoMap** (CC-BY-SA) - https://opentopomap.org/
  Topographic map tiles
* **Nominatim** - https://nominatim.org/
  Address geocoding and search (OpenStreetMap service)
* **Open-Elevation API** - https://open-elevation.com/
  Elevation data lookup for GPX tracks

All external API calls are made from the user's browser.

= WordPress Integration =

* WordPress Block Editor (Gutenberg)
* @wordpress/scripts build toolchain
* WordPress Dashicons (GPLv2+)

== Screenshots ==

1. Editor view - Map GPX block with uploaded track
2. Editor view - Map Marker block settings
3. Frontend desktop layout - Story on left, sticky map on right
4. Frontend mobile layout - Sticky map at top
5. Map markers and tooltips

== Changelog ==

= 1.3.9 - 2026-02-12 =
* Added: GPX route support — files with route points (`<rte>`) are now parsed alongside tracks

= 1.3.8 - 2026-02-12 =
* Improved: Combined latitude and longitude into a single Coordinates field — paste directly from Google Maps or Gaia GPS
* Improved: Mobile — map starts hidden by default with a "Show map" tooltip, prioritising story content on first load

= 1.3.7 - 2026-02-11 =
* Fixed: Elevation gain/loss overcounting — added median filter to remove GPS spikes, tuned smoothing parameters to match Gaia GPS accuracy
* Improved: Elevation stats text legibility on chart

= 1.3.6 - 2026-02-11 =
* Improved: Map dismiss button on desktop now overlays the page — article expands to full width when map is hidden

= 1.3.5 - 2026-02-11 =
* Added: Ctrl/Cmd+scroll to zoom map — bare scroll over the map no longer hijacks page scrolling; a brief hint overlay guides users to use Ctrl (or ⌘ on macOS) to zoom

= 1.3.4 - 2026-02-10 =
* Added: Map dismiss button — collapse the map to a small restore tile to read the full-width article, restore with one tap

= 1.3.3 - 2026-02-09 =
* Improved: Continuous animation loop for map following — camera now glides smoothly to target after scrolling stops instead of freezing mid-animation

= 1.3.2 - 2026-02-09 =
* Fixed: Track drift when another plugin loads a conflicting Leaflet version — switched to Canvas renderer which is immune to SVG transform corruption

= 1.3.1 - 2026-02-09 =
* Fixed: Track alignment bug when another plugin loads a conflicting Leaflet CSS version
* Added: Donate link on WordPress admin Plugins page row

= 1.3.0 - 2026-02-09 =
* Added: Multiple map styles - Switch between Street, Satellite, and Topographic views
* Added: Layer control widget for easy map style switching
* Added: Fullscreen button for immersive map viewing
* Added: Default Map Style setting in block editor to choose initial view
* Technical: Leaflet.fullscreen ^5.3.0 integration
* Technical: Esri World Imagery and OpenTopoMap tile providers

= 1.2.0 - 2026-02-09 =
* Added: Elevation profile chart powered by Chart.js with Open-Elevation API
* Added: Elevation profile toggle in Map GPX block settings
* Added: Emoji marker support with emoji-picker-element
* Added: Marker position indicators on elevation chart
* Changed: Moved Leaflet attribution to top-right corner
* Fixed: Elevation profile toggle now hidden when no GPX file loaded
* Technical: Chart.js ^4.5.1 and emoji-picker-element ^1.28.1 integration

= 1.1.0 - 2026-02-03 =
* Added: Address search with Nominatim API autocomplete
* Added: Markers-only mode (no GPX required)
* Added: Mini map preview in address search
* Improved: Map bounds calculation from markers

= 1.0.0 - 2026-02-01 =
* Initial release
* Map GPX block for track upload
* Map Marker block for waypoints
* Auto-following map behavior
* Desktop and mobile responsive layouts
* Theme color integration
* Performance optimizations

== Upgrade Notice ==

= 1.3.9 =
GPX files with routes (not just tracks) are now supported.

= 1.3.8 =
Paste coordinates directly from Google Maps or Gaia GPS into a single field — no more splitting lat/lng manually.

= 1.3.7 =
Elevation gain/loss readings are now much more accurate — fixes overcounting on noisy GPS data.

= 1.3.6 =
Hiding the map on desktop now expands the article to full width — the restore tile floats in the corner without reserving space.

= 1.3.5 =
Scroll the page without accidentally zooming the map — use Ctrl (or ⌘ on macOS) + scroll to zoom.

= 1.3.4 =
New map dismiss button — collapse the map to a small tile and expand it again with one tap.

= 1.3.3 =
Smoother map following — camera now completes its animation after scrolling stops.

= 1.3.2 =
Bug fix for track drift when other map plugins are active on the same page.

= 1.3.1 =
Bug fix for track alignment when other map plugins are active on the same page.

= 1.3.0 =
New map viewing options! Switch between Street, Satellite, and Topographic map styles. Fullscreen mode for immersive viewing.

= 1.2.0 =
Major update with elevation profiles, emoji markers, and UI improvements. All third-party services properly attributed.

= 1.1.0 =
Adds address search and markers-only mode for enhanced flexibility.

= 1.0.0 =
Initial release of Mapthread. Install and start creating interactive map stories!

== Additional Info ==

= Support =

For support, please visit:
* Plugin support forum: https://wordpress.org/support/plugin/mapthread/
* GitHub issues: https://github.com/randomwire/Mapthread/issues

= Contributing =

Mapthread is open source! Contributions welcome at:
https://github.com/randomwire/Mapthread

= Credits =

* Maps powered by Leaflet.js
* Tiles by OpenStreetMap contributors
