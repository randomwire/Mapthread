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
    let lastScrollTime = 0;

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
     * Get GPX file URL from attachment ID
     * We need to get this from the WordPress REST API
     *
     * @param {number} attachmentId - WordPress attachment ID
     * @return {Promise<string|null>} GPX file URL
     */
    async function getAttachmentUrl( attachmentId ) {
        try {
            const response = await fetch( `/wp-json/wp/v2/media/${attachmentId}` );
            if ( ! response.ok ) {
                throw new Error( `HTTP ${response.status}` );
            }
            const data = await response.json();
            return data.source_url || null;
        } catch ( error ) {
            console.error( 'Pathway: Failed to get attachment URL', error );
            return null;
        }
    }

    /**
     * Create numbered marker icon
     *
     * @param {number} number - Marker number
     * @param {boolean} isActive - Whether this marker is currently active
     * @return {L.DivIcon} Leaflet div icon
     */
    function createNumberedIcon( number, isActive = false ) {
        const activeClass = isActive ? ' pathway-marker-pin--active' : '';
        return L.divIcon( {
            className: 'pathway-marker-icon',
            html: `<div class="pathway-marker-pin${activeClass}">
                <span class="pathway-marker-number">${number}</span>
            </div>`,
            iconSize: [ 30, 40 ],
            iconAnchor: [ 15, 40 ],
            popupAnchor: [ 0, -40 ]
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
        } );
    }

    /**
     * Calculate which marker is currently active based on scroll position
     *
     * @return {number|null} Index of active marker or null
     */
    function calculateActiveMarker() {
        const markerElements = document.querySelectorAll( '.pathway-marker' );
        if ( markerElements.length === 0 ) {
            return null;
        }

        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * 0.25; // 25% from top

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

        // Default to first marker if none found
        return 0;
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
                duration: 0.8, // 800ms
                easeLinearity: 0.25
            }
        );
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
        if ( ! isFollowMode ) {
            return;
        }

        const now = Date.now();

        // Throttle scroll events (max once per 100ms)
        if ( now - lastScrollTime < 100 ) {
            return;
        }

        lastScrollTime = now;

        const newActiveMarker = calculateActiveMarker();
        if ( newActiveMarker !== null && newActiveMarker !== activeMarkerIndex ) {
            updateMapView( newActiveMarker );
        }
    }

    /**
     * Handle map interaction (pan/zoom)
     * Suspends follow mode until next scroll event changes active marker
     */
    function handleMapInteraction() {
        const previousActive = activeMarkerIndex;
        isFollowMode = false;

        // Re-enable follow mode on next scroll that changes active marker
        const checkScroll = () => {
            const newActive = calculateActiveMarker();
            if ( newActive !== previousActive ) {
                isFollowMode = true;
                window.removeEventListener( 'scroll', checkScroll );
            }
        };

        window.addEventListener( 'scroll', checkScroll );
    }

    /**
     * Scroll to marker element in content
     *
     * @param {number} markerIndex - Index of marker to scroll to
     */
    function scrollToMarker( markerIndex ) {
        const markerElements = document.querySelectorAll( '.pathway-marker' );
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

        // Insert map into page (will be positioned by CSS in Phase 5)
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

        // Fit to GPX bounds
        if ( bounds && bounds.north !== 0 ) {
            const leafletBounds = [
                [ bounds.south, bounds.west ],
                [ bounds.north, bounds.east ]
            ];
            leafletMap.fitBounds( leafletBounds, { padding: [ 50, 50 ] } );
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
            color: '#3388ff',
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

        const markerElements = document.querySelectorAll( '.pathway-marker' );

        markerElements.forEach( ( element, index ) => {
            const lat = parseFloat( element.dataset.lat );
            const lng = parseFloat( element.dataset.lng );
            const title = element.dataset.title || '';
            const zoom = parseInt( element.dataset.zoom ) || 14;

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
                    direction: 'top',
                    offset: [ 0, -35 ]
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
        } );
    }

    /**
     * Initialize Pathway map
     */
    async function initPathway() {
        // Check if we have Pathway blocks on this page
        const gpxBlock = document.querySelector( '.pathway-map-gpx' );
        if ( ! gpxBlock ) {
            return; // No GPX block, nothing to do
        }

        // Get GPX data
        const attachmentId = parseInt( gpxBlock.dataset.attachmentId );
        const boundsData = gpxBlock.dataset.bounds;

        if ( ! attachmentId ) {
            console.warn( 'Pathway: Missing GPX attachment ID' );
            return;
        }

        let bounds = { north: 0, south: 0, east: 0, west: 0 };
        if ( boundsData ) {
            try {
                bounds = JSON.parse( boundsData );
            } catch ( e ) {
                console.warn( 'Pathway: Failed to parse bounds', e );
            }
        }

        // Initialize map
        map = initializeMap( bounds );

        // Fetch and render GPX track
        const gpxUrl = await getAttachmentUrl( attachmentId );
        if ( gpxUrl ) {
            const coords = await fetchGPX( attachmentId, gpxUrl );
            if ( coords.length > 0 ) {
                addGPXTrack( coords );
            } else {
                console.warn( 'Pathway: No track coordinates found in GPX' );
            }
        } else {
            console.warn( 'Pathway: Could not get GPX URL' );
        }

        // Add marker pins
        addMarkerPins();

        // Set up scroll handling
        window.addEventListener( 'scroll', handleScroll, { passive: true } );

        // Initial marker activation (after a brief delay to let page settle)
        setTimeout( () => {
            const initialMarker = calculateActiveMarker();
            if ( initialMarker !== null && markers.length > 0 ) {
                activeMarkerIndex = initialMarker;
                updateMarkerIcons( initialMarker );
            }
        }, 100 );
    }

    // Initialize when DOM is ready
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', initPathway );
    } else {
        initPathway();
    }

} )();
