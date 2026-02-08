<?php
/**
 * Map GPX Block - Server-side Render
 *
 * @package Pathway
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

// Get attributes with defaults.
$attachment_id           = isset( $attributes['attachmentId'] ) ? absint( $attributes['attachmentId'] ) : 0;
$bounds                  = isset( $attributes['bounds'] ) ? $attributes['bounds'] : array(
	'north' => 0,
	'south' => 0,
	'east'  => 0,
	'west'  => 0,
);
$show_progress_indicator = isset( $attributes['showProgressIndicator'] ) ? $attributes['showProgressIndicator'] : true;
$show_elevation_profile  = isset( $attributes['showElevationProfile'] ) ? $attributes['showElevationProfile'] : true;

// Get the GPX URL from the attachment ID (more reliable than stored URL).
$gpx_url = '';
if ( $attachment_id ) {
	$gpx_url = wp_get_attachment_url( $attachment_id );
}

// Build wrapper attributes.
$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'pathway-map-gpx',
		'data-attachment-id'   => esc_attr( $attachment_id ),
		'data-gpx-url'         => esc_url( $gpx_url ),
		'data-bounds'          => esc_attr( wp_json_encode( $bounds ) ),
		'data-show-progress'   => $show_progress_indicator ? 'true' : 'false',
		'data-show-elevation'  => $show_elevation_profile ? 'true' : 'false',
	)
);

// Output the block.
printf( '<div %s></div>', $wrapper_attributes );
