/**
 * Map GPX Block - Save Component
 *
 * @package
 */

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component for Map GPX block
 *
 * @param {Object} props            Block props
 * @param          props.attributes
 * @return {Element} Block save element
 */
export default function save( { attributes } ) {
	const blockProps = useBlockProps.save();
	const { attachmentId, gpxUrl, bounds, showElevationProfile } = attributes;

	return (
		<div
			{ ...blockProps }
			className="mapthread-map-gpx"
			data-attachment-id={ attachmentId }
			data-gpx-url={ gpxUrl }
			data-bounds={ JSON.stringify( bounds ) }
			data-show-elevation={ showElevationProfile }
		/>
	);
}
