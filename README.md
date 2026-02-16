# Mapthread

Interactive map-based storytelling for WordPress.

![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)
![WordPress](https://img.shields.io/badge/wordpress-6.0%2B-brightgreen.svg)
![PHP](https://img.shields.io/badge/php-7.4%2B-purple.svg)
![License](https://img.shields.io/badge/license-GPLv2%2B-orange.svg)

---

## Description

Mapthread transforms your travel stories, hiking adventures, and geographic narratives into interactive experiences with maps. Upload a GPX file, place markers in your story, and watch as readers scroll - the map automatically pans and zooms to follow along.

Perfect for:
- Hiking and adventure blogs
- Travel storytelling
- Cycling route documentation
- Race and event recaps
- Location-based historical narratives

---

## Features

### Core Functionality
- **GPX Upload** - Upload your GPS files (tracks or routes) from any device or app
- **Auto-Following Mode** - Map pans and zooms as readers scroll through your story
- **Smart Follow Mode** - Automatically pauses when readers interact with the map, resumes when they keep scrolling
- **Markers-Only Mode** - Display maps with just markers, no GPX file required
- **Elevation Profiles** - Visualize elevation changes with graphs at the bottom of the map
- **Numbered Waypoints** - Place markers at key points in your narrative
- **Address Search** - Geocode addresses with autocomplete
- **Emoji Markers** - Choose from any emoji as custom map markers
- **Click-to-Scroll** - Click any map marker to jump to that part of the story
- **Additional Map Providers** - Connect Mapbox, Thunderforest, JawgMaps, or Stadia Maps for additional styles

### Design & Layout
- **Desktop Layout** - 2-column layout (story 60%, sticky map 40%)
- **Mobile Responsive** - Sticky map at top (~35vh), starts hidden with "Show map" button

### Performance
- **Client-Side Rendering** - Fast, no server processing required
- **Smart Caching** - GPX tracks/routes cached in sessionStorage for instant reloads

---

## Installation

### From WordPress.org (Recommended)
1. Go to **Plugins > Add New** in WordPress admin
2. Search for "Mapthread"
3. Click **Install Now** > **Activate**

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/randomwire/Mapthread/releases)
2. Upload the `mapthread` folder to `/wp-content/plugins/`
3. Activate through the **Plugins** menu in WordPress

### Development Installation
```bash
cd wp-content/plugins
git clone https://github.com/randomwire/Mapthread.git
cd Mapthread
npm install
npm run build
```

---

## Usage

### Quick Start

1. **Create or edit a post**
2. **Add the Map GPX block**
   - Click the block inserter (+)
   - Search for "Map GPX"
   - Upload your GPX file to the media library
3. **Write your story with Map Marker blocks**
   - Add paragraphs, images, etc.
   - Insert "Map Marker" blocks at key points
   - Fill in coordinates (latitude/longitude)
   - Add a title for the marker tooltip
4. **Publish and view**
   - The map automatically follows as readers scroll!

### Map GPX Block

**Purpose:** Uploads and displays your GPS track

**Settings:**
- **GPX File** (optional) - Upload from media library
  - Displays: Point count, track bounds, file validation
- **Show Progress Indicator** (toggle) - Enable/disable auto-following behavior
  - When ON: Map pans/zooms to follow reader's position in story (default)
  - When OFF: Map stays at full track view, shows all markers at once
- **Show Elevation Profile** (toggle) - Enable/disable elevation chart
  - Displays elevation graph at bottom of map (default)
  - Shows marker positions and current progress on the chart
- **Default Map Style** (dropdown) - Choose which map style loads initially (shows all enabled styles from Settings > Mapthread)

**Validation:**
- File size >10MB: Warning (may be slow)
- Points >50k: Warning (may impact performance)
- Invalid GPX: Error (file won't load)
- Multiple GPX blocks: Warning (only first will display)

**Elevation Data:**
- Elevation is fetched from Open-Elevation API when GPX is uploaded
- Chart shows elevation changes along your route
- Marker positions indicated with vertical lines on chart
- Current scroll position shown with red indicator line

### Map Marker Block

**Purpose:** Places waypoints in your story

**Settings:**
- **Marker Style** - Choose between numbered pin or emoji
  - Default: Clean circular pins
  - Emoji: Choose any emoji as your custom marker icon
- **Emoji Picker** (when emoji style selected)
  - Search or browse all emojis
  - Click to select (e.g., 🏔️, 🏕️, 🚶, 📍)
- **Title** (optional) - Shows in tooltip on hover
- **Address** (optional) - Type to search locations via OpenStreetMap
- **Coordinates** (required) - Paste from Google Maps or enter manually (e.g. 35.31909, 139.55064)
- **Zoom Level** (optional) - Default: 14

**Address Search:**
- Type any address, landmark, or place name
- Autocomplete suggestions appear as you type
- Click a result to auto-fill coordinates
- Mini map preview shows selected location

**Validation:**
- Missing coordinates: Error
- No GPX block found: Info (markers-only mode supported)
- >50km from track: Warning (may be incorrect)

**Getting Coordinates:**
- **Recommended:** Use the built-in address search
- Right-click on a location in Google Maps
- Use your GPS device/app
- Extract from GPX waypoints

---

### Markers-Only Mode

**If you don't have a GPX file,** Mapthread also works with just markers:

#### Scenario 1: No Map GPX Block at All
- Add Map Marker blocks to your story content
- **Result:** Map displays showing only your markers
- Map bounds automatically calculated from marker positions
- No route/track line displayed on map
- Auto-following still works - map centers on each marker as you scroll

#### Scenario 2: Map GPX Block Without Uploaded File
- Add Map GPX block but don't upload a GPX file
- Add Map Marker blocks to your story content
- **Result:** Markers connected with straight lines in the order they were added
- Creates a simple route visualization connecting your points
- Elevation profile hidden (no data without GPX)
- Settings toggles available but won't show until GPX uploaded
- Different from Scenario 1: lines connect markers to show a path

**Use Cases for Markers-Only Mode:**

*Scenario 1 (No lines):*
- City tours with unrelated points of interest
- Photo essays with geographic context
- Historical events at different locations
- Restaurant/venue guides

*Scenario 2 (With connecting lines):*
- Multi-city travel itineraries (show the general path)
- Road trip stories (approximate route between stops)
- Walking tours (straight-line path between waypoints)
- Any journey where you want to show the sequence of locations

**Note:** If you later add a GPX file, the map will display the route and automatically adjust bounds to show both the track and all markers.

---

## Layout Setup

Mapthread offers two ways to integrate with your theme:

### Automatic Layout (Recommended)

Just add your blocks and Mapthread handles the layout automatically:
- Desktop: Map fixed on the right side, content scrolls on the left
- Mobile: Map fixed at top, content scrolls below (collapsed by default)

No additional setup needed!

### Manual Column Layout (Optional)

For full control over your layout:

1. Add a **Columns** block (2 columns, 60/40 split)
2. Left column: Your story content and Map Marker blocks
3. Right column: Add class `mapthread-map-column` and insert Map GPX block

The `mapthread-map-column` class makes the map sticky as you scroll.

---

## Settings

Navigate to **Settings > Mapthread** in WordPress admin to configure map tile providers.

### Free Map Providers

Three free map styles are included out of the box:
- **Street** (OpenStreetMap) — always enabled, serves as the fallback
- **Satellite** (Esri World Imagery) — toggleable
- **Topographic** (OpenTopoMap) — toggleable

### Additional Map Providers

Enter an API key and select which styles to enable. Enabled styles appear in the frontend layer switcher and the block editor's Default Map Style dropdown.

| Provider | Styles Available |
|---|---|
| **[Mapbox](https://www.mapbox.com/)** | Streets, Outdoors, Light, Dark, Satellite, Satellite Streets |
| **[Thunderforest](https://www.thunderforest.com/)** | Cycle, Transport, Landscape, Outdoors, Atlas, Pioneer, Neighbourhood |
| **[JawgMaps](https://www.jawg.io/)** | Streets, Sunny, Terrain, Dark, Light |
| **[Stadia Maps](https://stadiamaps.com/)** | Smooth, Smooth Dark, Satellite, Outdoors, OSM Bright, Stamen Toner, Stamen Terrain, Stamen Watercolor |

All providers offer free tiers suitable for most blogs. API keys are publishable tokens designed for client-side use — security is handled via domain restrictions in each provider's dashboard.

---

## Requirements

- **WordPress:** 6.0 or higher
- **PHP:** 7.4 or higher
- **Browser Support:** Chrome/Safari latest stable (uses modern CSS/JS)
- **Theme:** Block theme (not tested with classic themes)

---

## Theme Compatibility

### Tested & Working
- Twenty Twenty-Four
- Twenty Twenty-Five

### Should Work
- Most standard block themes with default DOM structure

### May Require Customization
- Classic themes
- Themes with custom post layouts
- Themes with complex grid systems

---

## FAQ

**Q: Do I need a GPX file to use Mapthread?**
A: No! You can create map stories with just Map Marker blocks. The map will automatically fit to show all your markers.

**Q: Can I use multiple GPX files in one post?**
A: Not currently. Only the first Map GPX block per post is used.

**Q: What GPX format is supported?**
A: Standard GPX 1.0/1.1 with `<trk>` (tracks) or `<rte>` (routes). Waypoints from the GPX file are not displayed; use Map Marker blocks to mark key points instead.

**Q: Can I customize the map/track/marker colors?**
A: Not currently. But you can set emojis for each Marker instead of the default.

**Q: Does it work with classic themes?**
A: Not tested. Mapthread is designed for block themes.

**Q: Can I use Mapthread with Elementor/Divi/etc?**
A: Not tested. Mapthread is designed for the block editor (Gutenberg).

**Q: How do I add more map styles?**
A: Go to Settings > Mapthread and enter your API key for any supported provider (Mapbox, Thunderforest, JawgMaps, Stadia Maps). Then select which styles to enable.

**Q: Are the API keys secure?**
A: Tile provider API keys are publishable tokens designed for client-side use. Secure them via domain restrictions in each provider's dashboard.

**Q: Is there a limit on GPX file size?**
A: 10MB is recommended. Larger files will show a warning and may be slow to render.

---

## Troubleshooting

### Map doesn't appear
1. Check browser console for errors
2. Verify GPX file uploaded successfully
3. Try re-saving the post in the editor
4. Check that Map GPX block is present

### Layout looks broken
1. Ensure you're using a block theme
2. Check if another plugin is conflicting with CSS
3. Try disabling other plugins temporarily
4. Open an issue with your theme name

### GPX track/route doesn't render
1. Check that GPX file is valid (test in another app)
2. Verify file has `<trk>` (tracks) or `<rte>` (routes) elements (not just waypoints)
3. Check browser console for parsing errors
4. Try a smaller GPX file

### Markers don't scroll
1. Ensure coordinates are correct (decimal degrees)
2. Check that Map Marker blocks are present in content
3. Verify JavaScript is enabled in browser
4. Check browser console for errors

---

## Development

### Build from Source
```bash
npm install
npm run build        # Production build
npm run start        # Development watch mode
npm run lint:js      # Check JavaScript
npm run format       # Format code
```

### File Structure
```
mapthread/
├── mapthread.php                 # Main plugin file
├── includes/
│   ├── class-mapthread.php       # Core class
│   ├── class-mapthread-settings.php # Settings page
│   └── blocks/
│       ├── map-gpx/            # GPX block
│       └── map-marker/         # Marker block
├── assets/
│   ├── js/
│   │   └── mapthread-frontend.js # Map behavior
│   └── css/
│       └── mapthread-frontend.scss
├── build/                      # Compiled assets
└── package.json
```

### Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

---

## Support

- **Documentation:** [GitHub Wiki](https://github.com/randomwire/Mapthread/wiki)
- **Issues:** [GitHub Issues](https://github.com/randomwire/Mapthread/issues)
- **WordPress.org:** [Support Forum](https://wordpress.org/support/plugin/mapthread/)

---

## Credits & Attribution

Mapthread is built with and relies on the following open-source libraries and services:

### JavaScript Libraries

- **[Leaflet.js](https://leafletjs.com/)** - BSD-2-Clause License
  - Interactive map rendering and controls

- **[Chart.js](https://www.chartjs.org/)** - MIT License
  - Elevation profile visualization
  - Custom plugins for marker overlays and progress indicators

- **[emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element)** - MIT License
  - Emoji selection interface in the block editor
  - By Nolan Lawson

- **[Leaflet.fullscreen](https://github.com/brunob/leaflet.fullscreen)** - MIT License
  - Fullscreen map control

- **[Lucide](https://lucide.dev/)** - ISC License
  - Map control icons

### External Data Services

- **[OpenStreetMap](https://www.openstreetmap.org/)** - ODbL 1.0 License
  - Map tiles: © OpenStreetMap contributors
  - Data usage complies with [OpenStreetMap Copyright](https://www.openstreetmap.org/copyright)

- **[Nominatim](https://nominatim.org/)** - OpenStreetMap Geocoding Service
  - Address search and autocomplete functionality
  - Follows [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

- **[Open-Elevation API](https://open-elevation.com/)** - Free Elevation Data Service
  - Provides elevation data for GPX track visualization
  - Open-source public service

### Optional Additional Tile Providers

These services are only used when configured with an API key in Settings > Mapthread:

- **[Mapbox](https://www.mapbox.com/)** - Additional map tiles
- **[Thunderforest](https://www.thunderforest.com/)** - Additional map tiles
- **[JawgMaps](https://www.jawg.io/)** - Additional map tiles
- **[Stadia Maps](https://stadiamaps.com/)** - Additional map tiles

### WordPress Platform

- **WordPress Block Editor** (Gutenberg) - GPLv2+
- **@wordpress/scripts** - Build and development tooling
- **@wordpress/components** - UI component library
- **[WordPress Dashicons](https://developer.wordpress.org/resource/dashicons/)** - GPLv2+

### Development Tools

- **webpack** (via @wordpress/scripts) - Module bundling
- **Babel** - JavaScript transpilation
- **Sass/SCSS** - CSS preprocessing

---

## License

Mapthread is licensed under the [GNU General Public License v2.0 or later](https://www.gnu.org/licenses/gpl-2.0.html).

All included third-party libraries are GPL-compatible:
- BSD-2-Clause (Leaflet) - Compatible
- MIT (Chart.js, emoji-picker-element, Leaflet.fullscreen) - Compatible
- ISC (Lucide icons) - Compatible
- ODbL 1.0 (OpenStreetMap data) - Requires attribution (provided)

---

## Privacy & Data Usage

**External API Calls:**
- Address searches query Nominatim API with user-entered text
- Elevation lookups send GPX coordinates to Open-Elevation API
- Map tiles loaded from OpenStreetMap tile servers (and optionally from configured premium providers)
- All API calls made from user's browser

**No Data Collection:**
- Plugin does not collect, store, or transmit user data
- No analytics or tracking
- No cookies set by the plugin

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Inspiration

- [Koya Bound](https://walkkumano.com/koyabound/)
- [Riding the New Silk Road](https://www.nytimes.com/newsgraphics/2013/07/21/silk-road/index.html)
- [Eater Maps](https://www.eater.com/maps/)
- [Animated Map Path for Interactive Storytelling](https://tympanus.net/codrops/2015/12/16/animated-map-path-for-interactive-storytelling/)

---

**Made for storytellers and adventurers**
