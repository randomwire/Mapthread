<?php
/**
 * Core plugin class
 *
 * @package Mapthread
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main Mapthread class
 */
class Mapthread {

    /**
     * Settings instance.
     *
     * @var Mapthread_Settings
     */
    private $settings;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = new Mapthread_Settings();
    }

    /**
     * Run the plugin
     */
    public function run() {
        // Initialize settings page.
        $this->settings->run();

        // Register blocks
        add_action( 'init', array( $this, 'register_blocks' ) );

        // Enqueue frontend assets
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );

        // Localize block editor scripts with available layers.
        add_action( 'enqueue_block_editor_assets', array( $this, 'localize_editor_assets' ) );

        // Add body class for posts with Mapthread blocks
        add_filter( 'body_class', array( $this, 'add_body_class' ) );

        // Allow GPX file uploads
        add_filter( 'upload_mimes', array( $this, 'allow_gpx_uploads' ) );
        add_filter( 'wp_check_filetype_and_ext', array( $this, 'check_gpx_filetype' ), 10, 4 );

        // Add donate link to plugin row meta
        add_filter( 'plugin_row_meta', array( $this, 'add_plugin_row_meta' ), 10, 2 );
    }

    /**
     * Register custom blocks
     */
    public function register_blocks() {
        // Register Map GPX block
        register_block_type( MAPTHREAD_PLUGIN_DIR . 'includes/blocks/map-gpx' );
        wp_set_script_translations( 'mapthread-map-gpx-editor-script', 'mapthread', MAPTHREAD_PLUGIN_DIR . 'languages' );

        // Register Map Marker block
        register_block_type( MAPTHREAD_PLUGIN_DIR . 'includes/blocks/map-marker' );
        wp_set_script_translations( 'mapthread-map-marker-editor-script', 'mapthread', MAPTHREAD_PLUGIN_DIR . 'languages' );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        // Only load on singular posts/pages
        if ( ! is_singular() ) {
            return;
        }

        // Check if post has Mapthread blocks
        if ( ! $this->has_mapthread_blocks() ) {
            return;
        }

        // Note: Leaflet CSS and JS are now bundled in mapthread-frontend assets via webpack

        // Enqueue Leaflet CSS (bundled from node_modules)
        wp_enqueue_style(
            'mapthread-leaflet',
            MAPTHREAD_PLUGIN_URL . 'build/mapthread-frontend.css',
            array(),
            MAPTHREAD_VERSION
        );

        // Enqueue plugin frontend CSS (custom Mapthread styles)
        wp_enqueue_style(
            'mapthread-frontend',
            MAPTHREAD_PLUGIN_URL . 'build/mapthread-frontend-style.css',
            array( 'mapthread-leaflet' ),
            MAPTHREAD_VERSION
        );

        // Enqueue plugin frontend JS (Leaflet is now bundled inside)
        wp_enqueue_script(
            'mapthread-frontend',
            MAPTHREAD_PLUGIN_URL . 'build/mapthread-frontend.js',
            array(),
            MAPTHREAD_VERSION,
            true
        );

        // Pass layers configuration to frontend JS.
        wp_localize_script(
            'mapthread-frontend',
            'mapthreadConfig',
            array( 'layers' => $this->settings->get_layers_config() )
        );

        // Pass translated strings to frontend JS.
        wp_localize_script(
            'mapthread-frontend',
            'mapthreadStrings',
            array(
                'showMap'         => __( 'Show map', 'mapthread' ),
                'hideMap'         => __( 'Hide map', 'mapthread' ),
                'scrollZoomMac'   => __( 'Use ⌘ or Ctrl + scroll to zoom', 'mapthread' ),
                'scrollZoomOther' => __( 'Use Ctrl + scroll to zoom', 'mapthread' ),
            )
        );
    }

    /**
     * Localize block editor scripts with available layer options.
     */
    public function localize_editor_assets() {
        wp_localize_script(
            'mapthread-map-gpx-editor-script',
            'mapthreadConfig',
            array( 'availableLayers' => $this->settings->get_available_layer_options() )
        );
    }

    /**
     * Check if current post has Mapthread blocks
     *
     * @return bool
     */
    private function has_mapthread_blocks() {
        global $post;

        if ( ! $post ) {
            return false;
        }

        // Check for Map GPX block
        if ( has_block( 'mapthread/map-gpx', $post ) ) {
            return true;
        }

        // Check for Map Marker block
        if ( has_block( 'mapthread/map-marker', $post ) ) {
            return true;
        }

        return false;
    }

    /**
     * Add body class for posts with Mapthread blocks
     *
     * @param array $classes Existing body classes
     * @return array Modified body classes
     */
    public function add_body_class( $classes ) {
        if ( is_singular() && $this->has_mapthread_blocks() ) {
            $classes[] = 'has-mapthread-blocks';
        }

        return $classes;
    }

    /**
     * Add donate link to plugin row meta on the Plugins page.
     *
     * @param array  $links Existing row meta links.
     * @param string $file  Plugin file path.
     * @return array Modified row meta links.
     */
    public function add_plugin_row_meta( $links, $file ) {
        if ( plugin_basename( MAPTHREAD_PLUGIN_DIR . 'mapthread.php' ) === $file ) {
            $links[] = '<a href="https://ko-fi.com/randomwire" target="_blank" rel="noopener noreferrer">'
                . esc_html__( 'Donate', 'mapthread' )
                . '</a>';
        }
        return $links;
    }

    /**
     * Allow GPX file uploads
     *
     * @param array $mimes Existing MIME types
     * @return array Modified MIME types
     */
    public function allow_gpx_uploads( $mimes ) {
        $mimes['gpx'] = 'application/gpx+xml';
        return $mimes;
    }

    /**
     * Check GPX file type on upload
     *
     * @param array $data File data from wp_check_filetype_and_ext
     * @param string $file Full path to the file
     * @param string $filename The name of the file
     * @param array $mimes Array of allowed MIME types
     * @return array Modified file data
     */
    public function check_gpx_filetype( $data, $file, $filename, $mimes ) {
        $ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );

        if ( $ext === 'gpx' ) {
            // Read first few bytes to verify it's XML with GPX content
            $file_content = file_get_contents( $file, false, null, 0, 500 );

            if ( $file_content !== false &&
                 strpos( $file_content, '<?xml' ) !== false &&
                 strpos( $file_content, '<gpx' ) !== false ) {
                // It's a valid GPX file
                $data['ext'] = 'gpx';
                $data['type'] = 'application/gpx+xml';
                $data['proper_filename'] = $filename;
            }
        }

        return $data;
    }
}
