/**
 * Map GPX Block - Editor Component
 *
 * @package Pathway
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } from '@wordpress/block-editor';
import {
    Button,
    Placeholder,
    Notice,
    Spinner,
    PanelBody,
    ToggleControl
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { upload } from '@wordpress/icons';

/**
 * Parse GPX file and extract track data
 *
 * @param {string} gpxContent - GPX file content as string
 * @return {Object|null} Parsed data or null if invalid
 */
function parseGPX( gpxContent ) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString( gpxContent, 'text/xml' );

        // Check for parsing errors
        const parserError = xmlDoc.querySelector( 'parsererror' );
        if ( parserError ) {
            return { error: __( 'Invalid GPX format - XML parsing failed', 'pathway' ) };
        }

        // Find all track points
        const trkpts = xmlDoc.querySelectorAll( 'trkpt' );

        if ( trkpts.length === 0 ) {
            return { error: __( 'No track points found in GPX file', 'pathway' ) };
        }

        // Extract coordinates and calculate bounds
        let north = -90, south = 90, east = -180, west = 180;

        trkpts.forEach( ( trkpt ) => {
            const lat = parseFloat( trkpt.getAttribute( 'lat' ) );
            const lon = parseFloat( trkpt.getAttribute( 'lon' ) );

            if ( lat > north ) north = lat;
            if ( lat < south ) south = lat;
            if ( lon > east ) east = lon;
            if ( lon < west ) west = lon;
        } );

        return {
            pointCount: trkpts.length,
            bounds: { north, south, east, west }
        };
    } catch ( error ) {
        return { error: __( 'Failed to parse GPX file', 'pathway' ) };
    }
}

/**
 * Check if there are multiple Map GPX blocks on the page
 *
 * @param {string} clientId - Current block's client ID
 * @return {boolean} True if multiple blocks exist
 */
function hasMultipleGPXBlocks( clientId ) {
    const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
    const gpxBlocks = blocks.filter( block => block.name === 'pathway/map-gpx' );

    // If more than one GPX block exists, and this isn't the first one
    if ( gpxBlocks.length > 1 ) {
        const firstBlockId = gpxBlocks[0].clientId;
        return clientId !== firstBlockId;
    }

    return false;
}

/**
 * Edit component for Map GPX block
 *
 * @param {Object} props Block props
 * @return {Element} Block editor element
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
    const blockProps = useBlockProps();
    const { attachmentId, fileName, pointCount, bounds, showProgressIndicator, showElevationProfile } = attributes;

    const [ isProcessing, setIsProcessing ] = useState( false );
    const [ validationError, setValidationError ] = useState( '' );
    const [ validationWarning, setValidationWarning ] = useState( '' );
    const [ multipleBlockWarning, setMultipleBlockWarning ] = useState( false );

    // Get attachment data from media library
    const attachment = useSelect(
        ( select ) => {
            if ( ! attachmentId ) {
                return null;
            }
            return select( 'core' ).getMedia( attachmentId );
        },
        [ attachmentId ]
    );

    // Check for multiple GPX blocks on mount and when blocks change
    useEffect( () => {
        setMultipleBlockWarning( hasMultipleGPXBlocks( clientId ) );
    }, [] );

    /**
     * Handle GPX file selection from media library
     *
     * @param {Object} media - Selected media object
     */
    const onSelectGPX = async ( media ) => {
        // Validate file type
        if ( media.mime !== 'application/gpx+xml' && ! media.url.endsWith( '.gpx' ) ) {
            setValidationError( __( 'Please select a valid GPX file', 'pathway' ) );
            return;
        }

        // Check file size (10MB = 10485760 bytes)
        const fileSizeWarning = media.filesizeInBytes > 10485760
            ? __( 'Warning: File size exceeds 10MB. This may cause performance issues.', 'pathway' )
            : '';

        setIsProcessing( true );
        setValidationError( '' );
        setValidationWarning( fileSizeWarning );

        try {
            // Fetch GPX file content
            const response = await fetch( media.url );
            if ( ! response.ok ) {
                throw new Error( 'Failed to fetch GPX file' );
            }

            const gpxContent = await response.text();

            // Parse GPX
            const parsed = parseGPX( gpxContent );

            if ( parsed.error ) {
                setValidationError( parsed.error );
                setIsProcessing( false );
                return;
            }

            // Check point count
            if ( parsed.pointCount > 50000 ) {
                setValidationWarning(
                    fileSizeWarning + ' ' +
                    __( 'Warning: Track has more than 50,000 points. This may cause performance issues.', 'pathway' )
                );
            }

            // Update block attributes
            setAttributes( {
                attachmentId: media.id,
                fileName: media.filename,
                gpxUrl: media.url,
                pointCount: parsed.pointCount,
                bounds: parsed.bounds
            } );

            setIsProcessing( false );
        } catch ( error ) {
            setValidationError( __( 'Error loading GPX file. Please try again.', 'pathway' ) );
            setIsProcessing( false );
        }
    };

    /**
     * Handle GPX file removal
     */
    const onRemoveGPX = () => {
        setAttributes( {
            attachmentId: 0,
            fileName: '',
            gpxUrl: '',
            pointCount: 0,
            bounds: { north: 0, south: 0, east: 0, west: 0 }
        } );
        setValidationError( '' );
        setValidationWarning( '' );
    };

    // Show processing state
    if ( isProcessing ) {
        return (
            <div { ...blockProps }>
                <Placeholder
                    icon="location-alt"
                    label={ __( 'Map GPX', 'pathway' ) }
                >
                    <Spinner />
                    <p>{ __( 'Processing GPX file...', 'pathway' ) }</p>
                </Placeholder>
            </div>
        );
    }

    // Show upload interface if no GPX selected
    if ( ! attachmentId || ! fileName ) {
        return (
            <>
                <InspectorControls>
                    <PanelBody title={ __( 'Map Settings', 'pathway' ) }>
                        <ToggleControl
                            label={ __( 'Show progress indicator', 'pathway' ) }
                            checked={ showProgressIndicator }
                            onChange={ ( value ) => setAttributes( { showProgressIndicator: value } ) }
                            help={ __( 'Animate position along track as readers scroll', 'pathway' ) }
                        />
                        <ToggleControl
                            label={ __( 'Show elevation profile', 'pathway' ) }
                            checked={ showElevationProfile }
                            onChange={ ( value ) => setAttributes( { showElevationProfile: value } ) }
                            help={ __( 'Display elevation chart at bottom of map', 'pathway' ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <div { ...blockProps }>
                    <Placeholder
                        icon="location-alt"
                        label={ __( 'Map GPX', 'pathway' ) }
                        instructions={ __( 'Upload a GPX file to display your route or track on an interactive map.', 'pathway' ) }
                    >
                        { validationError && (
                            <Notice status="error" isDismissible={ false }>
                                { validationError }
                            </Notice>
                        ) }
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ onSelectGPX }
                                allowedTypes={ [ 'application/gpx+xml' ] }
                                value={ attachmentId }
                                render={ ( { open } ) => (
                                    <Button
                                        onClick={ open }
                                        variant="primary"
                                        icon={ upload }
                                    >
                                        { __( 'Upload GPX File', 'pathway' ) }
                                    </Button>
                                ) }
                            />
                        </MediaUploadCheck>
                    </Placeholder>
                </div>
            </>
        );
    }

    // Show GPX info with replace/remove options
    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Map Settings', 'pathway' ) }>
                    <ToggleControl
                        label={ __( 'Show progress indicator', 'pathway' ) }
                        checked={ showProgressIndicator }
                        onChange={ ( value ) => setAttributes( { showProgressIndicator: value } ) }
                        help={ __( 'Animate position along track as readers scroll', 'pathway' ) }
                    />
                    <ToggleControl
                        label={ __( 'Show elevation profile', 'pathway' ) }
                        checked={ showElevationProfile }
                        onChange={ ( value ) => setAttributes( { showElevationProfile: value } ) }
                        help={ __( 'Display elevation chart at bottom of map', 'pathway' ) }
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...blockProps }>
                <div className="pathway-map-gpx-editor">
                { multipleBlockWarning && (
                    <Notice status="warning" isDismissible={ false }>
                        { __( 'Multiple Map GPX blocks detected. Only the first block will be used on the frontend.', 'pathway' ) }
                    </Notice>
                ) }

                { validationError && (
                    <Notice status="error" isDismissible={ false }>
                        { validationError }
                    </Notice>
                ) }

                { validationWarning && (
                    <Notice status="warning" isDismissible={ true } onRemove={ () => setValidationWarning( '' ) }>
                        { validationWarning }
                    </Notice>
                ) }

                <div className="pathway-map-gpx-info">
                    <div className="pathway-map-gpx-icon">
                        <span className="dashicons dashicons-location-alt"></span>
                    </div>
                    <div className="pathway-map-gpx-details">
                        <strong>{ __( 'GPX uploaded:', 'pathway' ) }</strong> { fileName }
                        <br />
                        <span className="pathway-map-gpx-meta">
                            { pointCount.toLocaleString() } { __( 'track points', 'pathway' ) }
                            { ' • ' }
                            { __( 'Bounds:', 'pathway' ) } { bounds.north.toFixed( 4 ) }°N, { bounds.south.toFixed( 4 ) }°S,
                            { ' ' }{ bounds.east.toFixed( 4 ) }°E, { bounds.west.toFixed( 4 ) }°W
                        </span>
                    </div>
                </div>

                <div className="pathway-map-gpx-actions">
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={ onSelectGPX }
                            allowedTypes={ [ 'application/gpx+xml' ] }
                            value={ attachmentId }
                            render={ ( { open } ) => (
                                <Button onClick={ open } variant="secondary">
                                    { __( 'Replace GPX', 'pathway' ) }
                                </Button>
                            ) }
                        />
                    </MediaUploadCheck>
                    <Button onClick={ onRemoveGPX } variant="tertiary" isDestructive>
                        { __( 'Remove GPX', 'pathway' ) }
                    </Button>
                </div>
            </div>
        </div>
        </>
    );
}
