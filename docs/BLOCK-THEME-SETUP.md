# Block Theme Setup Guide

This guide shows you how to properly integrate Mapthread maps into your block theme for the best results.

---

## Overview

Mapthread works in two ways:

1. **Automatic Layout (Default)** - Plugin CSS creates a fixed map on the right
2. **Manual Layout (Recommended)** - You control the layout using WordPress blocks

The manual approach gives you full control and works with any block theme.

---

## Manual Setup with Columns Block

**If you want to customize from scratch:**

#### Desktop Layout (2 Columns)

1. **Add a Columns block** (2 columns)
2. **Left column (Story):**
   - Width: 60%
   - Add your content here
   - Insert Map Marker blocks between paragraphs
3. **Right column (Map):**
   - Width: 40%
   - Position: Sticky
   - Top: 20px
   - Add the Map GPX block here

#### Column Settings

**Left Column:**
- Select the column
- Sidebar > Width > 60%
- Add padding if desired (e.g., 2rem right padding)

**Right Column:**
- Select the column
- Sidebar > Width > 40%
- Advanced > Additional CSS class > `mapthread-map-column`
- (Plugin CSS will make this sticky automatically)

**OR set in Custom CSS:**
```css
.mapthread-map-column {
    position: sticky;
    top: 20px;
    height: calc(100vh - 40px);
}
```

#### Mobile Layout

The Columns block automatically stacks on mobile. To optimize:

1. Select the Columns block
2. Settings > Mobile > Stack on mobile (checked)
3. Map will appear at top on mobile devices

---

### Method 3: Use Row/Stack Blocks (Alternative)

Some block themes use Row/Stack instead of Columns:

1. **Add a Row block**
2. **Set layout to Grid:**
   - Columns: 2
   - Gap: 2rem
3. **First cell (Story):**
   - Add your content and markers
4. **Second cell (Map):**
   - Add Map GPX block
   - Set to sticky (see CSS above)

---

## Example: Twenty Twenty-Five Theme

### Using the Post Template Editor

1. **Go to:** Appearance > Editor > Templates > Single Post
2. **Find the content area** (usually a Group or Post Content block)
3. **Replace with Columns block:**
   - 2 columns (60/40 split)
   - Left: Post Content block
   - Right: Leave empty (Map GPX will go here)
4. **Save template**

Now when you create posts:
- Write your story in the post editor as normal
- The Map GPX block will automatically appear in the right column
- Add Map Marker blocks throughout your content

### Template Code

If you prefer to edit code directly, here's the template structure:

```html
<!-- wp:columns {"style":{"spacing":{"gap":"2rem"}}} -->
<div class="wp-block-columns" style="gap:2rem">

    <!-- wp:column {"width":"60%"} -->
    <div class="wp-block-column" style="flex-basis:60%">
        <!-- wp:post-content /-->
    </div>
    <!-- /wp:column -->

    <!-- wp:column {"width":"40%","className":"mapthread-map-column"} -->
    <div class="wp-block-column mapthread-map-column" style="flex-basis:40%">
        <!-- Map GPX block will be inserted here by user -->
    </div>
    <!-- /wp:column -->

</div>
<!-- /wp:columns -->
```

---

## CSS Customization

### Making the Map Sticky

Add this to your theme's Custom CSS:

```css
/* Make map column sticky on desktop */
@media (min-width: 768px) {
    .mapthread-map-column {
        position: sticky;
        top: 20px;
        align-self: start;
    }

    .mapthread-map-column #mapthread-map {
        height: calc(100vh - 40px);
        max-height: 900px;
    }
}

/* Full width map on mobile */
@media (max-width: 767px) {
    .mapthread-map-column {
        position: sticky;
        top: 0;
    }

    .mapthread-map-column #mapthread-map {
        height: 35vh;
        min-height: 280px;
    }
}
```

### Adjusting Column Ratio

Want a different split? Change the column widths:

**50/50 split:**
- Left: 50%
- Right: 50%

**70/30 split (more story space):**
- Left: 70%
- Right: 30%

**Narrow content with wide map:**
- Left: 40%
- Right: 60%

---

## Troubleshooting

### Map not sticky
- Check that you added the `mapthread-map-column` class
- Verify the Custom CSS was added
- Ensure no parent has `overflow: hidden`

### Columns not side-by-side
- Check screen width (columns stack below 768px by default)
- Verify Columns block is set to 2 columns
- Check "Stack on mobile" setting

### Map too tall/short
- Adjust `max-height` in Custom CSS
- Default is `calc(100vh - 40px)` (full viewport minus padding)
- Try: `600px`, `800px`, or `90vh`

### Content overlapping
- Add padding to left column (e.g., 2rem right padding)
- Increase gap between columns (2rem recommended)

---

## Advanced: Template Parts

For reusable layouts across multiple posts:

1. **Create a Template Part:**
   - Appearance > Editor > Patterns > Create Pattern
   - Choose "Synced" pattern
   - Name: "Mapthread Two Column Layout"

2. **Design your layout** with Columns block

3. **Save as synced pattern**

4. **Insert in posts:**
   - Block inserter > Patterns > Your pattern name
   - Layout applies instantly

---

## Why Manual Setup?

**Control:**
- Choose your own column widths
- Customize spacing and padding
- Adjust for your theme's design

**Flexibility:**
- Works with any block theme
- No CSS conflicts
- Easy to modify

**WordPress Way:**
- Uses native blocks
- Respects theme design
- Future-proof

---

## Support

Need help? Check:
- [WordPress Support Forum](https://wordpress.org/support/plugin/mapthread/)
- [GitHub Issues](https://github.com/yourusername/mapthread/issues)
