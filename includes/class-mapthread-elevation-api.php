<?php
/**
 * Mapthread Elevation API Handler
 *
 * Fetches elevation data from Open-Elevation API for GPX files lacking elevation.
 *
 * @package Mapthread
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Mapthread_Elevation_API
 *
 * Handles elevation data fetching via Open-Elevation API with smart sampling and caching.
 */
class Mapthread_Elevation_API {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		register_rest_route(
			'mapthread/v1',
			'/elevation',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'get_elevation' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'attachment_id' => [
						'required' => true,
						'type'     => 'integer',
					],
					'coordinates'   => [
						'required' => true,
						'type'     => 'array',
					],
				],
			]
		);
	}

	/**
	 * Get elevation data for coordinates.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error Response object or error.
	 */
	public function get_elevation( $request ) {
		$attachment_id = $request->get_param( 'attachment_id' );
		$coords        = $request->get_param( 'coordinates' );

		// Check post meta cache first (permanent).
		$cached = get_post_meta( $attachment_id, '_mapthread_elevations', true );
		if ( ! empty( $cached ) && is_array( $cached ) ) {
			return rest_ensure_response(
				[
					'success'    => true,
					'elevations' => $cached,
					'source'     => 'cache',
				]
			);
		}

		// Sample coordinates (every 10th point for large tracks).
		$sampled = $this->sample_coordinates( $coords );

		// Fetch from Open-Elevation API.
		$elevations = $this->fetch_from_open_elevation( $sampled['coords'] );

		if ( is_wp_error( $elevations ) ) {
			return rest_ensure_response(
				[
					'success' => false,
					'error'   => $elevations->get_error_message(),
				]
			);
		}

		// Interpolate back to full resolution.
		$full_elevations = $this->interpolate_elevations(
			$elevations,
			$sampled['indices'],
			count( $coords )
		);

		// Cache permanently in post meta.
		update_post_meta( $attachment_id, '_mapthread_elevations', $full_elevations );

		return rest_ensure_response(
			[
				'success'    => true,
				'elevations' => $full_elevations,
				'source'     => 'api',
			]
		);
	}

	/**
	 * Sample coordinates to reduce API calls.
	 *
	 * @param array $coords Array of [lat, lng] coordinates.
	 * @return array Array with 'coords' and 'indices' keys.
	 */
	private function sample_coordinates( $coords ) {
		$count = count( $coords );
		if ( $count <= 50 ) {
			// Small track, use all points.
			return [
				'coords'  => $coords,
				'indices' => range( 0, $count - 1 ),
			];
		}

		// Sample every Nth point.
		$sample_rate     = max( 10, floor( $count / 50 ) );
		$sampled_coords  = [];
		$indices         = [];

		for ( $i = 0; $i < $count; $i += $sample_rate ) {
			$sampled_coords[] = $coords[ $i ];
			$indices[]        = $i;
		}

		// Always include last point.
		if ( end( $indices ) !== $count - 1 ) {
			$sampled_coords[] = end( $coords );
			$indices[]        = $count - 1;
		}

		return [
			'coords'  => $sampled_coords,
			'indices' => $indices,
		];
	}

	/**
	 * Fetch elevation data from Open-Elevation API.
	 *
	 * @param array $coords Array of [lat, lng] coordinates.
	 * @return array|WP_Error Array of elevations or error.
	 */
	private function fetch_from_open_elevation( $coords ) {
		// Format: [{"latitude": 41.161758, "longitude": -8.583933}, ...].
		$locations = array_map(
			function ( $coord ) {
				return [
					'latitude'  => $coord[0],
					'longitude' => $coord[1],
				];
			},
			$coords
		);

		$response = wp_remote_post(
			'https://api.open-elevation.com/api/v1/lookup',
			[
				'body'    => wp_json_encode( [ 'locations' => $locations ] ),
				'headers' => [ 'Content-Type' => 'application/json' ],
				'timeout' => 30,
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status_code ) {
			return new WP_Error(
				'api_error',
				sprintf( 'Open-Elevation API returned status %d', $status_code )
			);
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! isset( $body['results'] ) ) {
			return new WP_Error( 'invalid_response', 'Invalid API response format' );
		}

		// Extract elevations.
		return array_map(
			function ( $result ) {
				return isset( $result['elevation'] ) ? (float) $result['elevation'] : null;
			},
			$body['results']
		);
	}

	/**
	 * Interpolate elevations for all points from sampled data.
	 *
	 * @param array $sampled_elevations Elevations for sampled points.
	 * @param array $sampled_indices Indices of sampled points.
	 * @param int   $total_count Total number of points.
	 * @return array Full array of interpolated elevations.
	 */
	private function interpolate_elevations( $sampled_elevations, $sampled_indices, $total_count ) {
		$result = array_fill( 0, $total_count, null );

		// Fill in sampled points.
		foreach ( $sampled_indices as $i => $index ) {
			$result[ $index ] = $sampled_elevations[ $i ];
		}

		// Linear interpolation between sampled points.
		for ( $i = 0; $i < count( $sampled_indices ) - 1; $i++ ) {
			$start_idx = $sampled_indices[ $i ];
			$end_idx   = $sampled_indices[ $i + 1 ];
			$start_ele = $sampled_elevations[ $i ];
			$end_ele   = $sampled_elevations[ $i + 1 ];

			if ( null === $start_ele || null === $end_ele ) {
				continue;
			}

			$span = $end_idx - $start_idx;
			for ( $j = $start_idx + 1; $j < $end_idx; $j++ ) {
				$t            = ( $j - $start_idx ) / $span;
				$result[ $j ] = $start_ele + $t * ( $end_ele - $start_ele );
			}
		}

		return $result;
	}
}
