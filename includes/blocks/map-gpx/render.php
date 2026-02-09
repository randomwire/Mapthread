<?php
/**
 * Map GPX Block - Server-side Render
 *
 * @package Mapthread
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Get attributes with defaults.
$mapthread_attachment_id           = isset( $attributes['attachmentId'] ) ? absint( $attributes['attachmentId'] ) : 0;
$mapthread_bounds                  = isset( $attributes['bounds'] ) ? $attributes['bounds'] : array(
	'north' => 0,
	'south' => 0,
	'east'  => 0,
	'west'  => 0,
);
$mapthread_show_progress_indicator = isset( $attributes['showProgressIndicator'] ) ? $attributes['showProgressIndicator'] : true;
$mapthread_show_elevation_profile  = isset( $attributes['showElevationProfile'] ) ? $attributes['showElevationProfile'] : true;
$mapthread_default_map_layer       = isset( $attributes['defaultMapLayer'] ) ? $attributes['defaultMapLayer'] : 'Street';

// Get the GPX URL from the attachment ID (more reliable than stored URL).
$mapthread_gpx_url = '';
if ( $mapthread_attachment_id ) {
	$mapthread_gpx_url = wp_get_attachment_url( $mapthread_attachment_id );
}

// Build wrapper attributes.
$mapthread_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'mapthread-map-gpx',
		'data-attachment-id'   => esc_attr( $mapthread_attachment_id ),
		'data-gpx-url'         => esc_url( $mapthread_gpx_url ),
		'data-bounds'          => esc_attr( wp_json_encode( $mapthread_bounds ) ),
		'data-show-progress'   => $mapthread_show_progress_indicator ? 'true' : 'false',
		'data-show-elevation'  => $mapthread_show_elevation_profile ? 'true' : 'false',
		'data-default-layer'   => esc_attr( $mapthread_default_map_layer ),
	)
);

// Output the block.
printf( '<div %s></div>', wp_kses_post( $mapthread_wrapper_attributes ) );
