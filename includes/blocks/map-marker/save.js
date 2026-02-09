/**
 * Map Marker Block - Save Component
 *
 * @package Mapthread
 */

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component for Map Marker block
 *
 * @param {Object} props Block props
 * @return {Element} Block save element
 */
export default function save( { attributes } ) {
    const blockProps = useBlockProps.save();
    const { id, title, lat, lng, zoom, emoji } = attributes;

    return (
        <div
            { ...blockProps }
            className="mapthread-marker"
            data-marker-id={ id }
            data-lat={ lat }
            data-lng={ lng }
            data-title={ title }
            data-zoom={ zoom }
            data-emoji={ emoji || undefined }
        />
    );
}
