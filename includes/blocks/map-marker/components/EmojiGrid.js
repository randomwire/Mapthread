/**
 * EmojiGrid - Curated emoji picker for map markers
 *
 * @package Mapthread
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

const EMOJI_CATEGORIES = {
	Travel: [ '✈️', '🚗', '🚂', '🚢', '🚁', '🛶', '🚲', '⛵', '🏍️', '🚌', '🛺', '🚃', '🚀', '🛤️', '⛽' ],
	Nature: [ '⛰️', '🏔️', '🌋', '🗻', '🏞️', '🌲', '🌊', '🏜️', '🌅', '🌿', '🌸', '🍂', '🏖️', '🌾', '💧' ],
	Landmarks: [ '⛩️', '🗼', '🏰', '⛪', '🕌', '🗽', '🏛️', '🎪', '⛲', '🗿', '🏗️', '🌉', '🏟️', '🕍', '🛕' ],
	Food: [ '🍜', '🍣', '🍕', '🍺', '☕', '🍷', '🍦', '🍱', '🥐', '🍵', '🥘', '🧁', '🍔', '🥗', '🍩' ],
	Activities: [ '🏕️', '⛷️', '🏄', '🧗', '🚣', '🎣', '🏊', '🤿', '🎿', '🏇', '🪂', '⛺', '🎯', '🏋️', '🧘' ],
	Weather: [ '☀️', '🌧️', '❄️', '🌈', '⛈️', '🌤️', '🌙', '⭐', '🌪️', '🌫️' ],
	Animals: [ '🐻', '🦅', '🐋', '🦌', '🐒', '🐘', '🦁', '🐧', '🦜', '🐬', '🐢', '🦋', '🐺', '🐫', '🦈' ],
	Markers: [ '📍', '🏁', '⭐', '❤️', '🔴', '🟢', '🔵', '⚠️', '🏠', '🎌', '📌', '🚩', '💎', '🔔', '✅' ],
};

/**
 * Regex to test if a string contains only emoji characters.
 * Matches common emoji ranges including modifiers, ZWJ sequences, and flags.
 */
const EMOJI_REGEX = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;

/**
 * Validate that input is a single emoji (or compound emoji like flags/ZWJ sequences).
 *
 * @param {string} str Input string
 * @return {boolean} True if the string is a valid emoji
 */
function isEmoji( str ) {
	if ( ! str || str.length === 0 || str.length > 20 ) {
		return false;
	}
	return EMOJI_REGEX.test( str.trim() );
}

export default function EmojiGrid( { onSelect } ) {
	const [ customEmoji, setCustomEmoji ] = useState( '' );
	const [ customError, setCustomError ] = useState( '' );

	const handleCustomSubmit = () => {
		const trimmed = customEmoji.trim();
		if ( ! trimmed ) {
			return;
		}
		if ( isEmoji( trimmed ) ) {
			onSelect( trimmed );
			setCustomEmoji( '' );
			setCustomError( '' );
		} else {
			setCustomError( __( 'Please paste a single emoji character', 'mapthread' ) );
		}
	};

	return (
		<div style={ { padding: '12px', width: '300px', maxHeight: '400px', overflowY: 'auto' } }>
			<div style={ { display: 'flex', gap: '6px', marginBottom: '12px' } }>
				<input
					type="text"
					value={ customEmoji }
					onChange={ ( e ) => {
						setCustomEmoji( e.target.value );
						setCustomError( '' );
					} }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Enter' ) {
							handleCustomSubmit();
						}
					} }
					placeholder={ __( 'Paste any emoji…', 'mapthread' ) }
					style={ {
						flex: 1,
						padding: '4px 8px',
						fontSize: '16px',
						border: customError ? '1px solid #cc1818' : '1px solid #949494',
						borderRadius: '2px',
					} }
				/>
			</div>
			{ customError && (
				<div style={ { color: '#cc1818', fontSize: '12px', marginBottom: '8px', marginTop: '-8px' } }>
					{ customError }
				</div>
			) }
			{ Object.entries( EMOJI_CATEGORIES ).map( ( [ category, emojis ] ) => (
				<div key={ category } style={ { marginBottom: '8px' } }>
					<div style={ { fontSize: '11px', color: '#757575', marginBottom: '4px', textTransform: 'uppercase' } }>
						{ category }
					</div>
					<div style={ { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px' } }>
						{ emojis.map( ( emojiChar ) => (
							<button
								key={ emojiChar }
								type="button"
								onClick={ () => onSelect( emojiChar ) }
								style={ {
									background: 'none',
									border: '1px solid transparent',
									borderRadius: '4px',
									fontSize: '20px',
									padding: '4px',
									cursor: 'pointer',
									lineHeight: 1,
									textAlign: 'center',
								} }
								onMouseEnter={ ( e ) => {
									e.currentTarget.style.backgroundColor = '#f0f0f0';
								} }
								onMouseLeave={ ( e ) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								} }
							>
								{ emojiChar }
							</button>
						) ) }
					</div>
				</div>
			) ) }
		</div>
	);
}
