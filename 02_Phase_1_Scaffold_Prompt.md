# Phase 1: Project Scaffold & Setup

## Objective
Initialize the Pathway plugin project structure with all necessary tooling, dependencies, and WordPress integration.

## Context
- **Project directory:** `/Users/davidgilbert/Github/Pathways`
- **WordPress test site:** `~/Local Sites/testsite`
- **Development approach:** Bundle all dependencies, initialize git, symlink to WP for testing

## Tasks

### 1. Initialize Git Repository
```bash
cd /Users/davidgilbert/Github/Pathways
git init
```

Create `.gitignore`:
```
# WordPress
wp-admin/
wp-includes/
wp-content/themes/
wp-content/plugins/*
!wp-content/plugins/pathway/

# Dependencies
node_modules/
vendor/

# Build artifacts
build/
dist/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
```

Initial commit with existing docs:
```bash
git add .
git commit -m "Initial commit: requirements and workflow docs"
```

### 2. Initialize npm and Install Dependencies

Create `package.json`:
```json
{
  "name": "pathway",
  "version": "0.1.0",
  "description": "WordPress plugin for interactive map-based storytelling",
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start",
    "lint:js": "wp-scripts lint-js",
    "format": "wp-scripts format",
    "packages-update": "wp-scripts packages-update"
  },
  "keywords": [
    "wordpress",
    "gutenberg",
    "block",
    "map",
    "gpx",
    "leaflet"
  ],
  "author": "David Gilbert",
  "license": "GPL-2.0-or-later",
  "devDependencies": {
    "@wordpress/scripts": "^28.0.0"
  },
  "dependencies": {
    "leaflet": "^1.9.4"
  }
}
```

Install dependencies:
```bash
npm install
```

### 3. Create Plugin Directory Structure

Create the following directory structure:
```
pathway/
├── pathway.php
├── includes/
│   ├── class-pathway.php
│   └── blocks/
│       ├── map-gpx/
│       │   ├── block.json
│       │   ├── edit.js
│       │   ├── save.js
│       │   ├── index.js
│       │   └── style.scss
│       └── map-marker/
│           ├── block.json
│           ├── edit.js
│           ├── save.js
│           ├── index.js
│           └── style.scss
├── assets/
│   ├── js/
│   │   └── pathway-frontend.js
│   └── css/
│       └── pathway-frontend.scss
├── package.json
├── .gitignore
└── README.md
```

Create all directories:
```bash
mkdir -p includes/blocks/map-gpx
mkdir -p includes/blocks/map-marker
mkdir -p assets/js
mkdir -p assets/css
```

### 4. Create Main Plugin File

**File:** `pathway.php`

```php
<?php
/**
 * Plugin Name:       Pathway
 * Plugin URI:        https://github.com/davidgilbert/pathway
 * Description:       Interactive map-based storytelling for WordPress. Combine narratives with GPX tracks and waypoints.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            David Gilbert
 * Author URI:        https://github.com/davidgilbert
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pathway
 * Domain Path:       /languages
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'PATHWAY_VERSION', '0.1.0' );
define( 'PATHWAY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PATHWAY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'PATHWAY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Include the main plugin class
require_once PATHWAY_PLUGIN_DIR . 'includes/class-pathway.php';

/**
 * Initialize the plugin
 */
function pathway_init() {
    $pathway = new Pathway();
    $pathway->run();
}
add_action( 'plugins_loaded', 'pathway_init' );

/**
 * Activation hook
 */
function pathway_activate() {
    // Flush rewrite rules on activation
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'pathway_activate' );

/**
 * Deactivation hook
 */
function pathway_deactivate() {
    // Flush rewrite rules on deactivation
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'pathway_deactivate' );
```

### 5. Create Core Plugin Class

**File:** `includes/class-pathway.php`

```php
<?php
/**
 * Core plugin class
 *
 * @package Pathway
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main Pathway class
 */
class Pathway {

    /**
     * Constructor
     */
    public function __construct() {
        // Constructor intentionally left empty
        // Initialization happens in run() method
    }

    /**
     * Run the plugin
     */
    public function run() {
        // Register blocks
        add_action( 'init', array( $this, 'register_blocks' ) );
        
        // Enqueue frontend assets
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
        
        // Add body class for posts with Pathway blocks
        add_filter( 'body_class', array( $this, 'add_body_class' ) );
    }

    /**
     * Register custom blocks
     */
    public function register_blocks() {
        // Register Map GPX block
        register_block_type( PATHWAY_PLUGIN_DIR . 'includes/blocks/map-gpx' );
        
        // Register Map Marker block
        register_block_type( PATHWAY_PLUGIN_DIR . 'includes/blocks/map-marker' );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        // Only load on singular posts/pages
        if ( ! is_singular() ) {
            return;
        }

        // Check if post has Pathway blocks
        if ( ! $this->has_pathway_blocks() ) {
            return;
        }

        // Enqueue Leaflet CSS
        wp_enqueue_style(
            'leaflet',
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            array(),
            '1.9.4'
        );

        // Enqueue Leaflet JS (will be bundled in future phases)
        wp_enqueue_script(
            'leaflet',
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            array(),
            '1.9.4',
            true
        );

        // Enqueue plugin frontend CSS
        wp_enqueue_style(
            'pathway-frontend',
            PATHWAY_PLUGIN_URL . 'build/pathway-frontend.css',
            array(),
            PATHWAY_VERSION
        );

        // Enqueue plugin frontend JS
        wp_enqueue_script(
            'pathway-frontend',
            PATHWAY_PLUGIN_URL . 'build/pathway-frontend.js',
            array( 'leaflet' ),
            PATHWAY_VERSION,
            true
        );
    }

    /**
     * Check if current post has Pathway blocks
     *
     * @return bool
     */
    private function has_pathway_blocks() {
        global $post;

        if ( ! $post ) {
            return false;
        }

        // Check for Map GPX block
        if ( has_block( 'pathway/map-gpx', $post ) ) {
            return true;
        }

        // Check for Map Marker block
        if ( has_block( 'pathway/map-marker', $post ) ) {
            return true;
        }

        return false;
    }

    /**
     * Add body class for posts with Pathway blocks
     *
     * @param array $classes Existing body classes
     * @return array Modified body classes
     */
    public function add_body_class( $classes ) {
        if ( is_singular() && $this->has_pathway_blocks() ) {
            $classes[] = 'has-pathway-blocks';
        }

        return $classes;
    }
}
```

### 6. Create Placeholder Files for Future Phases

**Map GPX Block - `includes/blocks/map-gpx/index.js`:**
```javascript
/**
 * Map GPX Block
 * 
 * @package Pathway
 */

// Placeholder for Phase 2
console.log('Map GPX block will be implemented in Phase 2');
```

**Map Marker Block - `includes/blocks/map-marker/index.js`:**
```javascript
/**
 * Map Marker Block
 * 
 * @package Pathway
 */

// Placeholder for Phase 3
console.log('Map Marker block will be implemented in Phase 3');
```

**Frontend JS - `assets/js/pathway-frontend.js`:**
```javascript
/**
 * Pathway Frontend JavaScript
 * 
 * @package Pathway
 */

// Placeholder for Phase 4
console.log('Frontend map integration will be implemented in Phase 4');
```

**Frontend CSS - `assets/css/pathway-frontend.scss`:**
```scss
/**
 * Pathway Frontend Styles
 * 
 * @package Pathway
 */

// Placeholder for Phase 5
.pathway-story-container {
    // Layout will be implemented in Phase 5
}
```

### 7. Create README

**File:** `README.md`

```markdown
# Pathway

Interactive map-based storytelling for WordPress.

## Description

Pathway enables content creators to combine narratives with interactive maps. Upload a GPX track, add markers to your story, and let readers follow along as the map pans and zooms automatically.

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Block theme (not classic theme)

## Development

### Setup

```bash
npm install
npm run build
```

### Testing

Symlink to Local WordPress installation:

```bash
ln -s /Users/davidgilbert/Github/Pathways ~/Local\ Sites/testsite/app/public/wp-content/plugins/pathway
```

### Build

- `npm run build` - Production build
- `npm run start` - Development build with watch
- `npm run lint:js` - Lint JavaScript
- `npm run format` - Format code

## Target Themes

- Twenty Twenty-Four
- Twenty Twenty-Five

## License

GPL v2 or later
```

### 8. Symlink to WordPress Installation

Create symlink:
```bash
ln -s /Users/davidgilbert/Github/Pathways ~/Local\ Sites/testsite/app/public/wp-content/plugins/pathway
```

Verify symlink:
```bash
ls -la ~/Local\ Sites/testsite/app/public/wp-content/plugins/ | grep pathway
```

### 9. Initial Build (Even Though Empty)

Run initial build to verify tooling:
```bash
npm run build
```

This will create the `build/` directory and verify @wordpress/scripts is working.

### 10. Commit All Changes

```bash
git add .
git commit -m "Phase 1: Project scaffold complete

- Initialize npm with @wordpress/scripts and Leaflet
- Create plugin directory structure
- Add main plugin file with activation hooks
- Add core Pathway class with block registration
- Create placeholder files for blocks and frontend
- Symlink to Local WordPress test site
- Add README with development instructions"
```

## Verification Checklist

After completing all tasks, verify:

- [ ] Git repository initialized with .gitignore
- [ ] `node_modules/` directory exists and contains @wordpress/scripts
- [ ] `build/` directory created (even if mostly empty)
- [ ] Symlink exists: `~/Local Sites/testsite/app/public/wp-content/plugins/pathway`
- [ ] Plugin appears in WordPress admin under Plugins
- [ ] Plugin can be activated without errors
- [ ] All placeholder files exist in correct locations
- [ ] Git has 2 commits (initial docs + scaffold)

## Status Report Format

Report back with:

```markdown
# Phase 1 Status Report

## Completed Tasks
- [x] Task name (✓ success / ⚠️ warning / ❌ error)
- [x] Task name
...

## Created Files
- pathway.php (XXX lines)
- includes/class-pathway.php (XXX lines)
- package.json (XXX lines)
...

## Git Commits
- Commit 1: [hash] - message
- Commit 2: [hash] - message

## WordPress Integration
- Symlink: [✓ created / ❌ failed]
- Plugin visible in WP admin: [✓ yes / ❌ no]
- Plugin activates: [✓ yes / ❌ no / ⚠️ with warnings]

## Build Output
- npm install: [✓ success / ❌ failed]
- npm run build: [✓ success / ⚠️ warnings / ❌ failed]
- build/ directory size: XXX KB

## Issues Encountered
[List any problems, warnings, or unexpected behavior]

## Ready for Phase 2
[✓ Yes - ready to implement Map GPX block / ❌ No - blockers remain]

## Notes
[Any additional observations or recommendations]
```

## Important Notes

- DO NOT implement any block functionality yet (that's Phase 2 & 3)
- Focus ONLY on scaffolding and tooling setup
- Verify plugin activates in WordPress without errors
- All placeholder files should have minimal comments explaining they're for future phases
- If symlink fails, report the error but continue (we can fix it separately)
- Run `npm run build` even though there's minimal code - we need to verify the toolchain works
