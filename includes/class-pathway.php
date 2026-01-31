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
            PATHWAY_PLUGIN_URL . 'build/pathway-frontend-style.css',
            array( 'leaflet' ),
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
