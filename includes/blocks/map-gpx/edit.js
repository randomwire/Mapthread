/**
 * Map GPX Block - Editor Component
 *
 * @package Pathway
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Edit component for Map GPX block
 *
 * @param {Object} props Block props
 * @return {Element} Block editor element
 */
export default function Edit( { attributes } ) {
    const blockProps = useBlockProps();
    const { fileName, pointCount } = attributes;

    return (
        <div { ...blockProps }>
            <div className="pathway-map-gpx-placeholder">
                { fileName ? (
                    <p>
                        { __( 'GPX uploaded:', 'pathway' ) } { fileName } ({ pointCount } { __( 'points', 'pathway' ) })
                    </p>
                ) : (
                    <p>{ __( 'Map GPX block - Upload functionality coming in Phase 2', 'pathway' ) }</p>
                ) }
            </div>
        </div>
    );
}
