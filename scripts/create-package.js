const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Read version from mapthread.php
const pluginFile = fs.readFileSync('mapthread.php', 'utf8');
const versionMatch = pluginFile.match(/Version:\s+(\d+\.\d+\.\d+)/);
const version = versionMatch ? versionMatch[1] : '1.0.0';

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Output file path
const outputPath = path.join(distDir, `mapthread-${version}.zip`);
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

// Listen for completion
output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✓ Package created: mapthread-${version}.zip (${sizeInMB} MB)`);
    console.log(`✓ Location: dist/mapthread-${version}.zip`);
    console.log('✓ Ready for distribution!');
});

// Handle errors
archive.on('error', (err) => {
    throw err;
});

// Pipe archive to output file
archive.pipe(output);

// Read .distignore patterns
let ignorePatterns = [];
if (fs.existsSync('.distignore')) {
    const distignore = fs.readFileSync('.distignore', 'utf8');
    ignorePatterns = distignore
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .flatMap(pattern => {
            // Remove trailing slash for consistent handling
            const cleanPattern = pattern.replace(/\/$/, '');

            if (cleanPattern.includes('*')) {
                // Already a glob — use as-is
                return [cleanPattern];
            }
            if (cleanPattern.includes('/')) {
                // Subpath like "assets/icon.svg" or "assets/js":
                // - exact path matches a file
                // - path/** matches directory contents
                return [cleanPattern, `${cleanPattern}/**`];
            }
            // Top-level name like "node_modules":
            // - exact match for top-level
            // - **/<name>/** matches it anywhere in the tree
            return [cleanPattern, `**/${cleanPattern}/**`];
        });
}

// Add files to archive
console.log('Creating distribution package...');
console.log(`Building mapthread-${version}.zip...`);
console.log('Excluding:', ignorePatterns.slice(0, 10).join(', '), '...');

// Add all files inside a mapthread/ directory so WordPress recognises the ZIP
// as an update to the installed 'mapthread' plugin rather than a new install.
archive.glob('**/*', {
    cwd: __dirname + '/..',
    ignore: ignorePatterns,
    dot: false // Don't include hidden files by default
}, { prefix: 'mapthread' });

// Finalize the archive
archive.finalize();
