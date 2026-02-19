# Mapthread

Interactive map-based storytelling for WordPress.

![Version](https://img.shields.io/badge/version-1.5.2-blue.svg)
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
- **Waypoints** - Place markers at key points in your narrative
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

1. Create or edit a post
2. Add the **Map GPX** block and upload your GPX file
3. Write your story, inserting **Map Marker** blocks at key points
4. Set coordinates for each marker (use the built-in address search, or paste from Google Maps)
5. Publish — the map automatically follows as readers scroll

### Blocks

**Map GPX** — Uploads and displays your GPS track. Settings: progress indicator (auto-follow on/off), elevation profile, default map style, GPX download toggle.

**Map Marker** — Places waypoints in your story. Settings: title, coordinates (with address search autocomplete), zoom level, optional emoji icon.

GPX files aren't required — Mapthread also works with just markers. Adding a Map GPX block without a file connects markers with straight lines.

---

## Requirements

- **WordPress:** 6.0+ with a block theme
- **PHP:** 7.4+
- **Browsers:** Chrome 105+, Safari 15.4+
- **Tested themes:** Twenty Twenty-Four, Twenty Twenty-Five

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

## Credits

**Libraries:** [Leaflet.js](https://leafletjs.com/) (BSD-2-Clause), [Chart.js](https://www.chartjs.org/) (MIT), [Leaflet.fullscreen](https://github.com/brunob/leaflet.fullscreen) (MIT), [Lucide](https://lucide.dev/) (ISC)

**Services:** [OpenStreetMap](https://www.openstreetmap.org/) tiles & [Nominatim](https://nominatim.org/) geocoding, [Open-Elevation API](https://open-elevation.com/), optional tile providers ([Mapbox](https://www.mapbox.com/), [Thunderforest](https://www.thunderforest.com/), [JawgMaps](https://www.jawg.io/), [Stadia Maps](https://stadiamaps.com/))

See [readme.txt](readme.txt) for full external service documentation including data usage and privacy policies.

## License

[GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html). All bundled libraries are GPL-compatible.

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