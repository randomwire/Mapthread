<?php
/**
 * Plugin Name:       Pathway
 * Plugin URI:        https://github.com/davidgilbert/pathway
 * Description:       Interactive map-based storytelling for WordPress. Combine narratives with GPX tracks and waypoints.
 * Version:           1.2.0
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
define( 'PATHWAY_VERSION', '1.2.0' );
define( 'PATHWAY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PATHWAY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'PATHWAY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Include the main plugin class
require_once PATHWAY_PLUGIN_DIR . 'includes/class-pathway.php';
require_once PATHWAY_PLUGIN_DIR . 'includes/class-pathway-elevation-api.php';

/**
 * Initialize the plugin
 */
function pathway_init() {
    $pathway = new Pathway();
    $pathway->run();

    $pathway_elevation_api = new Pathway_Elevation_API();
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
