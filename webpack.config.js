/**
 * Webpack Configuration for Mapthread Plugin
 *
 * @package Mapthread
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
    ...defaultConfig,
    devtool: 'source-map',
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
};
