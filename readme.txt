=== Mapthread ===
Contributors: randomwire
Donate link: https://ko-fi.com/randomwire
Tags: maps, gpx, travel, storytelling, hiking
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.5.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your travel stories into interactive map experiences. Upload GPX files, place markers, watch the map follow as readers scroll.

== Description ==

**Mapthread** brings your adventures to life with interactive, auto-following maps.

Perfect for travel bloggers, hiking enthusiasts, and anyone who wants to tell location-based stories that engage readers.

= Core Features =

* **Auto-Following Maps** - Map pans and zooms as readers scroll through your story
* **GPX File Upload** - Support for GPS files from any device or app
* **Multiple Map Styles** - Street, Satellite, Topographic, plus additional providers (Mapbox, Thunderforest, JawgMaps, Stadia Maps)
* **Fullscreen Maps** - Expand maps to fullscreen for immersive viewing
* **Waypoints** - Place markers at key points in your narrative
* **Elevation Profiles** - Visual elevation charts for GPX tracks
* **Emoji Markers** - Fun, customizable emoji waypoint pins
* **Address Search** - Find locations by name with autocomplete
* **Smart Interactions** - Pause/resume following, click markers to jump to content
* **Beautiful Design** - Modern pins and smooth animations
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

= Map Providers =

Mapthread includes three free map styles out of the box (Street, Satellite, Topographic). You can also connect additional tile providers for additional styles:

* **Mapbox** - Streets, Outdoors, Light, Dark, Satellite, Satellite Streets
* **Thunderforest** - Cycle, Transport, Landscape, Outdoors, Atlas, Pioneer, Neighbourhood
* **JawgMaps** - Streets, Sunny, Terrain, Dark, Light
* **Stadia Maps** - Smooth, Smooth Dark, Satellite, Outdoors, OSM Bright, Stamen Toner, Stamen Terrain, Stamen Watercolor

Configure providers under **Settings > Mapthread** by entering your API key and selecting which styles to enable. Each provider offers free tiers suitable for most blogs.

= Compatibility =

* Browsers: Chrome 105+, Safari 15.4+
* Themes: Tested on Twenty Twenty-Four and Twenty Twenty-Five. Should work on most block themes. Classic themes are not supported.

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

= Configuring Map Providers =

1. Go to Settings > Mapthread
2. Enter your API key for any supported provider (Mapbox, Thunderforest, JawgMaps, Stadia Maps)
3. Select which map styles to enable for each provider
4. Save Changes — enabled styles will appear in the map layer switcher on the frontend

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

= How do I add more map styles? =

Go to Settings > Mapthread and enter your API key for any supported provider (Mapbox, Thunderforest, JawgMaps, Stadia Maps). Then select which styles to enable. Each provider offers free tiers suitable for most blogs.

= Are API keys secure? =

The tile provider API keys used by Mapthread are publishable tokens designed for client-side use. Security is handled via domain restrictions configured in each provider's dashboard.

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

= External Services =

This plugin connects to third-party services to display map tiles, geocode addresses, and look up elevation data. Below is a full description of each service, what data is sent, and when.

**OpenStreetMap Tile Service**
Used for: Rendering the default "Street" map layer.
When: Every time a visitor views a page containing a Mapthread map, the browser requests tile images from OpenStreetMap servers.
Data sent: Tile coordinate requests (zoom level, x/y tile numbers) indicating the geographic area being viewed. The visitor's IP address is visible to OpenStreetMap servers.
Terms of Use: https://wiki.osmfoundation.org/wiki/Terms_of_Use
Privacy Policy: https://wiki.osmfoundation.org/wiki/Privacy_Policy
Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/

**Esri / ArcGIS World Imagery**
Used for: Rendering the optional "Satellite" map layer.
When: Only when the Satellite layer is enabled in Settings > Mapthread and a visitor selects it. No requests are made if the layer is disabled.
Data sent: Tile coordinate requests and the visitor's IP address.
Terms of Use: https://www.esri.com/en-us/legal/terms/full-master-agreement
Privacy Policy: https://www.esri.com/en-us/privacy/overview

**OpenTopoMap**
Used for: Rendering the optional "Topographic" map layer.
When: Only when the Topographic layer is enabled in Settings > Mapthread and a visitor selects it.
Data sent: Tile coordinate requests and the visitor's IP address.
About / Terms: https://opentopomap.org/about

**Nominatim (OpenStreetMap Geocoding)**
Used for: Address search autocomplete when editing a Map Marker block.
When: Only in the WordPress block editor when an author types into the address search field. Not triggered on the public frontend.
Data sent: The search query text (partial address or place name) and the editor's IP address.
Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
Privacy Policy: https://wiki.osmfoundation.org/wiki/Privacy_Policy

**Open-Elevation API**
Used for: Looking up elevation data for GPX tracks that lack elevation information.
When: Server-side only — when a GPX file is uploaded that has no elevation data and the elevation profile feature is enabled. The request is made from the WordPress server, not from the visitor's browser.
Data sent: GPS coordinates (latitude/longitude pairs) sampled from the GPX track, sent from the WordPress server's IP address.
Service: https://open-elevation.com/
Source: https://github.com/Jorl17/open-elevation (open-source, no account required)

**Optional Tile Providers** (each requires an API key configured in Settings > Mapthread)

The following services are only contacted when a site administrator has entered an API key and a visitor selects the corresponding map layer. In each case the browser sends tile coordinate requests, the configured API key/token, and the visitor's IP address.

* **Mapbox** - https://www.mapbox.com/
  Terms: https://www.mapbox.com/legal/tos | Privacy: https://www.mapbox.com/legal/privacy
* **Thunderforest** - https://www.thunderforest.com/
  Terms: https://www.thunderforest.com/terms/ | Privacy: https://www.thunderforest.com/privacy/
* **JawgMaps** - https://www.jawg.io/
  Terms: https://www.jawg.io/en/terms/ | Privacy: https://www.jawg.io/en/privacy/
* **Stadia Maps** - https://stadiamaps.com/
  Terms: https://stadiamaps.com/terms-of-service/ | Privacy: https://stadiamaps.com/privacy-policy/


== Screenshots ==

1. Editor view - Map GPX block with uploaded track
2. Editor view - Map Marker block settings
3. Frontend desktop layout - Story on left, sticky map on right
4. Frontend mobile layout - Sticky map at top
5. Map markers and tooltips

== Changelog ==

= 1.5.3 - 2026-02-19 =
* Added: Auto-detect imperial units (miles/feet) for US-based readers via browser timezone
* Improved: Elevation stats bar layout — removed gain/loss icons, widened responsive breakpoint for longer imperial values
* Fixed: Non-Latin numeral systems (e.g. Devanagari) no longer appear in elevation stats
* Updated: Map scale indicator now matches the detected unit system

= 1.5.2 - 2026-02-19 =
* Fixed: Removed external CDN dependency — emoji picker now uses a self-contained curated grid
* Fixed: Block apiVersion updated from 2 to 3 for WordPress 7.0+ compatibility
* Improved: External services documentation expanded with data usage details and privacy policy links
* Note: REST API permission_callback was already fixed in v1.5.1

= 1.5.1 - 2026-02-17 =
* Fixed: Smooth zoom transitions in follow mode instead of abrupt jumps
* Fixed: Missing function in elevation profile causing JS errors

= 1.5.0 - 2026-02-16 =
* Added: Settings page (Settings > Mapthread) for configuring map tile providers
* Added: Support for Mapbox, Thunderforest, JawgMaps, and Stadia Maps tile providers
* Added: Per-provider API key storage and style selection
* Added: Toggleable free layers (Satellite, Topographic) with Street Map always available as fallback
* Added: Dynamic layer switcher — frontend dropdown reflects configured providers
* Added: Default Map Style dropdown in block editor now shows all available layers
* Improved: Layer panel scrolls when many styles are enabled

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
* Added: Emoji marker support for map markers
* Added: Marker position indicators on elevation chart
* Changed: Moved Leaflet attribution to top-right corner
* Fixed: Elevation profile toggle now hidden when no GPX file loaded
* Technical: Chart.js ^4.5.1 integration for elevation visualization

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
* Performance optimizations

== Upgrade Notice ==

= 1.5.2 =
Addresses WordPress.org plugin review feedback: removes CDN dependency, updates block apiVersion to 3, and expands external service documentation.

= 1.5.1 =
Fixes abrupt zoom jumps when scrolling between markers with different zoom levels in follow mode, and resolves a JS error in the elevation profile.

= 1.5.0 =
New settings page! Configure additional map providers (Mapbox, Thunderforest, JawgMaps, Stadia Maps) under Settings > Mapthread. Toggle free layers and choose from dozens of map styles.

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