/**
 * Map Marker Block - Editor Component
 *
 * @package Pathway
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Edit component for Map Marker block
 *
 * @param {Object} props Block props
 * @return {Element} Block editor element
 */
export default function Edit( { attributes } ) {
    const blockProps = useBlockProps();
    const { title, lat, lng } = attributes;

    const hasLocation = lat !== 0 || lng !== 0;

    return (
        <div { ...blockProps }>
            <div className="pathway-map-marker-placeholder">
                { hasLocation ? (
                    <p>
                        📍 { title || __( 'Untitled Marker', 'pathway' ) } ({ lat.toFixed( 4 ) }, { lng.toFixed( 4 ) })
                    </p>
                ) : (
                    <p>{ __( 'Map Marker block - Input functionality coming in Phase 3', 'pathway' ) }</p>
                ) }
            </div>
        </div>
    );
}
