# PRD: WordPress.org Review Fixes (Round 2)

## Context

WordPress.org plugin reviewers flagged three compliance issues in their second review round. This PRD documents the fixes applied in v1.5.5.

---

## Issue 1: No Publicly Documented Resource for Compiled Content

**Reviewer complaint:** The distributed plugin ships only minified JS/CSS in `build/` with no link to the human-readable source.

**Root cause:** `.distignore` excludes `assets/js/` and `assets/css/` from the distribution ZIP, and the readme didn't reference the GitHub repository for source access.

### Fix

Added a `== Source Code & Build Instructions ==` section to `readme.txt` with:
- Link to the public GitHub repository
- Step-by-step build instructions (`npm install` → `npm run build`)
- Explanation that `@wordpress/scripts` (webpack) compiles source to `build/`

### User Story

As a plugin reviewer or developer, I can find the source code link in the readme and follow the build instructions to compile the plugin from source, so I can review the human-readable code.

---

## Issue 2: Inline `<script>` Instead of `wp_enqueue_script`

**Reviewer complaint:** `includes/class-mapthread-settings.php` contained a raw `<script>` tag instead of using WordPress enqueue functions.

**Root cause:** A small toggle script (enable/disable style checkboxes based on API key presence) was written inline in the `render_settings_page()` method.

### Fix

1. Extracted the inline script to `includes/js/mapthread-settings.js`
2. Added `admin_enqueue_scripts` hook in the `run()` method
3. New `enqueue_settings_scripts()` method enqueues the script only on `settings_page_mapthread`
4. Removed the inline `<script>` block from `render_settings_page()`

**Why `includes/js/` not `assets/js/`:** The `.distignore` excludes `assets/js` entirely (those are webpack source files). `includes/js/` ships in the distribution without exceptions.

### User Story

As a WordPress admin visiting Settings > Mapthread, the API key / checkbox toggle behavior works identically to before, but the JavaScript is now loaded via `wp_enqueue_script()` per WordPress coding standards.

---

## Issue 3: Undocumented External Service Domains

**Reviewer complaint:** Two specific gaps:
- `server.arcgisonline.com` (Esri) — domain not found in readme by automated scanner
- `api.open-elevation.com` — mentioned but missing terms/privacy links

**Root cause:** The Esri section documented the service but not the exact tile domain. Open-Elevation is an open-source project with no formal ToS page, so only the homepage and GitHub were linked.

### Fix

1. **Esri section:** Added explicit `Service URL: https://server.arcgisonline.com/...` line
2. **Open-Elevation section:** Added explicit `Service URL: https://api.open-elevation.com/...`, `Terms of Use` (MIT license link), and `Privacy` description noting it's open-source with no user accounts

### User Story

As a plugin reviewer running an automated domain scanner, all external domains referenced in the compiled JS are now explicitly documented in the readme with terms of use and privacy links.

---

## Files Modified

| File | Change |
|------|--------|
| `readme.txt` | Added source code section, Esri service URL, Open-Elevation terms/privacy, version bump, changelog |
| `includes/class-mapthread-settings.php` | Added enqueue hook + method, removed inline script |
| `includes/js/mapthread-settings.js` | New file — extracted settings toggle logic |
| `mapthread.php` | Version bump to 1.5.5 |
| `package.json` | Version bump to 1.5.5 |
| `CHANGELOG.md` | Added 1.5.5 entry |

## Verification

- [x] `npm run build` — succeeds without errors
- [x] `npm run package` — creates `dist/mapthread-1.5.5.zip`
- [x] ZIP contains `includes/js/mapthread-settings.js`
- [x] No `<script>` tags remain in any PHP file
- [x] All external domains in compiled JS are documented in readme with terms/privacy links
