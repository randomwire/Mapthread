const defaultConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...defaultConfig,
	{
		ignores: [ 'mapthread-svn/**', 'dist/**' ],
	},
	{
		files: [ 'scripts/**/*.js', 'webpack.config.js' ],
		rules: {
			'no-console': 'off',
			'import/no-extraneous-dependencies': 'off',
		},
	},
	{
		files: [ 'includes/blocks/**/*.js', 'assets/js/**/*.js' ],
		languageOptions: {
			globals: {
				mapthreadConfig: 'readonly',
				DOMParser: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
			},
		},
		rules: {
			// @wordpress/* packages are script handles provided by WordPress
			// at runtime via DependencyExtractionWebpackPlugin, not bundled
			// npm deps.
			'import/no-unresolved': [ 'error', { ignore: [ '^@wordpress/' ] } ],
			'import/no-extraneous-dependencies': 'off',
			// JSDoc type annotations are not enforced in this codebase.
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-returns-description': 'off',
			'jsdoc/valid-types': 'off',
			// Allow console.warn/error for runtime diagnostics; still flag log.
			'no-console': [ 'error', { allow: [ 'warn', 'error' ] } ],
		},
	},
];
