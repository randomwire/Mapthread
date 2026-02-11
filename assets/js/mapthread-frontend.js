/**
 * Mapthread Frontend JavaScript
 *
 * Handles map initialization, GPX rendering, and scroll-based map following
 *
 * @package Mapthread
 */

// Import Leaflet CSS and JS (bundled via webpack)
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon paths when bundled with webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Import Leaflet fullscreen plugin
import { FullScreen } from 'leaflet.fullscreen';
import 'leaflet.fullscreen/dist/Control.FullScreen.css';

import { Chart, LineController, LineElement, PointElement, LinearScale, Filler, Tooltip } from 'chart.js';
Chart.register( LineController, LineElement, PointElement, LinearScale, Filler, Tooltip );

( function() {
    'use strict';

    // State
    let map = null;
    let gpxLayer = null;
    let gpxLayerWalked = null;
    let markers = [];
    let markerLayers = [];
    let activeMarkerIndex = null;
    let isFollowMode = true;
    let scrollRafId = null;             // Track requestAnimationFrame ID
    let initialBounds = null;
    let initialZoom = 14;               // Initial zoom level from fitBounds
    let cachedMarkerElements = null;    // Cached DOM query results

    // Progress indicator state
    let trackCoords = [];               // Full coordinate array
    let trackDistances = [];            // Cumulative distance at each point
    let totalTrackDistance = 0;         // Total track length
    let cameraCoords = [];              // Chaikin-smoothed coords for camera (not drawn)
    let cameraTrackDistances = [];      // Cumulative distances along cameraCoords
    let cameraTotalDistance = 0;        // Total length of smoothed camera path
    let markerTrackPositions = [];      // Each marker's position ratio (0-1) along track
    let walkedPolyline = null;          // Polyline for walked portion
    let remainingPolyline = null;       // Polyline for remaining portion
    let showProgressIndicator = true;   // Setting from block
    let showElevationProfile = true;    // Setting from block
    let defaultMapLayer = 'Street';     // Which layer to show on load
    let lastSmoothedProgress = null;    // For smooth interpolation
    let targetProgress = 0;             // Raw scroll-derived progress target
    let targetCurrentZoom = 14;         // Zoom at current segment start (matches DEFAULT_ZOOM)
    let targetNextZoom = 14;            // Zoom at current segment end (matches DEFAULT_ZOOM)
    let animationRafId = null;          // Continuous animation loop RAF ID
    let isMapDismissed = false;         // True when map is collapsed to corner tile
    let mapInteractionScrollListener = null; // Listener for re-enabling follow mode
    let scrollHintShown = false;            // True after hint has been shown once; prevents repeat flashing

    // Elevation profile state
    let trackElevations = [];           // Elevation in meters at each track point
    let elevationChart = null;          // Chart.js instance
    let elevationStats = null;          // { gain, loss } in metres

    // Camera smoothing constant
    const CAMERA_SMOOTHING = 0.2;       // Smoothing factor (0.15-0.3 range)

    // Configuration constants
    const ACTIVATION_THRESHOLD = 0.25;   // Marker activation position (25% from top)
    const RESET_ANIMATION_DURATION = 0.8; // flyToBounds duration for reset
    const MAX_SCROLL_DISTANCE = 1.0;     // Viewport height multiplier for progress
    const DEFAULT_ZOOM = 14;             // Default zoom level
    const BOUNDS_PADDING = [50, 50];     // Padding for fitBounds operations

    // Scroll detection thresholds
    const SCROLL_TOP_THRESHOLD = 10;     // Pixels from top to trigger reset

    // Timing and animation
    const MAP_INTERACTION_TIMEOUT = 100; // Delay for initial marker activation (ms)

    // Marker icon dimensions
    const ICON_SIZE = 14;                // Width and height of marker icon (pixels)

    // Dismiss control
    const DISMISS_TILE = '44px';         // Collapsed map tile size
    const ICON_CLOSE   = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>';
    const ICON_LAYERS  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><polygon points="8,2 15,5.5 8,9 1,5.5"/><path d="M1 8.5L8 12l7-3.5"/><path d="M1 11.5L8 15l7-3.5"/></svg>';
    const ICON_MAP_PIN = // Map-pin SVG used on the restore button
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" ' +
        'width="12" height="12" fill="currentColor" aria-hidden="true">' +
        '<path d="M8 0a5 5 0 0 0-5 5c0 4 5 11 5 11s5-7 5-11a5 5 0 0 0-5-5z' +
        'm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>';
    const ICON_ANCHOR = 7;               // Horizontal and vertical anchor point (center)
    const POPUP_ANCHOR_Y = -7;           // Popup offset above marker

    // Emoji marker icon dimensions
    const EMOJI_ICON_SIZE = 24;              // Width and height of emoji icon (pixels)
    const EMOJI_ICON_ANCHOR = 10;            // Center anchor point
    const EMOJI_POPUP_ANCHOR_Y = -10;        // Popup offset above emoji

    // Track visualization styling
    const TRACK_WALKED_COLOR = '#FFFFFF';         // White dotted trail
    const TRACK_WALKED_WIDTH = 2.5;               // Width in pixels
    const TRACK_WALKED_OPACITY = 1;               // Full opacity
    const TRACK_WALKED_DASH = '1, 4';             // Dash pattern (dot, gap)

    const TRACK_REMAINING_COLOR = '#E4572E';      // Vermilion solid line
    const TRACK_REMAINING_WIDTH = 4.5;            // Width in pixels
    const TRACK_REMAINING_OPACITY = 0.9;          // 90% opacity

    // Additional visualization colors
    const PROGRESS_INDICATOR_COLOR = '#E4572E';   // Vermilion
    const ELEVATION_CHART_FILL = 'rgba(79, 124, 172, 0.15)';     // Light blue
    const ELEVATION_CHART_BORDER = 'rgba(79, 124, 172, 0.6)';    // Medium blue
    const TOOLTIP_BACKGROUND = 'rgba(30, 30, 30, 0.92)';         // Dark translucent

    // Scroll states for state machine
    const ScrollState = {
        AT_BOTTOM: 'bottom',
        PRE_FIRST_MARKER: 'pre_first',
        FOLLOWING_MARKER: 'following',
    };

    /**
     * Determine current scroll state
     *
     * @param {number|null} activeMarker - Currently active marker index
     * @param {boolean} atBottom - Whether scrolled to bottom
     * @return {string} Current scroll state
     */
    function getScrollState( activeMarker, atBottom ) {
        if ( atBottom ) {
            return ScrollState.AT_BOTTOM;
        }
        if ( activeMarker === null ) {
            return ScrollState.PRE_FIRST_MARKER;
        }
        return ScrollState.FOLLOWING_MARKER;
    }

    /**
     * Calculate distance between two points using Haversine formula
     *
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @return {number} Distance in meters
     */
    function calculateDistance( lat1, lon1, lat2, lon2 ) {
        const R = 6371000; // Earth's radius in meters
        const dLat = ( lat2 - lat1 ) * Math.PI / 180;
        const dLon = ( lon2 - lon1 ) * Math.PI / 180;
        const a = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
                  Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
                  Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );
        const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
        return R * c;
    }

    /**
     * Linear interpolation between two numbers
     *
     * @param {number} a - Starting value
     * @param {number} b - Target value
     * @param {number} t - Interpolation factor (0-1)
     * @return {number} Interpolated value
     */
    function lerp( a, b, t ) {
        return a + ( b - a ) * t;
    }

    /**
     * Apply Chaikin's corner-cutting algorithm to smooth a coordinate array.
     * Each iteration replaces every segment [P0,P1] with two points at 25% and 75%.
     * The first and last points are preserved unchanged.
     *
     * @param {Array<[number,number]>} coords     Array of [lat, lng] pairs
     * @param {number}                 iterations Number of passes (2–4 recommended)
     * @returns {Array<[number,number]>}
     */
    function chaikinSmooth( coords, iterations ) {
        let pts = coords;
        for ( let iter = 0; iter < iterations; iter++ ) {
            const out = [ pts[ 0 ] ];
            for ( let i = 0; i < pts.length - 1; i++ ) {
                const p0 = pts[ i ];
                const p1 = pts[ i + 1 ];
                out.push( [ 0.75 * p0[ 0 ] + 0.25 * p1[ 0 ],
                    0.75 * p0[ 1 ] + 0.25 * p1[ 1 ] ] );
                out.push( [ 0.25 * p0[ 0 ] + 0.75 * p1[ 0 ],
                    0.25 * p0[ 1 ] + 0.75 * p1[ 1 ] ] );
            }
            out.push( pts[ pts.length - 1 ] );
            pts = out;
        }
        return pts;
    }

    /**
     * Calculate cumulative distances along track
     *
     * @param {Array} coords - Array of [lat, lng] coordinates
     * @return {Object} Object with distances array and total distance
     */
    function calculateTrackDistances( coords ) {
        const distances = [ 0 ];
        let totalDist = 0;

        for ( let i = 1; i < coords.length; i++ ) {
            const dist = calculateDistance(
                coords[ i - 1 ][ 0 ], coords[ i - 1 ][ 1 ],
                coords[ i ][ 0 ], coords[ i ][ 1 ]
            );
            totalDist += dist;
            distances.push( totalDist );
        }

        return { distances, totalDistance: totalDist };
    }

    /**
     * Find the index of the nearest track point to a given coordinate
     *
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {Array} coords - Array of [lat, lng] coordinates
     * @return {number} Index of nearest point
     */
    function findNearestTrackPoint( lat, lng, coords ) {
        let minDist = Infinity;
        let nearestIndex = 0;

        for ( let i = 0; i < coords.length; i++ ) {
            const dist = calculateDistance( lat, lng, coords[ i ][ 0 ], coords[ i ][ 1 ] );
            if ( dist < minDist ) {
                minDist = dist;
                nearestIndex = i;
            }
        }

        return nearestIndex;
    }

    /**
     * Calculates fractional positions (0-1) of each marker along the track.
     *
     * Creates markerTrackPositions array with normalized positions:
     * - Index 0: Virtual start point (position 0.0)
     * - Index 1-N: Actual marker positions (calculated by nearest track point)
     * - Index N+1: Virtual end point (position 1.0)
     *
     * @modifies {markerTrackPositions} - Populates global array
     * @requires {markers} - Global markers array must be populated
     * @requires {trackCoords} - Global track coordinates array must be populated
     *
     * @description
     * For each marker:
     * 1. Finds nearest track coordinate using Haversine distance
     * 2. Calculates cumulative distance along track to that point
     * 3. Normalizes to fractional position (0-1)
     *
     * Virtual endpoints ensure smooth transitions before first and after last marker.
     */
    function calculateMarkerTrackPositions() {
        if ( trackCoords.length === 0 || totalTrackDistance === 0 ) {
            // Maintain structure: [0, ...marker positions, 1]
            markerTrackPositions = [ 0, ...markers.map( () => 0 ), 1 ];
            return;
        }

        // Calculate positions for actual markers
        const actualMarkerPositions = markers.map( ( marker ) => {
            const nearestIndex = findNearestTrackPoint( marker.lat, marker.lng, trackCoords );
            return trackDistances[ nearestIndex ] / totalTrackDistance;
        } );

        // Add virtual endpoints: [0, marker1, marker2, ..., markerN, 1]
        markerTrackPositions = [ 0, ...actualMarkerPositions, 1 ];
    }

    /**
     * Returns the index of the first segment whose end distance >= targetDistance.
     *
     * @param {number} targetDistance - Distance along track in metres
     * @returns {number} Segment start index into trackCoords / trackDistances
     */
    function findSegmentAtDistance( targetDistance ) {
        let segmentIndex = 0;
        for ( let i = 1; i < trackDistances.length; i++ ) {
            if ( trackDistances[ i ] >= targetDistance ) {
                segmentIndex = i - 1;
                break;
            }
            segmentIndex = i - 1;
        }
        return segmentIndex;
    }

    /**
     * Gets the coordinate at a specific progress position along the track.
     *
     * Uses linear interpolation between track segments to find the exact coordinate
     * at the given fractional position (0 = start, 1 = end).
     *
     * @param {number} progress - Fractional position along track (0 to 1)
     * @returns {[number, number]|null} Latitude/longitude pair, or null if track empty
     *
     * @example
     * // Get coordinate at 50% along the track
     * const midpoint = getCoordinateAtProgress(0.5);
     * // Returns: [latitude, longitude]
     */
    function getCoordinateAtProgress( progress ) {
        if ( trackCoords.length === 0 ) {
            return null;
        }

        const targetDistance = progress * totalTrackDistance;
        const segmentIndex = findSegmentAtDistance( targetDistance );

        // If at the very end
        if ( segmentIndex >= trackCoords.length - 1 ) {
            return trackCoords[ trackCoords.length - 1 ];
        }

        // Interpolate within segment
        const segmentStart = trackDistances[ segmentIndex ];
        const segmentEnd = trackDistances[ segmentIndex + 1 ];
        const segmentLength = segmentEnd - segmentStart;

        if ( segmentLength === 0 ) {
            return trackCoords[ segmentIndex ];
        }

        const t = ( targetDistance - segmentStart ) / segmentLength;
        const lat = trackCoords[ segmentIndex ][ 0 ] + t * ( trackCoords[ segmentIndex + 1 ][ 0 ] - trackCoords[ segmentIndex ][ 0 ] );
        const lng = trackCoords[ segmentIndex ][ 1 ] + t * ( trackCoords[ segmentIndex + 1 ][ 1 ] - trackCoords[ segmentIndex ][ 1 ] );

        return [ lat, lng ];
    }

    /**
     * Like getCoordinateAtProgress() but follows the Chaikin-smoothed camera path.
     * Falls back to the raw track if cameraCoords hasn't been built yet.
     *
     * @param {number} progress - Fractional position along track (0 to 1)
     * @returns {Array<number>|null} [lat, lng] coordinate pair, or null
     */
    function getCameraCoordinateAtProgress( progress ) {
        if ( cameraCoords.length === 0 ) {
            return getCoordinateAtProgress( progress );
        }

        const targetDist = progress * cameraTotalDistance;
        let lo = 0, hi = cameraCoords.length - 2;
        while ( lo < hi ) {
            const mid = ( lo + hi ) >> 1;
            if ( cameraTrackDistances[ mid + 1 ] < targetDist ) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        const segIdx = lo;

        if ( segIdx >= cameraCoords.length - 1 ) {
            return cameraCoords[ cameraCoords.length - 1 ];
        }

        const segStart = cameraTrackDistances[ segIdx ];
        const segEnd   = cameraTrackDistances[ segIdx + 1 ];
        const segLen   = segEnd - segStart;
        if ( segLen === 0 ) {
            return cameraCoords[ segIdx ];
        }

        const t = ( targetDist - segStart ) / segLen;
        return [
            cameraCoords[ segIdx ][ 0 ] + t * ( cameraCoords[ segIdx + 1 ][ 0 ] - cameraCoords[ segIdx ][ 0 ] ),
            cameraCoords[ segIdx ][ 1 ] + t * ( cameraCoords[ segIdx + 1 ][ 1 ] - cameraCoords[ segIdx ][ 1 ] ),
        ];
    }

    /**
     * Gets all track coordinates from start up to a specific progress position.
     *
     * Returns the "walked" portion of the track as an array of coordinates.
     * If progress falls between segments, includes the interpolated coordinate.
     *
     * @param {number} progress - Fractional position along track (0 to 1)
     * @returns {Array<[number, number]>} Array of [lat, lng] coordinates
     *
     * @example
     * // Get first half of track
     * const walkedPath = getTrackUpToProgress(0.5);
     * // Returns: [[lat1, lng1], [lat2, lng2], ...]
     */
    function getTrackUpToProgress( progress ) {
        if ( trackCoords.length === 0 ) {
            return [];
        }

        const targetDistance = progress * totalTrackDistance;

        // Find all points up to this distance
        const points = [];
        for ( let i = 0; i < trackDistances.length; i++ ) {
            if ( trackDistances[ i ] <= targetDistance ) {
                points.push( trackCoords[ i ] );
            } else {
                break;
            }
        }

        // Add interpolated end point
        const endPoint = getCoordinateAtProgress( progress );
        if ( endPoint ) {
            points.push( endPoint );
        }

        return points;
    }

    /**
     * Get track coordinates from a given progress point to the end
     *
     * @param {number} progress - Progress ratio (0-1)
     * @return {Array} Array of [lat, lng] coordinates
     */
    // Note: getTrackFromProgress() removed - remaining polyline now always shows full track
    // This allows the white dotted walked trail to overlay the solid Vermilion background

    /**
     * Initialize progress indicator visualization
     */
    function initProgressIndicator() {
        if ( ! showProgressIndicator || trackCoords.length === 0 || ! map ) {
            return;
        }

        // Track colors
        const walkedColor = TRACK_WALKED_COLOR;
        const remainingColor = TRACK_REMAINING_COLOR;

        // Create remaining polyline first (background layer - full track)
        remainingPolyline = L.polyline( trackCoords, {
            color: remainingColor,
            weight: TRACK_REMAINING_WIDTH,
            opacity: TRACK_REMAINING_OPACITY,
        } ).addTo( map );

        // Create walked polyline second (foreground layer - starts at first point)
        walkedPolyline = L.polyline( [ trackCoords[ 0 ] ], {
            color: walkedColor,
            weight: TRACK_WALKED_WIDTH,
            opacity: TRACK_WALKED_OPACITY,
            dashArray: TRACK_WALKED_DASH,
        } ).addTo( map );

        // Remove original gpxLayer and its overlay (replaced by split polylines)
        if ( gpxLayer ) {
            map.removeLayer( gpxLayer );
            gpxLayer = null;
        }
        if ( gpxLayerWalked ) {
            map.removeLayer( gpxLayerWalked );
            gpxLayerWalked = null;
        }
    }

    /**
     * Calculate scroll progress before first marker is reached
     *
     * @return {number} Progress ratio (0-1)
     */
    function calculatePreMarkerProgress() {
        if ( markers.length === 0 ) {
            return 0;
        }

        const markerElements = getMarkerElements();
        const firstMarker = markerElements[ 0 ];
        if ( ! firstMarker ) {
            return 0;
        }

        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * ACTIVATION_THRESHOLD;
        const firstMarkerRect = firstMarker.getBoundingClientRect();

        // Calculate how far we've scrolled from top toward the first marker
        const distanceFromThreshold = firstMarkerRect.top - threshold;
        const maxDistance = viewportHeight * MAX_SCROLL_DISTANCE;

        if ( distanceFromThreshold >= maxDistance ) {
            return 0; // Haven't started scrolling yet
        }

        // Progress from 0 to 1 as marker moves from bottom of screen to threshold
        const progress = 1 - ( distanceFromThreshold / maxDistance );
        return Math.max( 0, Math.min( 1, progress ) );
    }

    /**
     * Calculate scroll progress between two markers
     *
     * @param {number} activeIndex - Index of currently active marker
     * @return {number} Progress ratio (0-1)
     */
    function calculateBetweenMarkerProgress( activeIndex ) {
        if ( markers.length === 0 ) {
            return 0;
        }

        const markerElements = getMarkerElements();
        const currentEl = markerElements[ activeIndex ];
        const nextEl = markerElements[ activeIndex + 1 ];

        if ( ! currentEl ) {
            return 0;
        }

        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * ACTIVATION_THRESHOLD;
        const currentRect = currentEl.getBoundingClientRect();

        // If no next marker, progress to 1 as we scroll past the last marker
        if ( ! nextEl ) {
            const progress = ( threshold - currentRect.top ) / threshold;
            return Math.max( 0, Math.min( 1, progress ) );
        }

        const nextRect = nextEl.getBoundingClientRect();

        // Calculate progress from current marker to next marker
        const totalDistance = nextRect.top - currentRect.top;
        if ( totalDistance <= 0 ) {
            return 0;
        }

        const currentProgress = threshold - currentRect.top;
        return Math.max( 0, Math.min( 1, currentProgress / totalDistance ) );
    }

    /**
     * Calculates scroll progress (0-1) for a given marker's section of the page.
     *
     * Determines how far the user has scrolled through the marker's content section
     * based on viewport position relative to marker's top and next marker's top.
     *
     * @param {number|null} activeIndex - Index of current marker, or null for pre-first-marker
     * @returns {number} Scroll progress from 0 (at marker top) to 1 (at next marker top)
     *
     * @description
     * Special cases:
     * - activeIndex = null: Uses calculatePreMarkerProgress() for before-first-marker
     * - Last marker: Progress from last marker to bottom of page
     * - Clamps result to [0, 1] range
     *
     * @see {calculatePreMarkerProgress} - Handles scroll before first marker
     * @see {calculateBetweenMarkerProgress} - Handles scroll between markers
     */
    function calculateScrollProgress( activeIndex ) {
        if ( activeIndex === null ) {
            return calculatePreMarkerProgress();
        }

        return calculateBetweenMarkerProgress( activeIndex );
    }

    /**
     * Update progress indicator position based on scroll
     *
     * @param {number} activeIndex - Index of currently active marker
     * @param {number} scrollProgress - Progress ratio (0-1) between markers
     */
    function updateProgressPosition( activeIndex, scrollProgress ) {
        if ( ! showProgressIndicator || trackCoords.length === 0 ) {
            return;
        }

        // Calculate overall progress (0-1) along track
        let progress = 0;
        let currentZoom = DEFAULT_ZOOM;
        let nextZoom = DEFAULT_ZOOM;

        if ( markerTrackPositions.length === 0 ) {
            return;
        }

        if ( activeIndex === null ) {
            // Before first marker - progress from track start to first marker
            if ( markers.length > 0 && trackCoords.length > 0 ) {
                const firstMarkerPos = markerTrackPositions[ 1 ]; // First actual marker
                progress = firstMarkerPos * scrollProgress;

                // Interpolate zoom from initial to first marker zoom
                currentZoom = initialZoom;
                nextZoom = markers[ 0 ]?.zoom || DEFAULT_ZOOM;
            } else if ( trackCoords.length > 0 ) {
                // No markers case
                progress = scrollProgress;
                currentZoom = initialZoom;
                nextZoom = DEFAULT_ZOOM;
            } else {
                return; // No track data
            }
        } else if ( activeIndex !== null && markerTrackPositions.length > 0 ) {
            // Active marker index maps to markerTrackPositions[activeIndex + 1]
            const currentPosIndex = activeIndex + 1;
            const nextPosIndex = activeIndex + 2;

            const currentPos = markerTrackPositions[ currentPosIndex ];
            const nextPos = markerTrackPositions[ nextPosIndex ];

            // Get zoom levels from marker data (or defaults for virtual endpoints)
            if ( activeIndex < markers.length ) {
                currentZoom = markers[ activeIndex ]?.zoom || DEFAULT_ZOOM;
            }
            if ( activeIndex + 1 < markers.length ) {
                nextZoom = markers[ activeIndex + 1 ]?.zoom || DEFAULT_ZOOM;
            } else {
                // Transitioning to virtual end point - maintain last marker's zoom
                nextZoom = currentZoom;
            }

            // Interpolate between current and next position
            progress = currentPos + ( nextPos - currentPos ) * scrollProgress;
        }

        // Clamp progress
        progress = Math.max( 0, Math.min( 1, progress ) );

        // Set target state for animation loop
        targetProgress = progress;
        targetCurrentZoom = currentZoom;
        targetNextZoom = nextZoom;

        // Start continuous loop (no-op if already running)
        startAnimationLoop();
    }

    /**
     * Reset progress indicator to start
     */
    function resetProgressIndicator() {
        if ( ! showProgressIndicator || trackCoords.length === 0 ) {
            return;
        }

        if ( walkedPolyline ) {
            walkedPolyline.setLatLngs( [ trackCoords[ 0 ] ] );
        }
        if ( remainingPolyline ) {
            remainingPolyline.setLatLngs( trackCoords );
        }
        lastSmoothedProgress = null;

        // Stop any in-flight animation
        if ( animationRafId !== null ) {
            cancelAnimationFrame( animationRafId );
            animationRafId = null;
        }
        targetProgress = 0;

        // Update elevation chart
        updateElevationChart();
    }

    /**
     * Continuous animation loop — runs until smoothedProgress settles on targetProgress.
     *
     * Decoupled from scroll events so the camera keeps gliding after the user stops
     * scrolling, rather than freezing mid-lerp.
     */
    function animationLoop() {
        animationRafId = null;

        if ( lastSmoothedProgress === null ) {
            lastSmoothedProgress = targetProgress;
        }

        const smoothedProgress = lerp( lastSmoothedProgress, targetProgress, CAMERA_SMOOTHING );
        lastSmoothedProgress = smoothedProgress;

        // Update camera
        const coord = getCameraCoordinateAtProgress( smoothedProgress );
        const zoom = lerp( targetCurrentZoom, targetNextZoom, smoothedProgress );
        if ( coord && map && isFollowMode ) {
            map.setView( coord, zoom, { animate: false } );
        }

        // Update polyline split
        const walkedCoords = getTrackUpToProgress( smoothedProgress );
        if ( walkedPolyline && walkedCoords.length > 0 ) {
            walkedPolyline.setLatLngs( walkedCoords );
        }
        if ( remainingPolyline ) {
            remainingPolyline.setLatLngs( trackCoords );
        }

        // Update elevation chart
        updateElevationChart();

        // Re-schedule until settled (~0.01% of track remaining)
        if ( Math.abs( smoothedProgress - targetProgress ) > 0.0001 ) {
            animationRafId = requestAnimationFrame( animationLoop );
        }
    }

    /**
     * Start the animation loop if not already running.
     */
    function startAnimationLoop() {
        if ( animationRafId === null ) {
            animationRafId = requestAnimationFrame( animationLoop );
        }
    }

    /**
     * Collapse the map container to a tile by forcing inline !important styles.
     * setProperty(..., 'important') is required because the base layout CSS
     * uses !important on the same properties.
     *
     * @param {HTMLElement} el - The map container element
     */
    function applyDismissStyles( el ) {
        el.style.setProperty( 'width',      DISMISS_TILE, 'important' );
        el.style.setProperty( 'height',     DISMISS_TILE, 'important' );
        el.style.setProperty( 'min-width',  '0',          'important' );
        el.style.setProperty( 'min-height', '0',          'important' );
        // Both mobile and desktop: float the tile to the bottom-right corner
        // so it overlays the page rather than reserving layout space.
        el.style.setProperty( 'top',    'auto',  'important' );
        el.style.setProperty( 'bottom', '10px',  'important' );
        el.style.setProperty( 'left',   'auto',  'important' );
        el.style.setProperty( 'right',  '10px',  'important' );
    }

    /**
     * Remove all inline dimension overrides applied by applyDismissStyles().
     *
     * @param {HTMLElement} el - The map container element
     */
    function clearDismissStyles( el ) {
        [ 'width', 'height', 'min-width', 'min-height', 'bottom', 'left', 'top', 'right' ]
            .forEach( ( prop ) => el.style.removeProperty( prop ) );
    }

    /**
     * Toggle the map between its full size and a small restore tile.
     *
     * @param {HTMLElement} btn - The dismiss/restore anchor element
     */
    function toggleMapDismiss( btn ) {
        isMapDismissed = ! isMapDismissed;
        document.body.classList.toggle( 'mapthread-map-dismissed', isMapDismissed );

        const mapEl = map ? map.getContainer() : document.getElementById( 'mapthread-map' );

        if ( isMapDismissed ) {
            btn.innerHTML = ICON_MAP_PIN;
            btn.title = 'Show map';
            btn.setAttribute( 'aria-label', 'Show map' );
            isFollowMode = false;
            if ( animationRafId !== null ) {
                cancelAnimationFrame( animationRafId );
                animationRafId = null;
            }
            if ( mapEl ) { applyDismissStyles( mapEl ); }
        } else {
            btn.innerHTML = ICON_CLOSE;
            btn.title = 'Hide map';
            btn.setAttribute( 'aria-label', 'Hide map' );
            if ( mapEl ) { clearDismissStyles( mapEl ); }
            isFollowMode = true;
            if ( map ) { map.invalidateSize(); }
            startAnimationLoop();
        }
    }

    // =========================================================================
    // ELEVATION PROFILE
    // =========================================================================

    /**
     * Get elevation at a specific progress position along the track
     *
     * @param {number} progress - Fractional position (0 to 1)
     * @return {number|null} Elevation in meters or null
     */
    function getElevationAtProgress( progress ) {
        if ( trackElevations.length === 0 || trackCoords.length === 0 ) {
            return null;
        }

        const targetDistance = progress * totalTrackDistance;
        const segmentIndex = findSegmentAtDistance( targetDistance );

        if ( segmentIndex >= trackElevations.length - 1 ) {
            return trackElevations[ trackElevations.length - 1 ];
        }

        const segmentStart = trackDistances[ segmentIndex ];
        const segmentEnd = trackDistances[ segmentIndex + 1 ];
        const segmentLength = segmentEnd - segmentStart;

        if ( segmentLength === 0 ) {
            return trackElevations[ segmentIndex ];
        }

        const t = ( targetDistance - segmentStart ) / segmentLength;
        const eleStart = trackElevations[ segmentIndex ] ?? 0;
        const eleEnd = trackElevations[ segmentIndex + 1 ] ?? 0;
        return eleStart + t * ( eleEnd - eleStart );
    }

    /**
     * Calculate total elevation gain and loss from the full elevation array.
     *
     * @param {number[]} elevations - Elevation values in metres
     * @return {{ gain: number, loss: number }} Rounded values in metres
     */
    function calculateElevationGainLoss( elevations ) {
        // Filter out null/invalid values
        const valid = [];
        for ( let i = 0; i < elevations.length; i++ ) {
            if ( elevations[ i ] !== null && elevations[ i ] !== undefined && ! isNaN( elevations[ i ] ) ) {
                valid.push( elevations[ i ] );
            }
        }
        if ( valid.length < 2 ) {
            return { gain: 0, loss: 0 };
        }

        // 7-point median filter to remove GPS elevation spikes
        const MEDIAN_WINDOW = 7;
        const mHalf = Math.floor( MEDIAN_WINDOW / 2 );
        const despiked = new Array( valid.length );
        for ( let i = 0; i < valid.length; i++ ) {
            const neighborhood = [];
            for ( let j = Math.max( 0, i - mHalf ); j <= Math.min( valid.length - 1, i + mHalf ); j++ ) {
                neighborhood.push( valid[ j ] );
            }
            neighborhood.sort( ( a, b ) => a - b );
            despiked[ i ] = neighborhood[ Math.floor( neighborhood.length / 2 ) ];
        }

        // 11-point moving average to smooth remaining GPS noise
        const WINDOW = 11;
        const half = Math.floor( WINDOW / 2 );
        const smoothed = new Array( despiked.length );
        for ( let i = 0; i < despiked.length; i++ ) {
            let sum = 0, count = 0;
            for ( let j = Math.max( 0, i - half ); j <= Math.min( despiked.length - 1, i + half ); j++ ) {
                sum += despiked[ j ];
                count++;
            }
            smoothed[ i ] = sum / count;
        }

        // Dead-band threshold on smoothed data
        const THRESHOLD = 10;
        let gain = 0, loss = 0;
        let ref = smoothed[ 0 ];

        for ( let i = 1; i < smoothed.length; i++ ) {
            const diff = smoothed[ i ] - ref;
            if ( diff > THRESHOLD ) {
                gain += diff;
                ref = smoothed[ i ];
            } else if ( diff < -THRESHOLD ) {
                loss -= diff;
                ref = smoothed[ i ];
            }
        }
        return { gain: Math.round( gain ), loss: Math.round( loss ) };
    }

    /**
     * Downsample elevation data for chart rendering
     *
     * @param {Array} distancesKm - Distance array in km
     * @param {Array} elevations - Elevation array in meters
     * @param {number} maxPoints - Maximum data points
     * @return {Array} Array of {x, y} objects
     */
    function downsampleElevation( distancesKm, elevations, maxPoints = 500 ) {
        if ( distancesKm.length <= maxPoints ) {
            return distancesKm.map( ( d, i ) => ( { x: d, y: elevations[ i ] ?? 0 } ) );
        }

        const step = distancesKm.length / maxPoints;
        const result = [];
        for ( let i = 0; i < maxPoints; i++ ) {
            const idx = Math.min( Math.floor( i * step ), distancesKm.length - 1 );
            result.push( { x: distancesKm[ idx ], y: elevations[ idx ] ?? 0 } );
        }
        // Always include last point
        const last = distancesKm.length - 1;
        result.push( { x: distancesKm[ last ], y: elevations[ last ] ?? 0 } );
        return result;
    }

    /**
     * Chart.js plugin: draw marker lines and progress indicator on elevation chart
     */
    const elevationOverlayPlugin = {
        id: 'elevationOverlay',
        afterDraw( chart ) {
            const { ctx, chartArea, scales } = chart;
            if ( ! scales.x || ! scales.y ) {
                return;
            }

            // Draw marker position lines
            if ( markerTrackPositions.length > 0 ) {
                markerTrackPositions.forEach( ( pos, index ) => {
                    // Skip virtual start/end markers
                    if ( index === 0 || index === markerTrackPositions.length - 1 ) {
                        return;
                    }
                    const markerIndex = index - 1;
                    const distanceKm = ( pos * totalTrackDistance ) / 1000;
                    const x = scales.x.getPixelForValue( distanceKm );

                    if ( x < chartArea.left || x > chartArea.right ) {
                        return;
                    }

                    const isActive = markerIndex === activeMarkerIndex;
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash( [ 3, 3 ] );
                    ctx.strokeStyle = isActive
                        ? 'rgba(0, 0, 0, 0.5)'
                        : 'rgba(0, 0, 0, 0.15)';
                    ctx.lineWidth = isActive ? 1.5 : 1;
                    ctx.moveTo( x, chartArea.top );
                    ctx.lineTo( x, chartArea.bottom );
                    ctx.stroke();
                    ctx.restore();
                } );
            }

            // Draw walker progress line
            if ( showProgressIndicator && lastSmoothedProgress !== null ) {
                const progressKm = ( lastSmoothedProgress * totalTrackDistance ) / 1000;
                const px = scales.x.getPixelForValue( progressKm );

                if ( px >= chartArea.left && px <= chartArea.right ) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash( [] );
                    ctx.strokeStyle = PROGRESS_INDICATOR_COLOR;
                    ctx.lineWidth = 2;
                    ctx.moveTo( px, chartArea.top );
                    ctx.lineTo( px, chartArea.bottom );
                    ctx.stroke();

                    // Circle at elevation point
                    const ele = getElevationAtProgress( lastSmoothedProgress );
                    if ( ele !== null ) {
                        const y = scales.y.getPixelForValue( ele );
                        ctx.beginPath();
                        ctx.arc( px, y, 4, 0, Math.PI * 2 );
                        ctx.fillStyle = PROGRESS_INDICATOR_COLOR;
                        ctx.fill();
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }
        }
    };

    /**
     * Chart.js plugin: crosshair on hover
     */
    const elevationCrosshairPlugin = {
        id: 'elevationCrosshair',
        afterEvent( chart, args ) {
            const { event } = args;
            if ( event.type === 'mousemove' ) {
                chart._crosshairX = event.x;
            } else if ( event.type === 'mouseout' ) {
                chart._crosshairX = null;
            }
        },
        afterDraw( chart ) {
            if ( ! chart._crosshairX ) {
                return;
            }

            const { ctx, chartArea } = chart;
            const x = chart._crosshairX;

            if ( x < chartArea.left || x > chartArea.right ) {
                return;
            }

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash( [ 4, 4 ] );
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.lineWidth = 1;
            ctx.moveTo( x, chartArea.top );
            ctx.lineTo( x, chartArea.bottom );
            ctx.stroke();
            ctx.restore();
        }
    };

    /**
     * Chart.js plugin: draw elevation gain/loss stats on the chart canvas
     */
    const elevationStatsPlugin = {
        id: 'elevationStats',
        afterDraw( chart ) {
            const stats = chart._elevationStats;
            if ( ! stats || ( stats.gain === 0 && stats.loss === 0 ) ) {
                return;
            }

            const { ctx, chartArea } = chart;

            ctx.save();
            ctx.font = '600 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';

            const gainText = '\u25B2 ' + stats.gain.toLocaleString() + ' m';
            const lossText = '\u25BC ' + stats.loss.toLocaleString() + ' m';

            const x = chartArea.right - 4;
            const y = chartArea.top - 8;

            // Loss (muted red) on the right
            ctx.fillStyle = 'rgba(160, 60, 60, 0.7)';
            ctx.fillText( lossText, x, y );

            // Gain (muted green) to the left of loss
            const lossWidth = ctx.measureText( lossText ).width;
            ctx.fillStyle = 'rgba(60, 120, 60, 0.7)';
            ctx.fillText( gainText, x - lossWidth - 8, y );

            ctx.restore();
        }
    };

    /**
     * Get Chart.js configuration for elevation profile
     *
     * @param {Array} data - Array of {x, y} points
     * @return {Object} Chart.js config
     */
    function getElevationChartConfig( data ) {
        return {
            type: 'line',
            data: {
                datasets: [ {
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(79, 124, 172, 0.15)',
                    borderColor: 'rgba(79, 124, 172, 0.6)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    tension: 0.3,
                } ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: {
                    padding: { top: 10, bottom: 0, left: 0, right: 0 }
                },
                scales: {
                    x: {
                        type: 'linear',
                        display: true,
                        ticks: {
                            font: { size: 9 },
                            color: 'rgba(0, 0, 0, 0.4)',
                            maxTicksLimit: 6,
                            callback: ( value ) => `${ value.toFixed( 0 ) } km`
                        },
                        grid: { display: false },
                        border: { display: false },
                    },
                    y: {
                        display: true,
                        ticks: {
                            font: { size: 9 },
                            color: 'rgba(0, 0, 0, 0.4)',
                            maxTicksLimit: 4,
                            callback: ( value ) => `${ Math.round( value ) } m`
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                        },
                        border: { display: false },
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: ( items ) => {
                                if ( items.length > 0 ) {
                                    return `${ items[ 0 ].parsed.x.toFixed( 1 ) } km`;
                                }
                                return '';
                            },
                            label: ( item ) => {
                                return `${ Math.round( item.parsed.y ) } m`;
                            }
                        },
                        displayColors: false,
                        backgroundColor: 'rgba(30, 30, 30, 0.92)',
                        titleFont: { size: 11, weight: 'normal' },
                        bodyFont: { size: 13, weight: '600' },
                        padding: { top: 6, bottom: 6, left: 10, right: 10 },
                        cornerRadius: 6,
                    }
                }
            },
            plugins: [ elevationOverlayPlugin, elevationCrosshairPlugin, elevationStatsPlugin ]
        };
    }

    /**
     * Initialize the elevation profile chart
     */
    function initElevationProfile() {
        if ( trackElevations.length === 0 || ! map ) {
            return;
        }

        const mapContainer = document.getElementById( 'mapthread-map' );
        if ( ! mapContainer ) {
            return;
        }

        // Create chart container
        const chartWrapper = document.createElement( 'div' );
        chartWrapper.className = 'mapthread-elevation-profile';

        const canvas = document.createElement( 'canvas' );
        chartWrapper.appendChild( canvas );
        mapContainer.appendChild( chartWrapper );

        // Build chart data
        const distancesKm = trackDistances.map( ( d ) => d / 1000 );
        const data = downsampleElevation( distancesKm, trackElevations );

        // Create chart
        elevationChart = new Chart( canvas, getElevationChartConfig( data ) );

        // Calculate and attach elevation stats for the plugin
        elevationStats = calculateElevationGainLoss( trackElevations );
        elevationChart._elevationStats = elevationStats;

        // Resize chart when map resizes
        map.on( 'resize', () => {
            if ( elevationChart ) {
                elevationChart.resize();
            }
        } );
    }

    /**
     * Update the elevation profile chart (called after progress/marker changes)
     */
    function updateElevationChart() {
        if ( elevationChart ) {
            elevationChart.update( 'none' );
        }
    }

    /**
     * Parse GPX content and extract track coordinates and elevation
     *
     * @param {string} gpxContent - GPX XML content
     * @return {Object} Object with coords and elevations arrays
     */
    function parseGPXTrack( gpxContent ) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString( gpxContent, 'text/xml' );

            const parserError = xmlDoc.querySelector( 'parsererror' );
            if ( parserError ) {
                console.error( 'Mapthread: GPX parsing error', parserError );
                return { coords: [], elevations: [] };
            }

            const trkpts = xmlDoc.querySelectorAll( 'trkpt' );
            const coords = [];
            const elevations = [];
            let hasElevation = false;

            trkpts.forEach( ( trkpt ) => {
                const lat = parseFloat( trkpt.getAttribute( 'lat' ) );
                const lon = parseFloat( trkpt.getAttribute( 'lon' ) );
                if ( ! isNaN( lat ) && ! isNaN( lon ) ) {
                    coords.push( [ lat, lon ] );

                    const eleNode = trkpt.querySelector( 'ele' );
                    if ( eleNode ) {
                        const ele = parseFloat( eleNode.textContent );
                        elevations.push( isNaN( ele ) ? null : ele );
                        if ( ! isNaN( ele ) ) {
                            hasElevation = true;
                        }
                    } else {
                        elevations.push( null );
                    }
                }
            } );

            return { coords, elevations: hasElevation ? elevations : [] };
        } catch ( error ) {
            console.error( 'Mapthread: Failed to parse GPX', error );
            return { coords: [], elevations: [] };
        }
    }

    /**
     * Calculate map bounds from marker elements
     *
     * @return {Object} Bounds object {north, south, east, west}
     */
    function calculateBoundsFromMarkers() {
        const markerElements = getMarkerElements();
        let north = -90, south = 90, east = -180, west = 180;
        let hasValidMarkers = false;

        markerElements.forEach( ( element ) => {
            const lat = parseFloat( element.dataset.lat );
            const lng = parseFloat( element.dataset.lng );

            if ( ! isNaN( lat ) && ! isNaN( lng ) && ! ( lat === 0 && lng === 0 ) ) {
                hasValidMarkers = true;
                north = Math.max( north, lat );
                south = Math.min( south, lat );
                east = Math.max( east, lng );
                west = Math.min( west, lng );
            }
        } );

        if ( ! hasValidMarkers ) {
            return { north: 0, south: 0, east: 0, west: 0 };
        }

        return { north, south, east, west };
    }

    /**
     * Fetch GPX file from URL with caching
     *
     * @param {number} attachmentId - WordPress attachment ID
     * @param {string} gpxUrl - URL to GPX file
     * @return {Promise<Array>} Array of coordinates
     */
    async function fetchGPX( attachmentId, gpxUrl ) {
        const cacheKey = `mapthread-gpx-${attachmentId}`;

        // Check sessionStorage cache
        const cached = sessionStorage.getItem( cacheKey );
        if ( cached ) {
            try {
                const parsed = JSON.parse( cached );
                // Backward compat: old cache is plain array of coords
                if ( Array.isArray( parsed ) ) {
                    return { coords: parsed, elevations: [] };
                }
                return parsed;
            } catch ( e ) {
                // Cache corrupted, continue to fetch
            }
        }

        // Fetch GPX file
        try {
            const response = await fetch( gpxUrl );
            if ( ! response.ok ) {
                throw new Error( `HTTP ${response.status}` );
            }

            const gpxContent = await response.text();
            const gpxData = parseGPXTrack( gpxContent );

            // Cache the parsed data
            if ( gpxData.coords.length > 0 ) {
                sessionStorage.setItem( cacheKey, JSON.stringify( gpxData ) );
            }

            return gpxData;
        } catch ( error ) {
            console.error( 'Mapthread: Failed to fetch GPX', error );
            return { coords: [], elevations: [] };
        }
    }

    /**
     * Fetch elevation data from WordPress REST API
     *
     * @param {number} attachmentId - WordPress attachment ID
     * @param {Array} coords - Array of [lat, lng] coordinates
     * @return {Promise<Array>} Array of elevations in meters
     */
    async function fetchElevationFromAPI( attachmentId, coords ) {
        try {
            const response = await fetch( '/wp-json/mapthread/v1/elevation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    attachment_id: attachmentId,
                    coordinates: coords
                } )
            } );

            if ( ! response.ok ) {
                throw new Error( `HTTP ${response.status}` );
            }

            const data = await response.json();

            if ( ! data.success ) {
                throw new Error( data.error || 'Unknown API error' );
            }

            return data.elevations;
        } catch ( error ) {
            console.error( 'Mapthread: Elevation API failed', error );
            return [];
        }
    }

    /**
     * Create marker icon
     *
     * @param {number} number - Marker number (kept for API compatibility)
     * @param {boolean} isActive - Whether this marker is currently active
     * @return {L.DivIcon} Leaflet div icon
     */
    function createNumberedIcon( number, isActive = false ) {
        const activeClass = isActive ? ' mapthread-active' : '';
        return L.divIcon( {
            className: 'mapthread-marker-icon',
            html: `<div class="mapthread-marker-pin${activeClass}"></div>`,
            iconSize: [ ICON_SIZE, ICON_SIZE ],   // Total icon dimensions
            iconAnchor: [ ICON_ANCHOR, ICON_ANCHOR ],   // Point that sits on the lat/lng coordinate
            popupAnchor: [ 0, POPUP_ANCHOR_Y ]  // Where popups open relative to anchor
        } );
    }

    /**
     * Create emoji marker icon
     *
     * @param {string} emoji - Emoji character to display
     * @param {boolean} isActive - Whether this marker is currently active
     * @return {L.DivIcon} Leaflet div icon
     */
    function createEmojiIcon( emoji, isActive = false ) {
        const activeClass = isActive ? ' mapthread-active' : '';
        return L.divIcon( {
            className: 'mapthread-marker-icon',
            html: `<span class="mapthread-marker-emoji${activeClass}">${emoji}</span>`,
            iconSize: [ EMOJI_ICON_SIZE, EMOJI_ICON_SIZE ],
            iconAnchor: [ EMOJI_ICON_ANCHOR, EMOJI_ICON_ANCHOR ],
            popupAnchor: [ 0, EMOJI_POPUP_ANCHOR_Y ]
        } );
    }

    /**
     * Update marker icons to show active state
     *
     * @param {number} activeIndex - Index of active marker
     */
    function updateMarkerIcons( activeIndex ) {
        markerLayers.forEach( ( marker, index ) => {
            const isActive = index === activeIndex;
            const markerData = markers[ index ];
            const icon = markerData && markerData.emoji
                ? createEmojiIcon( markerData.emoji, isActive )
                : createNumberedIcon( index + 1, isActive );
            marker.setIcon( icon );

            // Automatically show/hide tooltip based on active state
            if ( marker.getTooltip() ) {
                if ( index === activeIndex ) {
                    marker.openTooltip();
                } else {
                    marker.closeTooltip();
                }
            }
        } );
    }

    /**
     * Calculate which marker is currently active based on scroll position
     *
     * @return {number|null} Index of active marker or null (null = at top of page)
     */
    function calculateActiveMarker() {
        const markerElements = getMarkerElements();
        if ( markerElements.length === 0 ) {
            return null;
        }

        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * ACTIVATION_THRESHOLD; // 25% from top

        // Find first marker whose top edge is at or above the 25% threshold
        for ( let i = 0; i < markerElements.length; i++ ) {
            const rect = markerElements[ i ].getBoundingClientRect();
            if ( rect.top >= 0 && rect.top <= threshold ) {
                return i;
            }
        }

        // If no marker in threshold, find the closest one above (already scrolled past)
        for ( let i = markerElements.length - 1; i >= 0; i-- ) {
            const rect = markerElements[ i ].getBoundingClientRect();
            if ( rect.top < 0 ) {
                return i;
            }
        }

        // No markers in threshold or scrolled past - user is at top of page
        return null;
    }

    /**
     * Get marker elements (cached for performance)
     *
     * @return {NodeList} Marker DOM elements
     */
    function getMarkerElements() {
        if ( ! cachedMarkerElements ) {
            cachedMarkerElements = document.querySelectorAll( '.mapthread-marker' );
        }
        return cachedMarkerElements;
    }

    /**
     * Invalidate marker cache (call when markers change)
     */
    function invalidateMarkerCache() {
        cachedMarkerElements = null;
    }

    /**
     * Update map view to show active marker
     *
     * @param {number} markerIndex - Index of marker to show
     */
    function updateMapView( markerIndex ) {
        if ( ! map || markerIndex === null || markerIndex === activeMarkerIndex ) {
            return;
        }

        const markerData = markers[ markerIndex ];
        if ( ! markerData ) {
            return;
        }

        activeMarkerIndex = markerIndex;

        // Update marker icons to show active state
        updateMarkerIcons( markerIndex );

        // Update elevation chart to reflect active marker
        updateElevationChart();

        // Pan and zoom to marker
        map.flyTo(
            [ markerData.lat, markerData.lng ],
            markerData.zoom,
            {
                duration: RESET_ANIMATION_DURATION, // 800ms
                easeLinearity: 0.25
            }
        );
    }

    /**
     * Reset map to initial view showing full GPX track
     */
    function resetToInitialView() {
        if ( ! map || ! initialBounds || activeMarkerIndex === null ) {
            return;
        }

        activeMarkerIndex = null;
        updateMarkerIcons( -1 ); // No active marker

        // Smoothly animate back to full track overview
        map.flyToBounds( initialBounds, {
            padding: BOUNDS_PADDING,
            duration: RESET_ANIMATION_DURATION
        } );

        // Reset progress smoothing
        lastSmoothedProgress = null;

        // Update elevation chart
        updateElevationChart();
    }

    /**
     * Check if user has scrolled past all markers (at bottom of content)
     *
     * @return {boolean} True if last marker is above viewport threshold
     */
    function isAtBottomOfPage() {
        const markerElements = getMarkerElements();
        if ( markerElements.length === 0 ) {
            return false;
        }

        const lastMarker = markerElements[ markerElements.length - 1 ];
        const rect = lastMarker.getBoundingClientRect();

        // Consider "at bottom" when last marker has scrolled above viewport
        return rect.top < 0;
    }

    /**
     * Handle scroll events (throttled via requestAnimationFrame)
     */
    function handleScroll() {
        if ( ! isFollowMode ) {
            return;
        }

        // If RAF already scheduled, skip
        if ( scrollRafId !== null ) {
            return;
        }

        // Schedule update on next animation frame
        scrollRafId = requestAnimationFrame( () => {
            scrollRafId = null;
            updateMapPosition();
        } );
    }

    /**
     * Handle scroll when at bottom of page
     */
    function handleBottomScroll() {
        // With progress indicator, stay at last marker (no reset)
        if ( ! showProgressIndicator && activeMarkerIndex !== null ) {
            resetToInitialView();
            resetProgressIndicator();
        }
    }

    /**
     * Handle scroll before first marker is active
     */
    function handlePreMarkerScroll() {
        // Check if scrolled to top of page (or very close)
        if ( window.scrollY < SCROLL_TOP_THRESHOLD ) {
            if ( showProgressIndicator && trackCoords.length > 0 ) {
                // Progress indicator ON: Reset walked path
                resetProgressIndicator();
            } else if ( ! showProgressIndicator && activeMarkerIndex !== null ) {
                // Progress indicator OFF: Smooth animate back to overview
                resetToInitialView();
            }
            return;
        }

        // Progress indicator ON: Update position along track
        if ( showProgressIndicator && trackCoords.length > 0 ) {
            const scrollProgress = calculateScrollProgress( null );
            updateProgressPosition( null, scrollProgress );
        }
    }

    /**
     * Handle scroll when following an active marker
     *
     * @param {number} activeMarker - Currently active marker index
     */
    function handleMarkerFollowScroll( activeMarker ) {
        if ( showProgressIndicator && trackCoords.length > 0 ) {
            const scrollProgress = calculateScrollProgress( activeMarker );
            updateProgressPosition( activeMarker, scrollProgress );

            if ( activeMarker !== activeMarkerIndex ) {
                activeMarkerIndex = activeMarker;
                updateMarkerIcons( activeMarker );
            }
        } else {
            // No progress indicator - use standard marker-based panning
            if ( activeMarker !== activeMarkerIndex ) {
                updateMapView( activeMarker );
            }
        }
    }

    /**
     * Updates map view based on current scroll position using state machine pattern.
     *
     * Dispatches to appropriate handler based on scroll state:
     * - AT_BOTTOM: User scrolled past all markers (handles bottom reset)
     * - PRE_FIRST_MARKER: User before first marker (handles pre-marker tracking)
     * - FOLLOWING_MARKER: User at a specific marker (handles marker following)
     *
     * Called via requestAnimationFrame from handleScroll for smooth 60fps updates.
     *
     * @description
     * Flow:
     * 1. Calculate active marker from scroll position
     * 2. Determine if at bottom of page
     * 3. Get scroll state from state machine
     * 4. Dispatch to appropriate handler
     *
     * @see {ScrollState} - Enum of possible scroll states
     * @see {handleBottomScroll} - Handler for bottom of page
     * @see {handlePreMarkerScroll} - Handler for before first marker
     * @see {handleMarkerFollowScroll} - Handler for marker following
     */
    function updateMapPosition() {
        const newActiveMarker = calculateActiveMarker();
        const atBottom = isAtBottomOfPage();
        const state = getScrollState( newActiveMarker, atBottom );

        switch ( state ) {
            case ScrollState.AT_BOTTOM:
                handleBottomScroll();
                break;

            case ScrollState.PRE_FIRST_MARKER:
                handlePreMarkerScroll();
                break;

            case ScrollState.FOLLOWING_MARKER:
                handleMarkerFollowScroll( newActiveMarker );
                break;
        }
    }

    /**
     * Handles user interaction with the map by pausing auto-follow mode.
     *
     * When user manually pans or zooms the map, disables follow mode to prevent
     * fighting with user input. Follow mode is automatically re-enabled when
     * user scrolls to a different marker.
     *
     * @description
     * Flow:
     * 1. User pans/zooms map → triggers this handler
     * 2. Resets progress smoothing (lastSmoothedProgress = null)
     * 3. Sets isFollowMode = false (disables auto-follow)
     * 4. Remembers current active marker index
     * 5. Adds scroll listener that waits for marker change
     * 6. When marker changes, re-enables follow mode and removes listener
     *
     * This allows users to explore the map freely while maintaining the ability
     * to resume following by simply scrolling to the next marker.
     */
    function handleMapInteraction() {
        // Reset progress smoothing when user manually pans/zooms
        lastSmoothedProgress = null;

        // Stop any in-flight animation so it doesn't fight user input
        if ( animationRafId !== null ) {
            cancelAnimationFrame( animationRafId );
            animationRafId = null;
        }

        // Remove any existing scroll listener to prevent memory leaks
        if ( mapInteractionScrollListener ) {
            window.removeEventListener( 'scroll', mapInteractionScrollListener );
            mapInteractionScrollListener = null;
        }

        const previousActive = activeMarkerIndex;
        isFollowMode = false;

        // Re-enable follow mode on next scroll that changes active marker
        mapInteractionScrollListener = () => {
            const newActive = calculateActiveMarker();
            if ( newActive !== previousActive ) {
                isFollowMode = true;
                window.removeEventListener( 'scroll', mapInteractionScrollListener );
                mapInteractionScrollListener = null;
            }
        };

        window.addEventListener( 'scroll', mapInteractionScrollListener );
    }

    /**
     * Scroll to marker element in content
     *
     * @param {number} markerIndex - Index of marker to scroll to
     */
    function scrollToMarker( markerIndex ) {
        const markerElements = getMarkerElements();
        if ( markerElements[ markerIndex ] ) {
            markerElements[ markerIndex ].scrollIntoView( {
                behavior: 'smooth',
                block: 'start'
            } );
        }
    }

    /**
     * Create a standard leaflet-bar anchor button inside a container.
     *
     * @param {HTMLElement} container  Parent element
     * @param {string}      className  CSS class for the <a>
     * @param {string}      icon       innerHTML (SVG string)
     * @param {string}      label      title + aria-label text
     * @returns {HTMLAnchorElement}
     */
    function createControlBtn( container, className, icon, label ) {
        const btn = L.DomUtil.create( 'a', className, container );
        btn.href  = '#';
        btn.title = label;
        btn.setAttribute( 'role', 'button' );
        btn.setAttribute( 'aria-label', label );
        btn.innerHTML = icon;
        return btn;
    }

    /**
     * Leaflet control that dismisses/restores the map panel.
     * Defined at module level so initializeMap() can stay free of class boilerplate.
     */
    const DismissControl = L.Control.extend( {
        options: { position: 'topleft' },
        onAdd() {
            const container = L.DomUtil.create(
                'div', 'leaflet-bar leaflet-control mapthread-dismiss-control'
            );
            const btn = createControlBtn( container, 'mapthread-dismiss-btn', ICON_CLOSE, 'Hide map' );

            L.DomEvent.on( btn, 'click', ( e ) => {
                L.DomEvent.preventDefault( e );
                toggleMapDismiss( btn );
            } );
            L.DomEvent.disableClickPropagation( container );
            L.DomEvent.disableScrollPropagation( container );
            return container;
        }
    } );

    /**
     * Custom layer-switcher control — uses leaflet-bar so it inherits
     * exactly the same CSS treatment as zoom, fullscreen, and dismiss.
     */
    const LayersControl = L.Control.extend( {
        options: { position: 'topleft' },

        initialize( layers, options ) {
            L.Util.setOptions( this, options );
            this._layers    = layers;
            this._current   = null;
            this._panelOpen = false;
            this._btn       = null;
            this._panel     = null;
        },

        onAdd( map ) {
            this._map = map;

            const container = L.DomUtil.create(
                'div', 'leaflet-bar leaflet-control mapthread-layer-control'
            );

            const btn = this._btn = createControlBtn( container, 'mapthread-layer-btn', ICON_LAYERS, 'Map layers' );
            btn.setAttribute( 'aria-expanded', 'false' );

            const panel = this._panel = L.DomUtil.create(
                'div', 'mapthread-layer-panel', container
            );
            panel.hidden = true;

            Object.keys( this._layers ).forEach( ( name ) => {
                const label = L.DomUtil.create( 'label', 'mapthread-layer-option', panel );
                const input = L.DomUtil.create( 'input', '', label );
                input.type  = 'radio';
                input.name  = 'mapthread-layer';
                input.value = name;
                label.append( ` ${ name }` );

                if ( this._current === this._layers[ name ] ) {
                    input.checked = true;
                }

                L.DomEvent.on( input, 'change', () => {
                    this._switchLayer( name );
                    this._closePanel();
                } );
            } );

            L.DomEvent.on( btn, 'click', ( e ) => {
                L.DomEvent.preventDefault( e );
                this._panelOpen ? this._closePanel() : this._openPanel();
            } );

            L.DomEvent.on( document, 'click', this._onDocClick, this );
            L.DomEvent.disableClickPropagation( container );
            L.DomEvent.disableScrollPropagation( container );
            return container;
        },

        onRemove() {
            L.DomEvent.off( document, 'click', this._onDocClick, this );
        },

        setActiveLayer( layer ) {
            this._current = layer;
            if ( this._panel ) {
                this._panel.querySelectorAll( 'input' ).forEach( ( input ) => {
                    input.checked = ( this._layers[ input.value ] === layer );
                } );
            }
        },

        _switchLayer( name ) {
            const next = this._layers[ name ];
            if ( next === this._current ) return;
            if ( this._current ) this._map.removeLayer( this._current );
            next.addTo( this._map );
            this._current = next;
        },

        _openPanel() {
            this._panelOpen = true;
            this._panel.hidden = false;
            this._btn.setAttribute( 'aria-expanded', 'true' );
        },

        _closePanel() {
            this._panelOpen = false;
            this._panel.hidden = true;
            this._btn.setAttribute( 'aria-expanded', 'false' );
        },

        _onDocClick( e ) {
            if ( this._panelOpen && !this.getContainer().contains( e.target ) ) {
                this._closePanel();
            }
        }
    } );

    /**
     * Initialize the map
     *
     * @param {Object} bounds - GPX bounds object
     * @return {L.Map} Leaflet map instance
     */
    function initializeMap( bounds ) {
        // Create map container
        const mapContainer = document.createElement( 'div' );
        mapContainer.id = 'mapthread-map';
        mapContainer.className = 'mapthread-map';

        // Insert map into page (positioned by CSS)
        const gpxBlock = document.querySelector( '.mapthread-map-gpx' );
        if ( gpxBlock && gpxBlock.parentNode ) {
            gpxBlock.parentNode.insertBefore( mapContainer, gpxBlock.nextSibling );
        } else {
            document.body.appendChild( mapContainer );
        }

        // Initialize Leaflet map
        // Use Canvas renderer for polylines — the SVG renderer accumulates a
        // positional drift when another plugin loads a conflicting Leaflet version,
        // because the other Leaflet's JS corrupts the SVG pane transform on each zoom.
        // Canvas redraws from scratch every frame so it is immune to this issue.
        // Note: Canvas is also the default renderer in Leaflet 2.0, so this is
        // forward-compatible with a future Leaflet upgrade.
        const leafletMap = L.map( 'mapthread-map', {
            zoomControl: true,
            scrollWheelZoom: false,  // Replaced by Ctrl/Cmd+scroll handler below
            attributionControl: false,  // Disable default bottom-right attribution
            renderer: L.canvas()
        } );

        // Add custom attribution control in top-right position
        L.control.attribution( {
            position: 'topright'
        } ).addTo( leafletMap );

        // Scale bar (metric only) — top-left, CSS-offset to sit right of the button column
        L.control.scale( { position: 'topleft', imperial: false } ).addTo( leafletMap );

        // Ctrl/Cmd+scroll hint overlay — shown briefly when user scrolls without modifier
        const isMac = navigator.userAgentData
            ? navigator.userAgentData.platform === 'macOS'
            : /Mac/.test( navigator.userAgent );
        const scrollHint = document.createElement( 'div' );
        scrollHint.className = 'mapthread-scroll-hint';
        scrollHint.textContent = isMac
            ? 'Use ⌘ or Ctrl + scroll to zoom'
            : 'Use Ctrl + scroll to zoom';
        mapContainer.appendChild( scrollHint );

        // Replace Leaflet's scroll wheel zoom with a modifier-key-gated handler.
        // Without a modifier, wheel events pass through to page scroll and show hint.
        mapContainer.addEventListener( 'wheel', ( e ) => {
            if ( e.ctrlKey || e.metaKey ) {
                // Modifier held — zoom the map and pause auto-follow
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY < 0 ? 1 : -1;
                const newZoom = Math.max(
                    leafletMap.getMinZoom(),
                    Math.min( leafletMap.getMaxZoom(), leafletMap.getZoom() + delta )
                );
                leafletMap.setZoom( newZoom );
                handleMapInteraction();
            } else {
                // No modifier — let page scroll normally, show hint briefly.
                // Only start the timer on the first event; don't reset it on
                // subsequent events so the hint auto-hides after 1.5s regardless
                // of how long the user keeps scrolling.
                if ( ! scrollHintShown ) {
                    scrollHintShown = true;
                    scrollHint.classList.add( 'mapthread-scroll-hint--visible' );
                    setTimeout( () => {
                        scrollHint.classList.remove( 'mapthread-scroll-hint--visible' );
                    }, 1500 );
                }
            }
        }, { passive: false } );

        // Define base layer options
        const osmLayer = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        } );

        const satelliteLayer = L.tileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 19
        } );

        const topoLayer = L.tileLayer( 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
            maxZoom: 17
        } );

        // Define layer mapping
        const baseLayers = {
            'Street': osmLayer,
            'Satellite': satelliteLayer,
            'Topographic': topoLayer
        };

        // Add default layer based on user setting
        const selectedLayer = baseLayers[ defaultMapLayer ] || osmLayer;
        selectedLayer.addTo( leafletMap );

        // Add fullscreen control
        // Force pseudoFullscreen on mobile for better compatibility
        const isMobile = window.innerWidth <= 767;
        leafletMap.addControl( new FullScreen( {
            position: 'topleft',
            pseudoFullscreen: isMobile
        } ) );

        // Add dismiss control
        leafletMap.addControl( new DismissControl() );

        // Add layer control — topleft, below dismiss
        const layersCtrl = new LayersControl( baseLayers, { position: 'topleft' } );
        layersCtrl.setActiveLayer( selectedLayer );
        leafletMap.addControl( layersCtrl );

        // Initialize map view based on progress indicator setting
        if ( bounds && bounds.north !== 0 ) {
            const leafletBounds = [
                [ bounds.south, bounds.west ],
                [ bounds.north, bounds.east ]
            ];
            initialBounds = leafletBounds;

            // Set initial view to full track overview
            // (Will be updated to track start after GPX loads if progress indicator enabled)
            leafletMap.fitBounds( leafletBounds, { padding: BOUNDS_PADDING } );
            initialZoom = leafletMap.getZoom();
        }

        // Listen for map interactions (pan/zoom by user)
        let isUserInteraction = false;

        leafletMap.on( 'mousedown', () => {
            isUserInteraction = true;
        } );

        leafletMap.on( 'movestart', () => {
            if ( isUserInteraction ) {
                handleMapInteraction();
            }
        } );

        leafletMap.on( 'moveend', () => {
            isUserInteraction = false;
        } );

        // Handle scroll wheel zoom
        leafletMap.on( 'zoomstart', ( e ) => {
            if ( e.originalEvent ) {
                handleMapInteraction();
            }
        } );

        return leafletMap;
    }

    /**
     * Add GPX track to map
     *
     * @param {Array} coords - Array of [lat, lng] coordinates
     */
    function addGPXTrack( coords ) {
        if ( ! map || coords.length === 0 ) {
            return;
        }

        // Remove existing track
        if ( gpxLayer ) {
            map.removeLayer( gpxLayer );
        }
        if ( gpxLayerWalked ) {
            map.removeLayer( gpxLayerWalked );
        }

        // Add background polyline (Vermilion)
        gpxLayer = L.polyline( coords, {
            color: TRACK_REMAINING_COLOR,
            weight: TRACK_REMAINING_WIDTH,
            opacity: TRACK_REMAINING_OPACITY
        } ).addTo( map );

        // Add dotted white overlay for legibility
        gpxLayerWalked = L.polyline( coords, {
            color: TRACK_WALKED_COLOR,
            weight: TRACK_WALKED_WIDTH,
            opacity: TRACK_WALKED_OPACITY,
            dashArray: TRACK_WALKED_DASH
        } ).addTo( map );
    }

    /**
     * Add marker pins to map
     */
    function addMarkerPins() {
        if ( ! map ) {
            return;
        }

        const markerElements = getMarkerElements();

        markerElements.forEach( ( element, index ) => {
            try {
                const lat = parseFloat( element.dataset.lat );
                const lng = parseFloat( element.dataset.lng );
                const title = element.dataset.title || '';
                const zoom = parseInt( element.dataset.zoom ) || DEFAULT_ZOOM;
                const emoji = element.dataset.emoji || '';

                if ( isNaN( lat ) || isNaN( lng ) || ( lat === 0 && lng === 0 ) ) {
                    return;
                }

                // Store marker data
                markers.push( { lat, lng, title, zoom, emoji, element } );

                // Create marker icon (emoji or default circle)
                const icon = emoji
                    ? createEmojiIcon( emoji, false )
                    : createNumberedIcon( markers.length, false );
                const marker = L.marker( [ lat, lng ], { icon } );

                // Add tooltip
                if ( title ) {
                    marker.bindTooltip( title, {
                        permanent: false,
                        direction: 'top',   // Tooltip appears above marker
                        offset: [ 2, -12 ]  // [x, y] offset from marker anchor
                    } );
                }

                // Click to scroll to marker in content
                marker.on( 'click', () => {
                    const markerIdx = markers.findIndex( m => m.lat === lat && m.lng === lng );
                    if ( markerIdx !== -1 ) {
                        scrollToMarker( markerIdx );
                    }
                } );

                marker.addTo( map );
                markerLayers.push( marker );
            } catch ( error ) {
                console.error( `Failed to create marker pin ${index}:`, error );
                // Continue with other markers even if one fails
            }
        } );
    }

    /**
     * Initialize Mapthread map
     */
    async function initMapthread() {
        // Check if we have Mapthread blocks on this page
        const gpxBlock = document.querySelector( '.mapthread-map-gpx' );
        const markerElements = getMarkerElements();

        // Exit if no Mapthread content at all
        if ( ! gpxBlock && markerElements.length === 0 ) {
            return;
        }

        // Determine bounds - from GPX block (if valid) or markers
        let bounds = { north: 0, south: 0, east: 0, west: 0 };
        let hasValidGpxBounds = false;

        if ( gpxBlock ) {
            const boundsData = gpxBlock.dataset.bounds;
            if ( boundsData ) {
                try {
                    bounds = JSON.parse( boundsData );
                    // Check if bounds are valid (not all zeros)
                    hasValidGpxBounds = bounds.north !== 0 || bounds.south !== 0 ||
                                        bounds.east !== 0 || bounds.west !== 0;
                } catch ( e ) {
                    console.warn( 'Mapthread: Failed to parse bounds', e );
                }
            }
        }

        // Fall back to marker bounds if no valid GPX bounds
        if ( ! hasValidGpxBounds && markerElements.length > 0 ) {
            bounds = calculateBoundsFromMarkers();
        }

        // Read settings from block attributes BEFORE initializing map
        if ( gpxBlock ) {
            showProgressIndicator = gpxBlock.dataset.showProgress !== 'false';
            showElevationProfile = gpxBlock.dataset.showElevation !== 'false';
            defaultMapLayer = gpxBlock.dataset.defaultLayer || 'Street';
        }

        // Initialize map (uses settings read above)
        map = initializeMap( bounds );

        // Only fetch GPX if block exists with valid URL
        if ( gpxBlock ) {
            const attachmentId = parseInt( gpxBlock.dataset.attachmentId );
            const gpxUrl = gpxBlock.dataset.gpxUrl;
            if ( gpxUrl ) {
                const gpxData = await fetchGPX( attachmentId, gpxUrl );
                const coords = gpxData.coords;
                if ( coords.length > 0 ) {
                    // Store track coordinates and elevation for progress indicator
                    trackCoords = coords;
                    trackElevations = gpxData.elevations || [];

                    // If no elevation data, fetch from API
                    if ( trackElevations.length === 0 && trackCoords.length > 0 ) {
                        try {
                            const fetchedElevations = await fetchElevationFromAPI( attachmentId, trackCoords );
                            trackElevations = fetchedElevations;

                            // Update cache to include fetched elevations
                            const cacheKey = `mapthread-gpx-${attachmentId}`;
                            sessionStorage.setItem( cacheKey, JSON.stringify( {
                                coords: trackCoords,
                                elevations: trackElevations
                            } ) );
                        } catch ( error ) {
                            console.warn( 'Mapthread: Failed to fetch elevation data', error );
                            // Continue without elevation - chart simply won't display
                        }
                    }

                    // Calculate distances along track
                    const distanceData = calculateTrackDistances( coords );
                    trackDistances = distanceData.distances;
                    totalTrackDistance = distanceData.totalDistance;

                    // Build smoothed camera path (Chaikin, 4 iterations — not drawn, camera-only)
                    cameraCoords = chaikinSmooth( trackCoords, 4 );
                    const camDist = calculateTrackDistances( cameraCoords );
                    cameraTrackDistances = camDist.distances;
                    cameraTotalDistance = camDist.totalDistance;

                    // Add GPX track (will be replaced by progress indicator if enabled)
                    addGPXTrack( coords );
                }
            }
        }

        // Add marker pins
        addMarkerPins();

        // If GPX block exists but has no GPX track, create path from markers
        if ( gpxBlock && trackCoords.length === 0 && markers.length >= 2 ) {
            trackCoords = markers.map( m => [ m.lat, m.lng ] );

            // Calculate distances along marker path
            const distanceData = calculateTrackDistances( trackCoords );
            trackDistances = distanceData.distances;
            totalTrackDistance = distanceData.totalDistance;

            // Build smoothed camera path (Chaikin, 4 iterations — not drawn, camera-only)
            cameraCoords = chaikinSmooth( trackCoords, 4 );
            const camDist = calculateTrackDistances( cameraCoords );
            cameraTrackDistances = camDist.distances;
            cameraTotalDistance = camDist.totalDistance;

            // If progress indicator is OFF, show a static connecting line
            if ( ! showProgressIndicator ) {
                L.polyline( trackCoords, {
                    color: TRACK_REMAINING_COLOR,
                    weight: TRACK_REMAINING_WIDTH,
                    opacity: TRACK_REMAINING_OPACITY,
                } ).addTo( map );

                L.polyline( trackCoords, {
                    color: TRACK_WALKED_COLOR,
                    weight: TRACK_WALKED_WIDTH,
                    opacity: TRACK_WALKED_OPACITY,
                    dashArray: TRACK_WALKED_DASH,
                } ).addTo( map );
            }
        }

        // Always calculate marker positions for elevation chart
        if ( trackCoords.length > 0 ) {
            calculateMarkerTrackPositions();
        }

        // Initialize progress indicator (after markers are added)
        if ( showProgressIndicator && trackCoords.length > 0 ) {
            initProgressIndicator();

            // Set initial view to track start (now that we have the data)
            const startCoord = trackCoords[ 0 ];
            const startZoom = markers.length > 0 && markers[ 0 ]
                ? ( markers[ 0 ].zoom || DEFAULT_ZOOM )
                : DEFAULT_ZOOM;

            map.setView( startCoord, startZoom );
            initialZoom = startZoom;
        }

        // Initialize elevation profile (if enabled and elevation data available)
        if ( showElevationProfile && trackElevations.length > 0 ) {
            initElevationProfile();
        }

        // Set up scroll handling
        window.addEventListener( 'scroll', handleScroll, { passive: true } );

        // Cancel any pending RAF on page unload
        window.addEventListener( 'beforeunload', () => {
            if ( scrollRafId !== null ) {
                cancelAnimationFrame( scrollRafId );
            }
        } );

        // Initial marker activation (after a brief delay to let page settle)
        setTimeout( () => {
            const initialMarker = calculateActiveMarker();
            if ( initialMarker !== null && markers.length > 0 ) {
                activeMarkerIndex = initialMarker;
                updateMarkerIcons( initialMarker );
            }
        }, MAP_INTERACTION_TIMEOUT );
    }

    // Initialize when DOM is ready
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', initMapthread );
    } else {
        initMapthread();
    }

} )();
