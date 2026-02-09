# Mapthread User Guide

A comprehensive guide to creating interactive map-based stories with Mapthread.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Map Story](#creating-your-first-map-story)
3. [Working with GPX Files](#working-with-gpx-files)
4. [Adding Map Markers](#adding-map-markers)
5. [Using Address Search](#using-address-search)
6. [Understanding the Layout](#understanding-the-layout)
7. [Tips for Great Map Stories](#tips-for-great-map-stories)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You Need

Before creating your first map story, ensure you have:

1. **Mapthread plugin installed and activated**
2. **A block theme** (Twenty Twenty-Four or Twenty Twenty-Five recommended)
3. **A GPX file** from your adventure (optional - see [Working with GPX Files](#working-with-gpx-files))
4. **Locations** for your story (use the built-in address search or your own coordinates)

### Quick Terminology

| Term | Description |
|------|-------------|
| **GPX File** | GPS data file containing your track/route |
| **Map GPX Block** | The WordPress block that displays your map and track |
| **Map Marker Block** | Numbered waypoints placed throughout your story |
| **Follow Mode** | When the map automatically pans/zooms as readers scroll |

---

## Creating Your First Map Story

### Step 1: Create a New Post

1. Go to **Posts > Add New** in WordPress admin
2. Give your post a title (e.g., "My Hiking Adventure")

### Step 2: Add the Map GPX Block (Optional)

If you have a GPX track to display:

1. Click the block inserter (+) or type `/map`
2. Select **Map GPX** from the block list
3. You'll see an empty block with an upload prompt

**Note:** The Map GPX block is optional! You can create map stories with just Map Marker blocks. The map will automatically show all your markers without needing a GPX track.

### Step 3: Upload Your GPX File (If Using)

1. Click **Media Library** in the Map GPX block
2. Upload your GPX file or select an existing one
3. The block will validate and display file information:
   - Number of track points
   - Geographic bounds
   - Any warnings or errors

**What you'll see after upload:**

```
GPX File: my-hike.gpx
Track Points: 2,847
Bounds: 51.4°N to 51.6°N, -0.2°W to 0.1°E
Status: Valid
```

### Step 4: Write Your Story with Markers

Now add your narrative content with Map Marker blocks at key locations:

1. **Add a paragraph** describing the start of your journey
2. **Insert a Map Marker block** (type `/map marker`)
3. **Configure the marker:**
   - Title: "Starting Point - Tower Bridge"
   - Address: Type "Tower Bridge, London" and select from suggestions
   - (Latitude/Longitude auto-fill from search)
   - Zoom Level: 15 (optional)
4. Continue writing and adding markers throughout your story

**Tip:** Use the Address field to search for any location - it will automatically fill in the coordinates for you!

### Step 5: Preview and Publish

1. Click **Preview** to see the map behavior
2. Scroll through to test the auto-following feature
3. When satisfied, click **Publish**

---

## Working with GPX Files

### What is a GPX File?

GPX (GPS Exchange Format) is a standard XML-based format for GPS data. It can contain:
- **Tracks** - Recorded paths from your GPS device (what Mapthread displays)
- **Waypoints** - Individual marked locations
- **Routes** - Planned paths between waypoints

Mapthread v1.0 displays **tracks** (`<trk>` elements) only.

### Where to Get GPX Files

**From Fitness Apps:**
- **Strava**: Activities > Export GPX
- **Garmin Connect**: Activity > Gear icon > Export to GPX
- **Komoot**: Tour > More > Download GPX

**From Hiking Apps:**
- **AllTrails**: Trail page > Download GPX (may require Pro)
- **Gaia GPS**: Export from saved hikes

**From GPS Devices:**
- Connect device to computer
- Navigate to GPX files folder
- Copy the file you want

**Creating GPX Files:**
- **Google Maps**: Use third-party tools like Maps to GPX
- **GPX Studio** (gpx.studio): Draw routes online and export

### GPX File Requirements

| Requirement | Value | Note |
|-------------|-------|------|
| File size | <10MB recommended | Larger files show warning |
| Track points | <50,000 recommended | More points may be slow |
| Format | GPX 1.0 or 1.1 | Standard XML format |
| Content | `<trk>` elements | Routes/waypoints not displayed |

### Validating Your GPX File

Before uploading, you can validate your GPX file:

1. **Online validators**: gpx.studio, gpxsee.org
2. **Desktop apps**: GPX See (cross-platform), GPS Visualizer
3. **Upload to Mapthread**: The block will show validation results

---

## Adding Map Markers

### Finding Coordinates

**Method 1: Address Search (Recommended)**
1. Type a location name in the Address field
2. Select from autocomplete suggestions
3. Coordinates auto-fill automatically!

**Method 2: Google Maps**
1. Go to Google Maps
2. Right-click on the location
3. Click the coordinates to copy them
4. Format: `51.5074, -0.1278` (Latitude, Longitude)

**Method 3: Your GPX File**
1. Open GPX file in a text editor
2. Find `<trkpt>` elements
3. Copy lat/lon attributes

**Method 4: GPS Apps**
1. Open your hiking/GPS app
2. Navigate to saved waypoints
3. Copy coordinates

### Map Marker Settings

| Setting | Required | Description |
|---------|----------|-------------|
| Title | No | Tooltip text shown on hover |
| Address | No | Search field - type to find locations and auto-fill coordinates |
| Latitude | Yes | Decimal degrees - auto-filled from address search |
| Longitude | Yes | Decimal degrees - auto-filled from address search |
| Zoom Level | No | Default: 14. Range: 1-18 |

### Coordinate Format

Always use **decimal degrees**, not degrees/minutes/seconds:

- **Correct**: `51.5074` / `-0.1278`
- **Incorrect**: `51°30'26.4"N` / `0°7'40.1"W`

To convert DMS to decimal:
- Degrees + (Minutes/60) + (Seconds/3600)
- Add negative sign for S (latitude) or W (longitude)

### Marker Numbering

Markers are automatically numbered based on their order in the content:
- First Map Marker block = Marker 1
- Second Map Marker block = Marker 2
- And so on...

To reorder markers, move the blocks in the editor.

### Distance Warnings

If a marker is more than 50km from your GPX track, you'll see a warning. This usually means:
- Coordinates are incorrect (typo or wrong format)
- The location isn't on this route
- You may have the coordinates reversed (lat/lon swapped)

---

## Using Address Search

The easiest way to add markers is using the built-in address search.

### How It Works

1. **Open the Map Marker block settings** (sidebar)
2. **Type in the Address field** - e.g., "Eiffel Tower, Paris"
3. **Wait for suggestions** - autocomplete appears after typing
4. **Click a result** - coordinates auto-fill and a map preview appears
5. **Done!** - The marker is ready to use

### What You Can Search

The address search uses OpenStreetMap data, so you can find:

- **Landmarks**: "Big Ben", "Statue of Liberty", "Sydney Opera House"
- **Addresses**: "221B Baker Street, London"
- **Cities/Towns**: "Edinburgh, Scotland"
- **Natural Features**: "Mount Fuji", "Grand Canyon"
- **Businesses**: "Starbucks Times Square" (when specific enough)

### Tips for Better Results

**Be specific:**
- "Tower Bridge, London" (good)
- "Tower Bridge" (may return multiple results)

**Include city/country for common names:**
- "Springfield, Illinois, USA"
- "Paris, France" vs "Paris, Texas"

**Use landmarks near your location:**
- If searching for a trailhead, try the nearby town name

### Map Preview

After selecting a location:
- A small map preview appears below the address field
- Shows a marker at the selected coordinates
- Helps verify you've selected the right place
- Preview uses OpenStreetMap tiles

### Manual Override

Even after using address search, you can:
- Edit the latitude/longitude manually
- Fine-tune coordinates for precision
- The address field keeps your search text for reference

---

## Understanding the Layout

### Desktop Layout (769px and wider)

```
+-------------------------+------------------+
|                         |                  |
|    Story Content        |    Sticky Map    |
|    (60% width)          |    (40% width)   |
|                         |                  |
|    [Text...]            |    [Map with     |
|    [Image]              |     track and    |
|    [Map Marker 1]       |     markers]     |
|    [More text...]       |                  |
|    [Map Marker 2]       |                  |
|                         |                  |
+-------------------------+------------------+
```

The map:
- Stays fixed while you scroll
- Pans/zooms to each marker as it enters view
- Shows the full track with numbered markers

### Mobile Layout (768px and narrower)

```
+-------------------------+
|    Sticky Map (30vh)    |
|    [Map with track]     |
+-------------------------+
|                         |
|    Story Content        |
|    (full width)         |
|                         |
|    [Text...]            |
|    [Map Marker 1]       |
|    [More text...]       |
|                         |
+-------------------------+
```

The map:
- Sticks to top of viewport (30% of screen height)
- Follows along as you scroll
- Touch-friendly interactions

### Follow Mode Behavior

**Normal scrolling:**
- Map follows automatically
- Pans and zooms to each marker
- Smooth 800ms transitions

**User interaction (touch/drag map):**
- Follow mode pauses
- User can explore the map freely
- "Resume following" button appears

**Resume following:**
- Click the button, or
- Keep scrolling past the current section
- Map returns to auto-follow

### Clicking Markers

When you click a numbered marker on the map:
- The story auto-scrolls to that section
- The marker becomes highlighted
- Great for non-linear exploration

---

## Tips for Great Map Stories

### Content Structure

**Start with context:**
```
Before we dive in, here's what this hike covers:
a 15-mile loop through the Lake District with
stunning views and challenging terrain.
```

**Place markers at meaningful moments:**
- Starting points
- Key landmarks or viewpoints
- Rest stops or interesting discoveries
- Challenging sections
- The destination/end point

**Vary your content:**
- Paragraphs of narrative
- Photos with captions
- Pull quotes for memorable moments
- Short video clips

### Marker Placement

**Good marker density:**
- One marker every few paragraphs
- ~5-15 markers for a typical blog post
- Avoid clustering markers too close together

**Meaningful locations:**
- Don't just mark arbitrary points
- Choose locations that matter to your story
- Give each marker a descriptive title

### Writing Style

**Be visual:**
> "The view from the summit stretched endlessly..."
> Better than: "We reached the top."

**Include sensory details:**
- What did you hear?
- How did it feel?
- What was the weather like?

**Share practical info:**
- Trail conditions
- Time estimates
- Difficulty ratings
- Tips for future hikers

### GPX Track Tips

**Clean your track:**
- Remove "noise" (GPS drift at stops)
- Trim start/end if needed
- Use tools like GPS Visualizer to clean

**Match markers to track:**
- Ensure markers are on or near the track
- Check for the distance warning in the editor

---

## Troubleshooting

### Map Not Appearing

**Check the basics:**
1. Is the Map GPX block present?
2. Is a GPX file uploaded and showing as valid?
3. Are there any errors in browser console (F12)?

**Try these fixes:**
1. Re-upload the GPX file
2. Clear browser cache and reload
3. Re-save the post in the editor
4. Deactivate other plugins temporarily

### GPX File Won't Upload

**Verify the file:**
1. Open in a text editor - should start with `<?xml` and contain `<gpx`
2. Check file extension is `.gpx`
3. Try opening in gpx.studio to validate

**Upload issues:**
1. Check WordPress media upload settings
2. Verify file size (<10MB recommended)
3. Ask host if GPX MIME type is allowed

### Markers Not Showing

**Coordinate issues:**
1. Verify format: decimal degrees, not DMS
2. Check for typos
3. Ensure lat/lon aren't swapped
4. Verify they're within reasonable bounds

**Block issues:**
1. Is the Map Marker block properly saved?
2. Try re-entering coordinates
3. Check that both lat and lon are filled in

### Layout Problems

**Wrong layout displaying:**
1. Verify you're using a block theme
2. Check browser width (desktop vs mobile layout)
3. Look for CSS conflicts from other plugins/theme

**Map in wrong position:**
1. Clear all browser caches
2. Check if custom CSS is interfering
3. Try with Twenty Twenty-Four theme

### Performance Issues

**Slow map loading:**
1. Reduce GPX file size (simplify track)
2. Check internet connection (tiles load from OpenStreetMap)
3. Clear sessionStorage cache

**Sluggish scrolling:**
1. Reduce number of track points
2. Check for browser extensions causing issues
3. Try in incognito mode

### Getting Help

If you can't solve the issue:

1. **Check browser console** (F12 > Console) for errors
2. **Note your environment:**
   - WordPress version
   - Theme name and version
   - Browser and version
   - Any error messages
3. **Open an issue** on GitHub with details
4. **Visit support forum** on WordPress.org

---

## Quick Reference Card

### Block Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Map GPX | `/map gpx` |
| Add Map Marker | `/map marker` |

### Address Search Tips

| Search | Example |
|--------|---------|
| Landmark | "Eiffel Tower, Paris" |
| Address | "1600 Pennsylvania Ave, Washington DC" |
| City | "Tokyo, Japan" |
| Natural feature | "Yosemite Valley" |

### Coordinate Quick Reference

| Location | Latitude | Longitude |
|----------|----------|-----------|
| London | 51.5074 | -0.1278 |
| New York | 40.7128 | -74.0060 |
| Sydney | -33.8688 | 151.2093 |
| Tokyo | 35.6762 | 139.6503 |

### Zoom Levels

| Level | View |
|-------|------|
| 1-5 | Continent/country |
| 6-10 | Region/city |
| 11-14 | Town/neighborhood |
| 15-18 | Street/building |

---

**Happy storytelling!**
