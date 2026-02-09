const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Read version from pathway.php
const pluginFile = fs.readFileSync('pathway.php', 'utf8');
const versionMatch = pluginFile.match(/Version:\s+(\d+\.\d+\.\d+)/);
const version = versionMatch ? versionMatch[1] : '1.0.0';

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Output file path
const outputPath = path.join(distDir, `pathway-${version}.zip`);
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

// Listen for completion
output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✓ Package created: pathway-${version}.zip (${sizeInMB} MB)`);
    console.log(`✓ Location: dist/pathway-${version}.zip`);
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
        .map(pattern => {
            // Remove trailing slash for consistent handling
            const cleanPattern = pattern.replace(/\/$/, '');

            // Convert .distignore patterns to glob patterns
            // If pattern doesn't contain wildcards, add ** to match directory contents
            if (!cleanPattern.includes('*')) {
                return `**/${cleanPattern}/**`;
            }
            return cleanPattern;
        });

    // Add exact matches for top-level files/dirs
    const topLevel = distignore
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && !line.includes('/'))
        .map(pattern => pattern.replace(/\/$/, '')); // Remove trailing slash

    ignorePatterns = [...topLevel, ...ignorePatterns];
}

// Add files to archive
console.log('Creating distribution package...');
console.log(`Building pathway-${version}.zip...`);
console.log('Excluding:', ignorePatterns.slice(0, 10).join(', '), '...');

// Add all files except those in .distignore
archive.glob('**/*', {
    cwd: __dirname + '/..',
    ignore: ignorePatterns,
    dot: false // Don't include hidden files by default
});

// Finalize the archive
archive.finalize();
