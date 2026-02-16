/**
 * Address Search Component with Geocoding
 *
 * Provides autocomplete address search using OpenStreetMap Nominatim API
 * and displays a mini map preview of selected locations.
 *
 * @package Mapthread
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { TextControl, Spinner } from '@wordpress/components';

/**
 * Debounce hook
 *
 * @param {*} value Value to debounce
 * @param {number} delay Delay in milliseconds
 * @return {*} Debounced value
 */
function useDebounce( value, delay ) {
    const [ debouncedValue, setDebouncedValue ] = useState( value );

    useEffect( () => {
        const handler = setTimeout( () => {
            setDebouncedValue( value );
        }, delay );

        return () => {
            clearTimeout( handler );
        };
    }, [ value, delay ] );

    return debouncedValue;
}

/**
 * Search for addresses using Nominatim API
 *
 * @param {string} query Search query
 * @return {Promise<Array>} Array of search results
 */
async function searchAddress( query ) {
    if ( ! query || query.length < 3 ) {
        return [];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `q=${ encodeURIComponent( query ) }&format=json&limit=5&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'MapthreadWordPressPlugin/1.0'
                }
            }
        );

        if ( ! response.ok ) {
            throw new Error( `HTTP ${ response.status }` );
        }

        return await response.json();
    } catch ( error ) {
        console.error( 'Mapthread: Address search failed', error );
        return [];
    }
}

/**
 * Calculate tile coordinates for a given lat/lng and zoom level
 *
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @param {number} zoom Zoom level
 * @return {Object} Tile coordinates {x, y, z}
 */
function latLngToTile( lat, lng, zoom ) {
    const x = Math.floor( ( lng + 180 ) / 360 * Math.pow( 2, zoom ) );
    const y = Math.floor(
        ( 1 - Math.log( Math.tan( lat * Math.PI / 180 ) + 1 / Math.cos( lat * Math.PI / 180 ) ) / Math.PI ) / 2 * Math.pow( 2, zoom )
    );
    return { x, y, z: zoom };
}

/**
 * Calculate pixel offset within a tile for a given lat/lng
 *
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @param {number} zoom Zoom level
 * @return {Object} Pixel offset {x, y} within tile (0-256)
 */
function latLngToPixelOffset( lat, lng, zoom ) {
    const scale = Math.pow( 2, zoom );
    const worldX = ( lng + 180 ) / 360 * 256 * scale;
    const worldY = ( 1 - Math.log( Math.tan( lat * Math.PI / 180 ) + 1 / Math.cos( lat * Math.PI / 180 ) ) / Math.PI ) / 2 * 256 * scale;

    const tileX = Math.floor( worldX / 256 );
    const tileY = Math.floor( worldY / 256 );

    return {
        x: worldX - tileX * 256,
        y: worldY - tileY * 256
    };
}

/**
 * Address Search Component
 *
 * @param {Object} props Component props
 * @param {Function} props.onSelect Callback when location is selected (receives {lat, lng, address})
 * @param {number} props.currentLat Current latitude (for showing preview)
 * @param {number} props.currentLng Current longitude (for showing preview)
 * @param {string} props.currentAddress Current address value
 * @return {Element} Component element
 */
export default function AddressSearch( { onSelect, currentLat, currentLng, currentAddress } ) {
    const [ query, setQuery ] = useState( currentAddress || '' );
    const [ results, setResults ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ showResults, setShowResults ] = useState( false );
    const [ selectedLocation, setSelectedLocation ] = useState( null );
    const [ isSearching, setIsSearching ] = useState( false );
    const wrapperRef = useRef( null );

    const debouncedQuery = useDebounce( query, 300 );

    // Sync with external address changes (but not during active search)
    useEffect( () => {
        if ( ! isSearching && currentAddress !== query ) {
            setQuery( currentAddress || '' );
        }
    }, [ currentAddress ] );

    // Search when debounced query changes and user is actively searching
    useEffect( () => {
        if ( isSearching && debouncedQuery.length >= 3 ) {
            setIsLoading( true );
            searchAddress( debouncedQuery ).then( ( data ) => {
                setResults( data );
                setIsLoading( false );
                setShowResults( true );
            } ).catch( () => {
                setResults( [] );
                setIsLoading( false );
            } );
        } else {
            setResults( [] );
            setShowResults( false );
        }
    }, [ debouncedQuery, isSearching ] );

    // Close dropdown when clicking outside
    useEffect( () => {
        function handleClickOutside( event ) {
            if ( wrapperRef.current && ! wrapperRef.current.contains( event.target ) ) {
                setShowResults( false );
            }
        }

        document.addEventListener( 'mousedown', handleClickOutside );
        return () => {
            document.removeEventListener( 'mousedown', handleClickOutside );
        };
    }, [] );

    // Handle input change - user is searching
    const handleInputChange = useCallback( ( value ) => {
        setQuery( value );
        setIsSearching( true );
    }, [] );

    // Handle result selection
    const handleSelect = useCallback( ( result ) => {
        const lat = parseFloat( result.lat );
        const lng = parseFloat( result.lon );
        const address = result.display_name;

        setSelectedLocation( { lat, lng, address } );
        setShowResults( false );
        setQuery( address );
        setIsSearching( false );

        // Call parent callback to update attributes
        onSelect( { lat, lng, address } );
    }, [ onSelect ] );

    // Determine which location to show in preview
    const previewLat = selectedLocation?.lat || ( currentLat !== 0 ? currentLat : null );
    const previewLng = selectedLocation?.lng || ( currentLng !== 0 ? currentLng : null );
    const hasPreviewLocation = previewLat !== null && previewLng !== null;

    // Calculate tile URL and marker position for preview
    let tileUrl = '';
    let markerStyle = {};
    if ( hasPreviewLocation ) {
        const zoom = 14;
        const tile = latLngToTile( previewLat, previewLng, zoom );
        const offset = latLngToPixelOffset( previewLat, previewLng, zoom );

        tileUrl = `https://tile.openstreetmap.org/${ tile.z }/${ tile.x }/${ tile.y }.png`;

        // Calculate marker position (center of preview minus offset from tile center)
        // Preview is 256x180, tile is 256x256
        markerStyle = {
            left: `${ offset.x }px`,
            top: `${ offset.y - 38 }px` // Offset for tile vs preview height difference
        };
    }

    return (
        <div className="mapthread-address-search" ref={ wrapperRef }>
            <TextControl
                label={ __( 'Address (optional)', 'mapthread' ) }
                value={ query }
                onChange={ handleInputChange }
                placeholder={ __( 'Search for a location...', 'mapthread' ) }
                help={ __( 'Type to search and auto-fill coordinates', 'mapthread' ) }
            />

            { isLoading && (
                <div className="mapthread-address-search__loading">
                    <Spinner />
                </div>
            ) }

            { showResults && results.length > 0 && (
                <ul className="mapthread-address-search__results">
                    { results.map( ( result, index ) => (
                        <li
                            key={ result.place_id || index }
                            className="mapthread-address-search__result"
                            onClick={ () => handleSelect( result ) }
                            onKeyDown={ ( e ) => {
                                if ( e.key === 'Enter' || e.key === ' ' ) {
                                    handleSelect( result );
                                }
                            } }
                            role="option"
                            tabIndex={ 0 }
                        >
                            <span className="mapthread-address-search__result-name">
                                { result.display_name }
                            </span>
                            <span className="mapthread-address-search__result-type">
                                { result.type }
                            </span>
                        </li>
                    ) ) }
                </ul>
            ) }

            { showResults && results.length === 0 && ! isLoading && debouncedQuery.length >= 3 && (
                <div className="mapthread-address-search__no-results">
                    { __( 'No results found', 'mapthread' ) }
                </div>
            ) }

            { hasPreviewLocation && (
                <div className="mapthread-address-search__preview">
                    <div className="mapthread-address-search__map">
                        <img
                            src={ tileUrl }
                            alt={ __( 'Location preview', 'mapthread' ) }
                            className="mapthread-address-search__tile"
                        />
                        <div
                            className="mapthread-address-search__marker"
                            style={ markerStyle }
                        />
                    </div>
                </div>
            ) }
        </div>
    );
}
