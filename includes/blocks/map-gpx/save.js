/**
 * Map GPX Block - Save Component
 *
 * @package Pathway
 */

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component for Map GPX block
 *
 * @param {Object} props Block props
 * @return {Element} Block save element
 */
export default function save( { attributes } ) {
    const blockProps = useBlockProps.save();
    const { attachmentId, bounds } = attributes;

    return (
        <div
            { ...blockProps }
            className="pathway-map-gpx"
            data-attachment-id={ attachmentId }
            data-bounds={ JSON.stringify( bounds ) }
        />
    );
}
