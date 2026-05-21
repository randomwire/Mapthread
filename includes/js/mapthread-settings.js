( function () {
	document
		.querySelectorAll( '.mapthread-api-key' )
		.forEach( function ( input ) {
			const provider = input.getAttribute( 'data-provider' );
			const group = document.querySelector(
				'.mapthread-styles-group[data-provider="' + provider + '"]'
			);
			if ( ! group ) {
				return;
			}
			const checkboxes = group.querySelectorAll(
				'input[type="checkbox"]'
			);

			function toggle() {
				const hasKey = input.value.trim().length > 0;
				checkboxes.forEach( function ( cb ) {
					cb.disabled = ! hasKey;
				} );
			}

			input.addEventListener( 'input', toggle );
		} );
} )();
