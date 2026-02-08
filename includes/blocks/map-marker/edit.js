/**
 * Map Marker Block - Editor Component
 *
 * @package Pathway
 */

import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    BaseControl,
    Button,
    Popover,
    Notice,
    __experimentalNumberControl as NumberControl
} from '@wordpress/components';
import { useEffect, useCallback, useState, useRef } from '@wordpress/element';
import 'emoji-picker-element';
import { useSelect } from '@wordpress/data';
import AddressSearch from './components/AddressSearch';

/**
 * Generate a unique ID for the marker
 *
 * @return {string} Unique ID
 */
function generateUniqueId() {
    return `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param {number} lat1 First latitude
 * @param {number} lon1 First longitude
 * @param {number} lat2 Second latitude
 * @param {number} lon2 Second longitude
 * @return {number} Distance in kilometers
 */
function calculateDistance( lat1, lon1, lat2, lon2 ) {
    const R = 6371; // Earth's radius in km
    const dLat = ( lat2 - lat1 ) * Math.PI / 180;
    const dLon = ( lon2 - lon1 ) * Math.PI / 180;
    const a =
        Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
        Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
        Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );
    const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    return R * c;
}

/**
 * Check if marker is within reasonable distance of GPX bounds
 *
 * @param {number} lat Marker latitude
 * @param {number} lng Marker longitude
 * @param {Object} bounds GPX bounds object
 * @return {Object} Result with isNear boolean and distance
 */
function checkDistanceFromTrack( lat, lng, bounds ) {
    if ( ! bounds || bounds.north === 0 ) {
        return { isNear: true, distance: 0 };
    }

    // Calculate distance to each corner of bounds
    const distances = [
        calculateDistance( lat, lng, bounds.north, bounds.east ),
        calculateDistance( lat, lng, bounds.north, bounds.west ),
        calculateDistance( lat, lng, bounds.south, bounds.east ),
        calculateDistance( lat, lng, bounds.south, bounds.west )
    ];

    // Also check center point
    const centerLat = ( bounds.north + bounds.south ) / 2;
    const centerLng = ( bounds.east + bounds.west ) / 2;
    distances.push( calculateDistance( lat, lng, centerLat, centerLng ) );

    // Get minimum distance
    const minDistance = Math.min( ...distances );

    return {
        isNear: minDistance <= 50, // 50km threshold
        distance: Math.round( minDistance )
    };
}

/**
 * Find Map GPX block in a list of blocks (searches nested blocks)
 *
 * @param {Array} blocks - Blocks to search
 * @return {Object|null} GPX block or null
 */
function findGPXBlockInList( blocks ) {
    if ( ! blocks || ! Array.isArray( blocks ) ) {
        return null;
    }
    for ( const block of blocks ) {
        if ( block.name === 'pathway/map-gpx' ) {
            return block;
        }
        // Search nested blocks (innerBlocks)
        if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
            const found = findGPXBlockInList( block.innerBlocks );
            if ( found ) {
                return found;
            }
        }
    }
    return null;
}

/**
 * Edit component for Map Marker block
 *
 * @param {Object} props Block props
 * @return {Element} Block editor element
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
    const blockProps = useBlockProps();
    const { id, title, lat, lng, address, zoom, emoji } = attributes;
    const [ showEmojiPicker, setShowEmojiPicker ] = useState( false );
    const emojiPickerRef = useRef();

    // Attach emoji-click listener when picker mounts
    useEffect( () => {
        const picker = emojiPickerRef.current;
        if ( ! picker ) {
            return;
        }
        const handleEmojiClick = ( event ) => {
            setAttributes( { emoji: event.detail.unicode } );
            setShowEmojiPicker( false );
        };
        picker.addEventListener( 'emoji-click', handleEmojiClick );
        return () => picker.removeEventListener( 'emoji-click', handleEmojiClick );
    }, [ showEmojiPicker ] );

    // Auto-generate ID on mount if not set
    useEffect( () => {
        if ( ! id ) {
            setAttributes( { id: generateUniqueId() } );
        }
    }, [] );

    // Handle address search selection
    const handleAddressSelect = useCallback( ( location ) => {
        setAttributes( {
            lat: location.lat,
            lng: location.lng,
            address: location.address
        } );
    }, [ setAttributes ] );

    // Find GPX block reactively using useSelect
    const gpxBlock = useSelect( ( select ) => {
        const blocks = select( 'core/block-editor' ).getBlocks();
        return findGPXBlockInList( blocks );
    } );
    const hasGPXBlock = !! gpxBlock;
    const gpxBounds = gpxBlock?.attributes?.bounds;

    // Validate coordinates
    const hasValidCoords = lat !== 0 || lng !== 0;
    const isMissingCoords = ! lat && ! lng;

    // Check distance from GPX track
    let distanceWarning = null;
    if ( hasValidCoords && hasGPXBlock && gpxBounds ) {
        const distanceCheck = checkDistanceFromTrack( lat, lng, gpxBounds );
        if ( ! distanceCheck.isNear ) {
            distanceWarning = sprintf(
                /* translators: %d is the distance in kilometers */
                __( 'This marker is %d km from the GPX track. Is this intentional?', 'pathway' ),
                distanceCheck.distance
            );
        }
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Marker Settings', 'pathway' ) } initialOpen={ true }>
                    <TextControl
                        label={ __( 'Title', 'pathway' ) }
                        value={ title }
                        onChange={ ( value ) => setAttributes( { title: value } ) }
                        placeholder={ __( 'Enter marker title...', 'pathway' ) }
                        help={ __( 'This will be displayed on the map pin', 'pathway' ) }
                    />

                    <BaseControl label={ __( 'Pin Design', 'pathway' ) }>
                        <div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                            <Button
                                variant="secondary"
                                onClick={ () => setShowEmojiPicker( ! showEmojiPicker ) }
                                style={ { fontSize: emoji ? '20px' : '13px', minWidth: '36px', height: '36px' } }
                            >
                                { emoji || __( 'Pick Emoji', 'pathway' ) }
                            </Button>
                            { emoji && (
                                <Button
                                    variant="link"
                                    isDestructive
                                    onClick={ () => setAttributes( { emoji: '' } ) }
                                >
                                    { __( 'Clear', 'pathway' ) }
                                </Button>
                            ) }
                        </div>
                        { showEmojiPicker && (
                            <Popover
                                onClose={ () => setShowEmojiPicker( false ) }
                                placement="left-start"
                            >
                                <emoji-picker ref={ emojiPickerRef }></emoji-picker>
                            </Popover>
                        ) }
                    </BaseControl>

                    <AddressSearch
                        onSelect={ handleAddressSelect }
                        currentLat={ lat }
                        currentLng={ lng }
                        currentAddress={ address }
                    />

                    <NumberControl
                        label={ __( 'Latitude', 'pathway' ) }
                        value={ lat }
                        onChange={ ( value ) => setAttributes( { lat: parseFloat( value ) || 0 } ) }
                        placeholder="51.5074"
                        help={ __( 'Decimal degrees (e.g., 51.5074)', 'pathway' ) }
                        step={ 0.0001 }
                    />

                    <NumberControl
                        label={ __( 'Longitude', 'pathway' ) }
                        value={ lng }
                        onChange={ ( value ) => setAttributes( { lng: parseFloat( value ) || 0 } ) }
                        placeholder="-0.1278"
                        help={ __( 'Decimal degrees (e.g., -0.1278)', 'pathway' ) }
                        step={ 0.0001 }
                    />

                    <NumberControl
                        label={ __( 'Zoom Level', 'pathway' ) }
                        value={ zoom }
                        onChange={ ( value ) => setAttributes( { zoom: parseInt( value ) || 14 } ) }
                        min={ 1 }
                        max={ 18 }
                        help={ __( 'Map zoom when this marker is active (1-18, default: 14)', 'pathway' ) }
                    />
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                <div className="pathway-map-marker-editor">
                    { isMissingCoords && (
                        <Notice status="error" isDismissible={ false }>
                            { __( 'Please enter latitude and longitude in the block settings (sidebar).', 'pathway' ) }
                        </Notice>
                    ) }

                    { distanceWarning && (
                        <Notice status="warning" isDismissible={ true }>
                            { distanceWarning }
                        </Notice>
                    ) }

                    <div className="pathway-map-marker-display">
                        <div className="pathway-map-marker-icon">
                            { emoji ? (
                                <span style={ { fontSize: '24px' } }>{ emoji }</span>
                            ) : (
                                <span className="dashicons dashicons-location"></span>
                            ) }
                        </div>
                        <div className="pathway-map-marker-info">
                            { title ? (
                                <strong className="pathway-map-marker-title">{ title }</strong>
                            ) : (
                                <em className="pathway-map-marker-title-empty">
                                    { __( 'Untitled Marker', 'pathway' ) }
                                </em>
                            ) }
                            <div className="pathway-map-marker-coords">
                                { hasValidCoords ? (
                                    <>
                                        { Math.abs( lat ).toFixed( 4 ) }°{ lat >= 0 ? 'N' : 'S' },
                                        { ' ' }
                                        { Math.abs( lng ).toFixed( 4 ) }°{ lng >= 0 ? 'E' : 'W' }
                                        { address && (
                                            <>
                                                { ' • ' }
                                                <span className="pathway-map-marker-address">{ address }</span>
                                            </>
                                        ) }
                                    </>
                                ) : (
                                    <em>{ __( 'No coordinates set', 'pathway' ) }</em>
                                ) }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
