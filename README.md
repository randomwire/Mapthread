# Pathway

Interactive map-based storytelling for WordPress.

## Description

Pathway enables content creators to combine narratives with interactive maps. Upload a GPX track, add markers to your story, and let readers follow along as the map pans and zooms automatically.

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Block theme (not classic theme)

## Development

### Setup

```bash
npm install
npm run build
```

### Testing

Symlink to Local WordPress installation:

```bash
ln -s /Users/davidgilbert/Github/Pathways ~/Local\ Sites/testsite/app/public/wp-content/plugins/pathway
```

### Build

- `npm run build` - Production build
- `npm run start` - Development build with watch
- `npm run lint:js` - Lint JavaScript
- `npm run format` - Format code

## Target Themes

- Twenty Twenty-Four
- Twenty Twenty-Five

## License

GPL v2 or later
