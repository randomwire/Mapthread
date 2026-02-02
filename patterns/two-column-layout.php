<?php
/**
 * Pathway Two-Column Layout Pattern
 *
 * @package Pathway
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return '<!-- wp:columns {"align":"wide","style":{"spacing":{"gap":"var:preset|spacing|50"}}} -->
<div class="wp-block-columns alignwide">

<!-- wp:column {"width":"60%","style":{"spacing":{"padding":{"right":"2rem"}}}} -->
<div class="wp-block-column" style="flex-basis:60%;padding-right:2rem">

<!-- wp:heading {"level":1,"placeholder":"Your Story Title"} -->
<h1 class="wp-block-heading"></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"placeholder":"Write your introduction here. This is where your story begins..."} -->
<p></p>
<!-- /wp:paragraph -->

<!-- wp:pathway/map-marker {"title":"Starting Point"} /-->

<!-- wp:heading {"level":2,"placeholder":"First Stop"} -->
<h2 class="wp-block-heading"></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"placeholder":"Write about this location..."} -->
<p></p>
<!-- /wp:paragraph -->

<!-- wp:pathway/map-marker {"title":"Second Location"} /-->

<!-- wp:heading {"level":2,"placeholder":"Second Stop"} -->
<h2 class="wp-block-heading"></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"placeholder":"Continue your story..."} -->
<p></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:column -->

<!-- wp:column {"width":"40%","className":"pathway-map-column"} -->
<div class="wp-block-column pathway-map-column" style="flex-basis:40%">

<!-- wp:pathway/map-gpx /-->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->';
