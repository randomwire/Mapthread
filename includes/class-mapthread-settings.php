<?php
/**
 * Settings page for Mapthread plugin
 *
 * @package Mapthread
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mapthread Settings class
 */
class Mapthread_Settings {

	/**
	 * Option name in wp_options table.
	 */
	const OPTION_NAME = 'mapthread_options';

	/**
	 * Settings group name.
	 */
	const SETTINGS_GROUP = 'mapthread_settings';

	/**
	 * Provider definitions with URL templates, key parameter names, and available styles.
	 *
	 * @var array
	 */
	private $providers = array(
		'mapbox'        => array(
			'label'       => 'Mapbox',
			'website'     => 'https://www.mapbox.com/',
			'url'         => 'https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token={key}',
			'key_param'   => 'access_token',
			'attribution' => '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			'max_zoom'    => 22,
			'styles'      => array(
				'streets-v12'          => 'Streets',
				'outdoors-v12'         => 'Outdoors',
				'light-v11'            => 'Light',
				'dark-v11'             => 'Dark',
				'satellite-v9'         => 'Satellite',
				'satellite-streets-v12' => 'Satellite Streets',
			),
		),
		'thunderforest' => array(
			'label'       => 'Thunderforest',
			'website'     => 'https://www.thunderforest.com/',
			'url'         => 'https://tile.thunderforest.com/{style}/{z}/{x}/{y}.png?apikey={key}',
			'key_param'   => 'apikey',
			'attribution' => 'Maps &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			'max_zoom'    => 22,
			'styles'      => array(
				'cycle'         => 'OpenCycleMap',
				'transport'     => 'Transport',
				'landscape'     => 'Landscape',
				'outdoors'      => 'Outdoors',
				'atlas'         => 'Atlas',
				'pioneer'       => 'Pioneer',
				'neighbourhood' => 'Neighbourhood',
			),
		),
		'jawgmaps'      => array(
			'label'       => 'JawgMaps',
			'website'     => 'https://www.jawg.io/en/',
			'url'         => 'https://tile.jawg.io/{style}/{z}/{x}/{y}{r}.png?access-token={key}',
			'key_param'   => 'access-token',
			'attribution' => '&copy; <a href="https://www.jawg.io/">JawgMaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			'max_zoom'    => 22,
			'styles'      => array(
				'jawg-streets' => 'Streets',
				'jawg-sunny'   => 'Sunny',
				'jawg-terrain' => 'Terrain',
				'jawg-dark'    => 'Dark',
				'jawg-light'   => 'Light',
			),
		),
		'stadiamaps'    => array(
			'label'       => 'Stadia Maps',
			'website'     => 'https://stadiamaps.com/',
			'url'         => 'https://tiles.stadiamaps.com/tiles/{style}/{z}/{x}/{y}{r}.png?api_key={key}',
			'key_param'   => 'api_key',
			'attribution' => '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			'max_zoom'    => 20,
			'styles'      => array(
				'alidade_smooth'      => 'Alidade Smooth',
				'alidade_smooth_dark' => 'Alidade Smooth Dark',
				'alidade_satellite'   => 'Alidade Satellite',
				'outdoors'            => 'Outdoors',
				'osm_bright'          => 'OSM Bright',
				'stamen_toner'        => 'Stamen Toner',
				'stamen_terrain'      => 'Stamen Terrain',
				'stamen_watercolor'   => 'Stamen Watercolor',
			),
		),
	);

	/**
	 * Run the settings.
	 */
	public function run() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_settings_scripts' ) );
	}

	/**
	 * Enqueue settings page scripts.
	 *
	 * @param string $hook The current admin page hook suffix.
	 */
	public function enqueue_settings_scripts( $hook ) {
		if ( 'settings_page_mapthread' !== $hook ) {
			return;
		}
		wp_enqueue_script(
			'mapthread-settings',
			MAPTHREAD_PLUGIN_URL . 'includes/js/mapthread-settings.js',
			array(),
			MAPTHREAD_VERSION,
			true
		);
	}

	/**
	 * Add settings page under Settings menu.
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Mapthread Settings', 'mapthread' ),
			__( 'Mapthread', 'mapthread' ),
			'manage_options',
			'mapthread',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_NAME,
			array( 'sanitize_callback' => array( $this, 'sanitize_options' ) )
		);

		// Free layers section.
		add_settings_section(
			'mapthread_free_layers',
			__( 'Free Map Providers', 'mapthread' ),
			array( $this, 'render_free_layers_section' ),
			'mapthread'
		);

		add_settings_field(
			'mapthread_free_layers_field',
			__( 'Available Layers', 'mapthread' ),
			array( $this, 'render_free_layers_field' ),
			'mapthread',
			'mapthread_free_layers'
		);

		// Provider sections.
		foreach ( $this->providers as $provider_id => $provider ) {
			add_settings_section(
				'mapthread_' . $provider_id,
				sprintf(
					'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
					esc_url( $provider['website'] ),
					esc_html( $provider['label'] )
				),
				'__return_empty_string',
				'mapthread'
			);

			add_settings_field(
				'mapthread_' . $provider_id . '_api_key',
				__( 'API Key', 'mapthread' ),
				array( $this, 'render_api_key_field' ),
				'mapthread',
				'mapthread_' . $provider_id,
				array( 'provider_id' => $provider_id )
			);

			add_settings_field(
				'mapthread_' . $provider_id . '_styles',
				__( 'Map Styles', 'mapthread' ),
				array( $this, 'render_styles_field' ),
				'mapthread',
				'mapthread_' . $provider_id,
				array(
					'provider_id' => $provider_id,
					'styles'      => $provider['styles'],
				)
			);
		}
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<p><?php esc_html_e( 'Configure which map tile providers and styles are available in the Mapthread layers dropdown. Add an API key for a provider, then select the styles you want to offer your readers.', 'mapthread' ); ?></p>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::SETTINGS_GROUP );
				do_settings_sections( 'mapthread' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render free layers section description.
	 */
	public function render_free_layers_section() {
		echo '<p>' . esc_html__( 'Street Map (OpenStreetMap) is always available as the default fallback layer.', 'mapthread' ) . '</p>';
	}

	/**
	 * Render free layers checkboxes.
	 */
	public function render_free_layers_field() {
		$options = get_option( self::OPTION_NAME, array() );
		$free    = isset( $options['free_layers'] ) ? $options['free_layers'] : array();

		$satellite_checked   = isset( $free['satellite'] ) ? $free['satellite'] : true;
		$topographic_checked = isset( $free['topographic'] ) ? $free['topographic'] : true;

		?>
		<label>
			<input type="checkbox" checked="checked" disabled="disabled" />
			Street Map (<a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>)
		</label>
		<br />
		<label>
			<input type="checkbox"
				name="<?php echo esc_attr( self::OPTION_NAME ); ?>[free_layers][satellite]"
				value="1"
				<?php checked( $satellite_checked ); ?> />
			Satellite View (<a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>)
		</label>
		<br />
		<label>
			<input type="checkbox"
				name="<?php echo esc_attr( self::OPTION_NAME ); ?>[free_layers][topographic]"
				value="1"
				<?php checked( $topographic_checked ); ?> />
			Topographic Map (<a href="https://opentopomap.org/" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>)
		</label>
		<?php
	}

	/**
	 * Render API key input field.
	 *
	 * @param array $args Field arguments with provider_id.
	 */
	public function render_api_key_field( $args ) {
		$provider_id = $args['provider_id'];
		$options     = get_option( self::OPTION_NAME, array() );
		$api_key     = isset( $options[ $provider_id ]['api_key'] ) ? $options[ $provider_id ]['api_key'] : '';

		printf(
			'<input type="text" class="regular-text mapthread-api-key" name="%s[%s][api_key]" value="%s" autocomplete="off" data-provider="%s" />',
			esc_attr( self::OPTION_NAME ),
			esc_attr( $provider_id ),
			esc_attr( $api_key ),
			esc_attr( $provider_id )
		);
	}

	/**
	 * Render style checkboxes for a provider.
	 *
	 * @param array $args Field arguments with provider_id and styles.
	 */
	public function render_styles_field( $args ) {
		$provider_id = $args['provider_id'];
		$styles      = $args['styles'];
		$options     = get_option( self::OPTION_NAME, array() );
		$api_key     = isset( $options[ $provider_id ]['api_key'] ) ? $options[ $provider_id ]['api_key'] : '';
		$saved       = isset( $options[ $provider_id ]['styles'] ) ? $options[ $provider_id ]['styles'] : array();
		$disabled    = empty( $api_key );

		echo '<div class="mapthread-styles-group" data-provider="' . esc_attr( $provider_id ) . '">';

		foreach ( $styles as $style_slug => $style_label ) {
			$checked = isset( $saved[ $style_slug ] ) ? $saved[ $style_slug ] : false;
			$name    = sprintf( '%s[%s][styles][%s]', self::OPTION_NAME, $provider_id, $style_slug );
			?>
			<label>
				<input type="checkbox"
					name="<?php echo esc_attr( $name ); ?>"
					value="1"
					<?php checked( $checked ); ?>
					<?php disabled( $disabled ); ?> />
				<?php echo esc_html( $style_label ); ?>
			</label>
			<br />
			<?php
		}

		echo '</div>';
	}

	/**
	 * Sanitize options on save.
	 *
	 * @param array $input Raw input from the form.
	 * @return array Sanitized options.
	 */
	public function sanitize_options( $input ) {
		$sanitized = array();

		// Free layers.
		$sanitized['free_layers'] = array(
			'satellite'   => ! empty( $input['free_layers']['satellite'] ),
			'topographic' => ! empty( $input['free_layers']['topographic'] ),
		);

		// Providers.
		foreach ( array_keys( $this->providers ) as $provider_id ) {
			$sanitized[ $provider_id ] = array(
				'api_key' => isset( $input[ $provider_id ]['api_key'] )
					? sanitize_text_field( $input[ $provider_id ]['api_key'] )
					: '',
				'styles'  => array(),
			);

			foreach ( array_keys( $this->providers[ $provider_id ]['styles'] ) as $style_slug ) {
				$sanitized[ $provider_id ]['styles'][ $style_slug ] =
					! empty( $input[ $provider_id ]['styles'][ $style_slug ] );
			}
		}

		return $sanitized;
	}

	/**
	 * Get the provider definitions.
	 *
	 * @return array Provider definitions.
	 */
	public function get_providers() {
		return $this->providers;
	}

	/**
	 * Build the layers configuration array for frontend/editor use.
	 *
	 * @return array Layers config with free layers and active provider layers.
	 */
	public function get_layers_config() {
		$options = get_option( self::OPTION_NAME, array() );
		$config  = array();

		// Free layers (Street is always on, not included here).
		$config['free'] = array(
			'satellite'   => isset( $options['free_layers']['satellite'] ) ? $options['free_layers']['satellite'] : true,
			'topographic' => isset( $options['free_layers']['topographic'] ) ? $options['free_layers']['topographic'] : true,
		);

		// Providers — only include those with a non-empty API key and at least one enabled style.
		foreach ( $this->providers as $provider_id => $provider ) {
			$api_key = isset( $options[ $provider_id ]['api_key'] ) ? $options[ $provider_id ]['api_key'] : '';
			if ( empty( $api_key ) ) {
				continue;
			}

			$enabled_styles = array();
			$saved_styles   = isset( $options[ $provider_id ]['styles'] ) ? $options[ $provider_id ]['styles'] : array();
			foreach ( $saved_styles as $style_slug => $is_enabled ) {
				if ( $is_enabled && isset( $provider['styles'][ $style_slug ] ) ) {
					$enabled_styles[] = $style_slug;
				}
			}

			if ( empty( $enabled_styles ) ) {
				continue;
			}

			$config[ $provider_id ] = array(
				'apiKey'      => $api_key,
				'url'         => $provider['url'],
				'attribution' => $provider['attribution'],
				'maxZoom'     => $provider['max_zoom'],
				'label'       => $provider['label'],
				'styles'      => $enabled_styles,
				'styleLabels' => array(),
			);

			foreach ( $enabled_styles as $slug ) {
				$config[ $provider_id ]['styleLabels'][ $slug ] = $provider['styles'][ $slug ];
			}
		}

		return $config;
	}

	/**
	 * Build a flat list of available layer names for use in the block editor.
	 *
	 * @return array Array of [ 'value' => 'layer_key', 'label' => 'Display Name' ].
	 */
	public function get_available_layer_options() {
		$layers_config = $this->get_layers_config();
		$options       = array();

		// Street is always first.
		$options[] = array(
			'value' => 'Street',
			'label' => __( 'Street Map', 'mapthread' ),
		);

		// Optional free layers.
		if ( ! empty( $layers_config['free']['satellite'] ) ) {
			$options[] = array(
				'value' => 'Satellite',
				'label' => __( 'Satellite View', 'mapthread' ),
			);
		}
		if ( ! empty( $layers_config['free']['topographic'] ) ) {
			$options[] = array(
				'value' => 'Topographic',
				'label' => __( 'Topographic Map', 'mapthread' ),
			);
		}

		// Provider layers.
		foreach ( $layers_config as $provider_id => $provider_config ) {
			if ( 'free' === $provider_id ) {
				continue;
			}
			foreach ( $provider_config['styles'] as $style_slug ) {
				$style_label = $provider_config['styleLabels'][ $style_slug ];
				$options[]   = array(
					'value' => $provider_config['label'] . ' ' . $style_label,
					'label' => $provider_config['label'] . ' ' . $style_label,
				);
			}
		}

		return $options;
	}
}
