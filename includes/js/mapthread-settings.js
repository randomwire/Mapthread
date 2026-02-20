( function() {
	document.querySelectorAll( '.mapthread-api-key' ).forEach( function( input ) {
		var provider = input.getAttribute( 'data-provider' );
		var group = document.querySelector( '.mapthread-styles-group[data-provider="' + provider + '"]' );
		if ( ! group ) return;
		var checkboxes = group.querySelectorAll( 'input[type="checkbox"]' );

		function toggle() {
			var hasKey = input.value.trim().length > 0;
			checkboxes.forEach( function( cb ) {
				cb.disabled = ! hasKey;
			} );
		}

		input.addEventListener( 'input', toggle );
	} );
} )();
