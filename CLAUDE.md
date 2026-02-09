# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathways is a WordPress plugin that enables map-based storytelling. It connects narrative content (text, images, videos) to interactive maps showing routes/tracks and waypoints. Primary use cases include travel blogs, hiking journals, expedition documentation, and historical route visualization.

## Technical Stack

- **WordPress Plugin** for block themes only (not classic themes)
- **Gutenberg Block Editor** - all custom blocks use the WordPress block editor API
- **Leaflet.js** - interactive map display
- **Chart.js** - elevation profile visualization
- **OpenStreetMap** - map tiles and data
- **GPX files** - route/track data format

## Core Blocks

1. **Map GPX Block** - One per post/page, displays the uploaded GPX route
2. **Map Waypoint Block** - Multiple per post/page, marks GPS coordinates/addresses in story content

## Plugin Requirements

Must comply with wordpress.org plugin directory guidelines:
- https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/
- https://developer.wordpress.org/block-editor/

Inherit styling from WordPress/theme rather than providing custom styles where possible.

## Layout Behavior

**Desktop/Tablet**: Story content scrolls vertically on left, map displays on right (follows waypoints as story scrolls)

**Mobile**: Story takes full width, button in Map GPX block toggles fullscreen map overlay

## Map Interaction

- Initial load: shows entire path, oriented north
- On scroll: pans/zooms to center on waypoints as reader scrolls through story
- Clicking waypoint on map auto-scrolls story to corresponding content
- User can manually pan/zoom map, returns to follow mode on story scroll

## Development Workflow

This project uses an explore-then-implement pattern:

1. **Explore Phase** - Analyze codebase, identify dependencies/constraints, ask clarifying questions before implementation
2. **Execute Phase** - Implement with minimal, modular code following existing patterns; update tracking documents with progress
3. **Review Phase** - Code review checking: logging, error handling, TypeScript strictness, React hooks correctness, performance, security

## Inspiration References

- Koya Bound: https://walkkumano.com/koyabound/
- ArcGIS StoryMaps example: https://ucnz.maps.arcgis.com/apps/MapJournal/index.html?appid=0af109d093dd477faeb299fb26d3c7a8
