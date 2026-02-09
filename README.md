# Pathway

Interactive map-based storytelling for WordPress.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![WordPress](https://img.shields.io/badge/wordpress-6.0%2B-brightgreen.svg)
![PHP](https://img.shields.io/badge/php-7.4%2B-purple.svg)
![License](https://img.shields.io/badge/license-GPLv2%2B-orange.svg)

---

## Description

Pathway transforms your travel stories, hiking adventures, and geographic narratives into engaging interactive experiences. Upload a GPX track, place numbered markers in your story, and watch as readers scroll - the map automatically pans and zooms to follow along.

Perfect for:
- Hiking and adventure blogs
- Travel storytelling
- Cycling route documentation
- Race and event recaps
- Location-based historical narratives

---

## Features

### Core Functionality
- **GPX Track Upload** - Upload your GPS tracks from any device or app
- **Elevation Profiles** - Visualize elevation changes with Chart.js-powered graphs at the bottom of the map
- **Emoji Markers** - Choose from any emoji as custom map markers
- **Markers-Only Mode** - Display maps with just markers, no GPX track required
- **Address Search** - Geocode addresses with OpenStreetMap Nominatim autocomplete
- **Auto-Following Maps** - Map pans and zooms as readers scroll through your story
- **Numbered Waypoints** - Place markers at key points in your narrative
- **Smart Follow Mode** - Automatically pauses when readers interact with the map, resumes when they keep scrolling
- **Click-to-Scroll** - Click any map marker to jump to that part of the story

### Design & Layout
- **Desktop Layout** - Beautiful 2-column layout (story 60%, sticky map 40%)
- **Mobile Responsive** - Sticky map at top (30vh), story scrolls below
- **Theme Integration** - Uses your theme's primary colors automatically
- **Professional Styling** - Clean, modern marker pins and tooltips

### Performance
- **Client-Side Rendering** - Fast, no server processing required
- **Smart Caching** - GPX tracks cached in sessionStorage for instant reloads
- **Optimized Bundle** - Efficient JavaScript with Chart.js and Leaflet

---

## Installation

### From WordPress.org (Recommended)
1. Go to **Plugins > Add New** in WordPress admin
2. Search for "Pathway"
3. Click **Install Now** > **Activate**

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/randomwire/Pathways/releases)
2. Upload the `pathway` folder to `/wp-content/plugins/`
3. Activate through the **Plugins** menu in WordPress

### Development Installation
```bash
cd wp-content/plugins
git clone https://github.com/randomwire/Pathways.git
cd Pathways
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
   - Upload your GPX file from the media library
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
- **GPX File** (required) - Upload from media library
  - Displays: Point count, track bounds, file validation
- **Show Progress Indicator** (toggle) - Enable/disable auto-following behavior
  - Default: ON
  - When ON: Map pans/zooms to follow reader's position in story
  - When OFF: Map stays at full track view, shows all markers at once
- **Show Elevation Profile** (toggle) - Enable/disable elevation chart
  - Default: ON
  - Displays elevation graph at bottom of map with Chart.js
  - Shows marker positions and current progress on the chart
  - Only visible when GPX file is loaded

**Validation:**
- File size >10MB: Warning (may be slow)
- Points >50k: Warning (may impact performance)
- Invalid GPX: Error (file won't load)
- Multiple GPX blocks: Warning (only first will display)

**Elevation Data:**
- Elevation is fetched from Open-Elevation API when GPX is uploaded
- Chart shows elevation changes along your route
- Marker positions indicated with vertical lines on chart
- Current scroll position shown with orange indicator

### Map Marker Block

**Purpose:** Places numbered waypoints in your story

**Settings:**
- **Marker Style** - Choose between numbered pin or emoji
  - Numbered Pin (default): Clean circular pins with sequential numbers
  - Emoji: Choose any emoji as your custom marker icon
- **Emoji Picker** (when emoji style selected)
  - Search or browse thousands of emojis
  - Click to select (e.g., 🏔️, 🏕️, 🚶, 📍)
  - Emojis scale and animate as readers scroll
- **Title** (optional) - Shows in tooltip on hover
- **Address** (with search) - Type to search locations via OpenStreetMap
- **Latitude** (auto-filled) - Decimal degrees (e.g., 51.5074)
- **Longitude** (auto-filled) - Decimal degrees (e.g., -0.1278)
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
- Right-click on Google Maps > "What's here?"
- Use your GPS device/app
- Extract from GPX waypoints

---

## Layout Setup

Pathway offers two ways to integrate with your theme:

### Recommended: Use the Pattern

### Automatic Layout (Recommended)

Just add your blocks and Pathway handles the layout automatically:
- Desktop: Map fixed on the right side, content scrolls on the left
- Mobile: Map fixed at top, content scrolls below

No additional setup needed!

### Manual Column Layout (Optional)

For full control over your layout:

1. Add a **Columns** block (2 columns, 60/40 split)
2. Left column: Your story content and Map Marker blocks
3. Right column: Add class `pathway-map-column` and insert Map GPX block

The `pathway-map-column` class makes the map sticky as you scroll. See [Block Theme Setup Guide](docs/BLOCK-THEME-SETUP.md) for details.

---

## Requirements

- **WordPress:** 6.0 or higher
- **PHP:** 7.4 or higher
- **Browser Support:** Chrome/Safari latest stable (uses modern CSS/JS)
- **Theme:** Block theme recommended (Twenty Twenty-Four, Twenty Twenty-Five)

---

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Core Functionality | 105+ | 15.4+ | Untested | Untested |
| Desktop Layout | Yes | Yes | Untested | Untested |
| Mobile Layout | Yes | Yes | Untested | Untested |

**Note:** Plugin is tested on Chrome and Safari. Firefox and Edge likely work but are not officially tested.

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

**Tip:** If the layout doesn't work with your theme, open an issue on GitHub with your theme name.

---

## FAQ

**Q: Do I need a GPX file to use Pathway?**
A: No! You can create map stories with just Map Marker blocks. The map will automatically fit to show all your markers.

**Q: Can I use multiple GPX files in one post?**
A: Not in v1.0. Only the first Map GPX block will be used.

**Q: What GPX format is supported?**
A: Standard GPX 1.0/1.1 with `<trk>` (tracks). Waypoints and routes are not displayed in v1.0.

**Q: Can I customize the marker colors?**
A: Yes! Pathway uses your theme's primary color automatically. Set it in `theme.json` or Customizer.

**Q: Does it work with classic themes?**
A: The plugin works, but the layout may not be perfect. Block themes are recommended.

**Q: Can I use Pathway with Elementor/Divi/etc?**
A: Not tested. Pathway is designed for the block editor (Gutenberg).

**Q: Is there a limit on GPX file size?**
A: 10MB is recommended. Larger files will show a warning and may be slow to render.

**Q: Can I add photos to the map markers?**
A: Not in v1.0. This feature is planned for a future release.

---

## Troubleshooting

### Map doesn't appear
1. Check browser console for errors
2. Verify GPX file uploaded successfully
3. Try re-saving the post in the editor
4. Check that Map GPX block is present

### Layout looks broken
1. Ensure you're using a block theme (Twenty Twenty-Four/Five)
2. Check if another plugin is conflicting with CSS
3. Try disabling other plugins temporarily
4. Open an issue with your theme name

### GPX track doesn't render
1. Check that GPX file is valid (test in another app)
2. Verify file has `<trk>` elements (not just waypoints)
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
pathway/
├── pathway.php                 # Main plugin file
├── includes/
│   ├── class-pathway.php       # Core class
│   └── blocks/
│       ├── map-gpx/            # GPX block
│       └── map-marker/         # Marker block
├── assets/
│   ├── js/
│   │   └── pathway-frontend.js # Map behavior
│   └── css/
│       └── pathway-frontend.scss
├── docs/                       # Documentation
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

- **Documentation:** [GitHub Wiki](https://github.com/randomwire/Pathways/wiki)
- **Issues:** [GitHub Issues](https://github.com/randomwire/Pathways/issues)
- **WordPress.org:** [Support Forum](https://wordpress.org/support/plugin/pathway/)

---

## Credits & Attribution

Pathway is built with and relies on the following open-source libraries and services:

### JavaScript Libraries

- **[Leaflet.js](https://leafletjs.com/)** - BSD-2-Clause License
  - Interactive map rendering and controls
  - Loaded from unpkg.com CDN

- **[Chart.js](https://www.chartjs.org/)** - MIT License
  - Elevation profile visualization
  - Custom plugins for marker overlays and progress indicators

- **[emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element)** - MIT License
  - Emoji selection interface in the block editor
  - By Nolan Lawson

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

Pathway is licensed under the [GNU General Public License v2.0 or later](https://www.gnu.org/licenses/gpl-2.0.html).

All included third-party libraries are GPL-compatible:
- BSD-2-Clause (Leaflet) - Compatible
- MIT (Chart.js, emoji-picker-element) - Compatible
- ODbL 1.0 (OpenStreetMap data) - Requires attribution (provided)

---

## Privacy & Data Usage

**External API Calls:**
- Address searches query Nominatim API with user-entered text
- Elevation lookups send GPX coordinates to Open-Elevation API
- Map tiles loaded from OpenStreetMap tile servers
- All API calls made from user's browser, not from WordPress server

**No Data Collection:**
- Plugin does not collect, store, or transmit user data
- No analytics or tracking
- No cookies set by the plugin

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Made for storytellers and adventurers**
