/**
 * Webpack Configuration for Mapthread Plugin
 *
 * @package Mapthread
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	...defaultConfig,
	entry: {
		// Block entry points
		'blocks/map-gpx/index': path.resolve( __dirname, 'includes/blocks/map-gpx/index.js' ),
		'blocks/map-gpx/style': path.resolve( __dirname, 'includes/blocks/map-gpx/style.scss' ),
		'blocks/map-marker/index': path.resolve( __dirname, 'includes/blocks/map-marker/index.js' ),
		'blocks/map-marker/style': path.resolve( __dirname, 'includes/blocks/map-marker/style.scss' ),
		// Frontend assets
		'mapthread-frontend': path.resolve( __dirname, 'assets/js/mapthread-frontend.js' ),
		'mapthread-frontend-style': path.resolve( __dirname, 'assets/css/mapthread-frontend.scss' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
	plugins: [
		...( defaultConfig.plugins || [] ),
		new webpack.BannerPlugin( {
			banner: '/*! Mapthread | Source: https://github.com/randomwire/Mapthread | Build: npm run build */',
			raw: true,
		} ),
	],
	optimization: {
		...defaultConfig.optimization,
		minimizer: [
			new TerserPlugin( {
				extractComments: false,
				parallel: true,
				terserOptions: {
					compress: { passes: 2 },
					mangle: { reserved: [ '__', '_n', '_nx', '_x' ] },
					format: {
						// Preserve translators comments (for i18n) and /*! banner comments
						comments: /translators:|^!/,
					},
				},
			} ),
		],
	},
};
