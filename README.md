# Pathway

Interactive map-based storytelling for WordPress.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
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
- **Lightweight** - Minimal JavaScript footprint (~5KB minified)

---

## Installation

### From WordPress.org (Recommended)
1. Go to **Plugins > Add New** in WordPress admin
2. Search for "Pathway"
3. Click **Install Now** > **Activate**

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/yourusername/pathway/releases)
2. Upload the `pathway` folder to `/wp-content/plugins/`
3. Activate through the **Plugins** menu in WordPress

### Development Installation
```bash
cd wp-content/plugins
git clone https://github.com/yourusername/pathway.git
cd pathway
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
- GPX File (required) - Upload from media library
- Displays: Point count, track bounds, file validation

**Validation:**
- File size >10MB: Warning (may be slow)
- Points >50k: Warning (may impact performance)
- Invalid GPX: Error (file won't load)
- Multiple GPX blocks: Warning (only first will display)

### Map Marker Block

**Purpose:** Places numbered waypoints in your story

**Settings:**
- Title (optional) - Shows in tooltip on hover
- Latitude (required) - Decimal degrees (e.g., 51.5074)
- Longitude (required) - Decimal degrees (e.g., -0.1278)
- Address (optional) - Note only, not displayed
- Zoom Level (optional) - Default: 14

**Validation:**
- Missing coordinates: Error
- No GPX block found: Warning
- >50km from track: Warning (may be incorrect)

**Getting Coordinates:**
- Right-click on Google Maps > "What's here?"
- Use your GPS device/app
- Extract from GPX waypoints

---

## Layout Setup

Pathway offers two ways to integrate with your theme:

### Recommended: Use the Pattern

The easiest way to get started:

1. Create or edit a post
2. Click the block inserter (+) > **Patterns** tab
3. Search for "Pathway Layout"
4. Insert the pattern
5. Add your GPX file and content

The pattern sets up a proper two-column layout automatically.

### Alternative: Manual Column Layout

For full control over your layout:

1. Add a **Columns** block (2 columns, 60/40 split)
2. Left column: Your story content and Map Marker blocks
3. Right column: Add class `pathway-map-column` and insert Map GPX block

The `pathway-map-column` class makes the map sticky as you scroll.

### Automatic: CSS Fallback

If you don't set up a manual layout, Pathway automatically positions the map on the right side using CSS. This works but gives you less control.

**Which to choose?**
- **New to block themes** > Use the pattern (easiest)
- **Want customization** > Follow [Block Theme Setup Guide](docs/BLOCK-THEME-SETUP.md)
- **Quick test** > Use automatic (no setup needed)

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
├── patterns/                   # Block patterns
│   └── two-column-layout.php
├── templates/                  # Theme templates
│   └── twentytwentyfive-single.html
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

- **Documentation:** [GitHub Wiki](https://github.com/yourusername/pathway/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/pathway/issues)
- **WordPress.org:** [Support Forum](https://wordpress.org/support/plugin/pathway/)

---

## Credits

- **Maps:** [Leaflet](https://leafletjs.com/) - Open-source JavaScript library
- **Tiles:** [OpenStreetMap](https://www.openstreetmap.org/) - Map data OpenStreetMap contributors
- **Icons:** [WordPress Dashicons](https://developer.wordpress.org/resource/dashicons/)

---

## License

Pathway is licensed under the [GNU General Public License v2.0 or later](https://www.gnu.org/licenses/gpl-2.0.html).

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Made for storytellers and adventurers**
