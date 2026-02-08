/**
 * Pathway Frontend JavaScript
 *
 * Handles map initialization, GPX rendering, and scroll-based map following
 *
 * @package Pathway
 */

( function() {
    'use strict';

    // State
    let map = null;
    let gpxLayer = null;
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
    let markerTrackPositions = [];      // Each marker's position ratio (0-1) along track
    let walkedPolyline = null;          // Polyline for walked portion
    let remainingPolyline = null;       // Polyline for remaining portion
    let showProgressIndicator = true;   // Setting from block
    let lastSmoothedProgress = null;    // For smooth interpolation
    let mapInteractionScrollListener = null; // Listener for re-enabling follow mode

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
    const ICON_ANCHOR = 7;               // Horizontal and vertical anchor point (center)
    const POPUP_ANCHOR_Y = -7;           // Popup offset above marker

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

        // Find the segment containing this distance
        let segmentIndex = 0;
        for ( let i = 1; i < trackDistances.length; i++ ) {
            if ( trackDistances[ i ] >= targetDistance ) {
                segmentIndex = i - 1;
                break;
            }
            segmentIndex = i - 1;
        }

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
    function getTrackFromProgress( progress ) {
        if ( trackCoords.length === 0 ) {
            return [];
        }

        const targetDistance = progress * totalTrackDistance;

        // Start with interpolated point
        const points = [];
        const startPoint = getCoordinateAtProgress( progress );
        if ( startPoint ) {
            points.push( startPoint );
        }

        // Add all points after this distance
        for ( let i = 0; i < trackDistances.length; i++ ) {
            if ( trackDistances[ i ] > targetDistance ) {
                points.push( trackCoords[ i ] );
            }
        }

        return points;
    }

    /**
     * Initialize progress indicator visualization
     */
    function initProgressIndicator() {
        if ( ! showProgressIndicator || trackCoords.length === 0 || ! map ) {
            return;
        }

        // Track colors
        const walkedColor = '#E4572E';     // Vermilion
        const remainingColor = '#4F7CAC';  // Muted cool blue

        // Create walked polyline (starts at first point only)
        walkedPolyline = L.polyline( [ trackCoords[ 0 ] ], {
            color: walkedColor,
            weight: 4,
            opacity: 1,
            className: 'pathway-track-walked'
        } ).addTo( map );

        // Create remaining polyline (full track initially)
        remainingPolyline = L.polyline( trackCoords, {
            color: remainingColor,
            weight: 3,
            opacity: 0.7,
            className: 'pathway-track-remaining'
        } ).addTo( map );

        // Remove original gpxLayer (replaced by split polylines)
        if ( gpxLayer ) {
            map.removeLayer( gpxLayer );
            gpxLayer = null;
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

        // Initialize smoothed progress on first update
        if ( lastSmoothedProgress === null ) {
            lastSmoothedProgress = progress;
        }

        // Apply exponential smoothing to progress for synchronized camera and polylines
        const smoothedProgress = lerp( lastSmoothedProgress, progress, CAMERA_SMOOTHING );

        // Get coordinate at smoothed progress along track
        const targetCoord = getCoordinateAtProgress( smoothedProgress );

        // Apply zoom interpolation
        const targetZoom = lerp( currentZoom, nextZoom, smoothedProgress );

        if ( targetCoord && map && isFollowMode ) {
            // Update camera position
            map.setView( targetCoord, targetZoom, { animate: false } );
        }

        // Store smoothed progress for next frame
        lastSmoothedProgress = smoothedProgress;

        // Update polyline split using same smoothed progress
        const walkedCoords = getTrackUpToProgress( smoothedProgress );
        const remainingCoords = getTrackFromProgress( smoothedProgress );

        if ( walkedPolyline && walkedCoords.length > 0 ) {
            walkedPolyline.setLatLngs( walkedCoords );
        }
        if ( remainingPolyline && remainingCoords.length > 0 ) {
            remainingPolyline.setLatLngs( remainingCoords );
        }
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
    }

    /**
     * Parse GPX content and extract track coordinates
     *
     * @param {string} gpxContent - GPX XML content
     * @return {Array} Array of [lat, lng] coordinates
     */
    function parseGPXTrack( gpxContent ) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString( gpxContent, 'text/xml' );

            const parserError = xmlDoc.querySelector( 'parsererror' );
            if ( parserError ) {
                console.error( 'Pathway: GPX parsing error', parserError );
                return [];
            }

            const trkpts = xmlDoc.querySelectorAll( 'trkpt' );
            const coords = [];

            trkpts.forEach( ( trkpt ) => {
                const lat = parseFloat( trkpt.getAttribute( 'lat' ) );
                const lon = parseFloat( trkpt.getAttribute( 'lon' ) );
                if ( ! isNaN( lat ) && ! isNaN( lon ) ) {
                    coords.push( [ lat, lon ] );
                }
            } );

            return coords;
        } catch ( error ) {
            console.error( 'Pathway: Failed to parse GPX', error );
            return [];
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
        const cacheKey = `pathway-gpx-${attachmentId}`;

        // Check sessionStorage cache
        const cached = sessionStorage.getItem( cacheKey );
        if ( cached ) {
            try {
                return JSON.parse( cached );
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
            const coords = parseGPXTrack( gpxContent );

            // Cache the parsed coordinates
            if ( coords.length > 0 ) {
                sessionStorage.setItem( cacheKey, JSON.stringify( coords ) );
            }

            return coords;
        } catch ( error ) {
            console.error( 'Pathway: Failed to fetch GPX', error );
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
        const activeClass = isActive ? ' pathway-active' : '';
        return L.divIcon( {
            className: 'pathway-marker-icon',
            html: `<div class="pathway-marker-pin${activeClass}"></div>`,
            iconSize: [ ICON_SIZE, ICON_SIZE ],   // Total icon dimensions
            iconAnchor: [ ICON_ANCHOR, ICON_ANCHOR ],   // Point that sits on the lat/lng coordinate
            popupAnchor: [ 0, POPUP_ANCHOR_Y ]  // Where popups open relative to anchor
        } );
    }

    /**
     * Update marker icons to show active state
     *
     * @param {number} activeIndex - Index of active marker
     */
    function updateMarkerIcons( activeIndex ) {
        markerLayers.forEach( ( marker, index ) => {
            const icon = createNumberedIcon( index + 1, index === activeIndex );
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
            cachedMarkerElements = document.querySelectorAll( '.pathway-marker' );
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
     * Initialize the map
     *
     * @param {Object} bounds - GPX bounds object
     * @return {L.Map} Leaflet map instance
     */
    function initializeMap( bounds ) {
        // Create map container
        const mapContainer = document.createElement( 'div' );
        mapContainer.id = 'pathway-map';
        mapContainer.className = 'pathway-map';

        // Insert map into page (positioned by CSS)
        const gpxBlock = document.querySelector( '.pathway-map-gpx' );
        if ( gpxBlock && gpxBlock.parentNode ) {
            gpxBlock.parentNode.insertBefore( mapContainer, gpxBlock.nextSibling );
        } else {
            document.body.appendChild( mapContainer );
        }

        // Initialize Leaflet map
        const leafletMap = L.map( 'pathway-map', {
            zoomControl: true,
            scrollWheelZoom: true
        } );

        // Add OpenStreetMap tiles
        L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        } ).addTo( leafletMap );

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

        // Add polyline
        gpxLayer = L.polyline( coords, {
            color: '#a8b8c8',
            weight: 3,
            opacity: 0.8
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

                if ( isNaN( lat ) || isNaN( lng ) || ( lat === 0 && lng === 0 ) ) {
                    return;
                }

                // Store marker data
                markers.push( { lat, lng, title, zoom, element } );

                // Create numbered marker
                const icon = createNumberedIcon( markers.length, false );
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
     * Initialize Pathway map
     */
    async function initPathway() {
        // Check if we have Pathway blocks on this page
        const gpxBlock = document.querySelector( '.pathway-map-gpx' );
        const markerElements = getMarkerElements();

        // Exit if no Pathway content at all
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
                    console.warn( 'Pathway: Failed to parse bounds', e );
                }
            }
        }

        // Fall back to marker bounds if no valid GPX bounds
        if ( ! hasValidGpxBounds && markerElements.length > 0 ) {
            bounds = calculateBoundsFromMarkers();
        }

        // Initialize map
        map = initializeMap( bounds );

        // Read progress indicator setting
        if ( gpxBlock ) {
            showProgressIndicator = gpxBlock.dataset.showProgress !== 'false';
        }

        // Only fetch GPX if block exists with valid URL
        if ( gpxBlock ) {
            const attachmentId = parseInt( gpxBlock.dataset.attachmentId );
            const gpxUrl = gpxBlock.dataset.gpxUrl;
            if ( gpxUrl ) {
                const coords = await fetchGPX( attachmentId, gpxUrl );
                if ( coords.length > 0 ) {
                    // Store track coordinates for progress indicator
                    trackCoords = coords;

                    // Calculate distances along track
                    const distanceData = calculateTrackDistances( coords );
                    trackDistances = distanceData.distances;
                    totalTrackDistance = distanceData.totalDistance;

                    // Add GPX track (will be replaced by progress indicator if enabled)
                    addGPXTrack( coords );
                }
            }
        }

        // Add marker pins
        addMarkerPins();

        // If no GPX track but markers exist, create path from markers
        if ( trackCoords.length === 0 && markers.length >= 2 ) {
            trackCoords = markers.map( m => [ m.lat, m.lng ] );

            // Calculate distances along marker path
            const distanceData = calculateTrackDistances( trackCoords );
            trackDistances = distanceData.distances;
            totalTrackDistance = distanceData.totalDistance;

            // If progress indicator is OFF, show a static connecting line
            if ( ! showProgressIndicator ) {
                L.polyline( trackCoords, {
                    color: '#4F7CAC',
                    weight: 3,
                    opacity: 0.7,
                    className: 'pathway-track-remaining'
                } ).addTo( map );
            }
        }

        // Initialize progress indicator (after markers are added)
        if ( showProgressIndicator && trackCoords.length > 0 ) {
            calculateMarkerTrackPositions();
            initProgressIndicator();

            // Set initial view to track start (now that we have the data)
            const startCoord = trackCoords[ 0 ];
            const startZoom = markers.length > 0 && markers[ 0 ]
                ? ( markers[ 0 ].zoom || DEFAULT_ZOOM )
                : DEFAULT_ZOOM;

            map.setView( startCoord, startZoom );
            initialZoom = startZoom;
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
        document.addEventListener( 'DOMContentLoaded', initPathway );
    } else {
        initPathway();
    }

} )();
