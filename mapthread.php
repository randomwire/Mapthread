<?php
/**
 * Plugin Name:       Mapthread
 * Plugin URI:        https://github.com/randomwire/Mapthread
 * Description:       Interactive map-based storytelling for WordPress. Combine narratives with GPX tracks and waypoints.
 * Version:           1.5.7
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            David Gilbert
 * Author URI:        https://randomwire.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mapthread
 * Domain Path:       /languages
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'MAPTHREAD_VERSION', get_file_data( __FILE__, array( 'Version' => 'Version' ) )['Version'] );
define( 'MAPTHREAD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MAPTHREAD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MAPTHREAD_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Include the main plugin class
require_once MAPTHREAD_PLUGIN_DIR . 'includes/class-mapthread.php';
require_once MAPTHREAD_PLUGIN_DIR . 'includes/class-mapthread-settings.php';
require_once MAPTHREAD_PLUGIN_DIR . 'includes/class-mapthread-elevation-api.php';

/**
 * Initialize the plugin
 */
function mapthread_init() {
    $mapthread = new Mapthread();
    $mapthread->run();

    $mapthread_elevation_api = new Mapthread_Elevation_API();
}
add_action( 'plugins_loaded', 'mapthread_init' );

/**
 * Activation hook
 */
function mapthread_activate() {
    // Flush rewrite rules on activation
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'mapthread_activate' );

/**
 * Deactivation hook
 */
function mapthread_deactivate() {
    // Flush rewrite rules on deactivation
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'mapthread_deactivate' );
