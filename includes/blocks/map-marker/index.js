/**
 * Map Marker Block
 *
 * @package Pathway
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Register the Map Marker block
 */
registerBlockType( metadata.name, {
    edit: Edit,
    save,
} );
