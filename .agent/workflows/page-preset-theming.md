---
description: How to create and update page preset theming (colors, buttons, surfaces)
---

# Page Preset Theming Workflow

## Core Principle
**The preset file is the SINGLE SOURCE OF TRUTH for all colors.** CSS files should ONLY consume variables via `var(--*)`, never define them.

---

## File Structure

### Preset Files (Source of Truth)
Location: `src/config/presets/{page}.presets.ts`

Canonical examples:
- `storm.presets.ts` - Full-featured dashboard with charts
- `gallery.presets.ts` - Grid page with navigation
- `weather.presets.ts` - Dashboard with charts and cards

### CSS Files (Consumers Only)
Location: Component CSS files reference variables via `var(--variable-name)`

**IMPORTANT:** CSS files should NOT define CSS variables. If you see a CSS file with variable definitions like:
```css
.component {
    --prefix-accent: #hex;  /* ❌ BAD - defining variables */
}
```
This is legacy code that needs refactoring. Move these to the preset file.

---

## Variable Naming Convention

### Standard Categories (use across all pages)
```typescript
// Background
'--bg': 'linear-gradient(...)'      // Page background
'--bg-surface': 'rgba(...)'         // Section backgrounds

// Core colors
'--accent': '#hex'                  // Primary accent
'--accent-hover': '#hex'            // Accent on hover
'--accent-glow': 'rgba(...)'        // Glow effects
'--accent-subtle': 'rgba(...)'      // Subtle backgrounds

// Text
'--text': '#hex'                    // Primary text
'--text-secondary': '#hex'          // Muted/secondary text

// Surfaces
'--card-bg': 'rgba(...)'            // Card backgrounds
'--card-bg-hover': 'rgba(...)'      // Card hover state
'--surface-hover': 'rgba(...)'      // Generic hover

// Borders
'--border': 'rgba(...)'             // Standard borders

// Navigation (for pages with navbars)
'--nav-bg': 'rgba(...)'             // Navbar background
'--nav-border': 'rgba(...)'         // Navbar border
'--footer-bg': '#hex'               // Footer background
'--footer-border': '#hex'           // Footer border

// Buttons
'--button-theme-toggle-bg': 'rgba(...)'   // Theme toggle background
'--button-theme-toggle-icon': '#hex'      // Theme toggle icon color
```

### Optional Categories (as needed)

```typescript
// Alert (for dashboards)
'--alert-bg': 'rgba(...)'
'--alert-border': 'rgba(...)'
'--alert-text': '#hex'
'--alert-text-strong': '#hex'

// Charts (for pages with Recharts)
'--chart-grid': '#hex'              // Grid line color
'--chart-axis': '#hex'              // Axis label color
'--chart-tooltip-bg': '#hex'        // Tooltip background
'--chart-line': '#hex'              // Primary line/point color
'--chart-line-glow': 'rgba(...)'    // Gradient glow

// Mode Toggle Buttons (for dashboards)
'--button-toggle-active-text': '#hex'
'--button-toggle-active-border': '#hex'
'--button-clear-text': '#hex'
'--button-clear-border': 'rgba(...)'
'--button-clear-bg-hover': 'rgba(...)'

// Page-Specific (gradients, widgets, etc.)
'--gradient-day': 'radial-gradient(...)'
'--gradient-night': 'radial-gradient(...)'
```

---

## Rules

### ✅ DO
1. Add new color variables to the preset file FIRST
2. Use semantic variable names (`--button-clear-text`, not `--orange-text`)
3. Create light AND dark variants for each preset
4. Group related variables with comments
5. Reference variables in CSS with `var(--name)`
6. Remove CSS variable definitions when refactoring legacy code

### ❌ DON'T
1. Never hardcode hex/rgb colors in CSS files
2. Never define CSS variables in CSS files (presets are the source of truth)
3. Never "borrow" variables from unrelated categories
4. Never edit CSS to use a different variable - update the preset instead

---

## Adding a New Page Preset

1. Create `src/config/presets/{page}.presets.ts`
2. Copy structure from `storm.presets.ts` or `gallery.presets.ts`
3. Define both `default` and `defaultDark` variants minimum
4. Register in `src/config/presets/index.ts`
5. Use `useApplyPreset('{page}')` hook in the page component
6. If using ItemGrid, set `themeVariant: 'preset' as const` in config

---

## ThemeToggle Integration

### For Dashboards (custom layouts)
Add directly to the component:
```tsx
<ThemeToggle variant="preset" />
```

### For Grid Pages (using ItemGrid)
Set in the config object:
```tsx
const config = {
    // ...
    themeVariant: 'preset' as const,  // ← This enables preset-aware ThemeToggle
};
```

Both read from:
- `--button-theme-toggle-bg`
- `--button-theme-toggle-icon`

---

## Charts Integration

For Recharts components, use the `useChartTheme` hook:

```tsx
import { useChartTheme } from '../hooks/useChartTheme';

const MyChart = ({ isDarkMode }) => {
    const chartTheme = useChartTheme(isDarkMode);
    
    return (
        <AreaChart>
            <CartesianGrid stroke={chartTheme.gridColor} />
            <XAxis stroke={chartTheme.axisColor} />
            <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg }} />
            <Area stroke={chartTheme.lineColor} />
        </AreaChart>
    );
};
```

Required preset variables:
- `--chart-grid`, `--chart-axis`, `--chart-tooltip-bg`, `--chart-line`, `--chart-line-glow`

---

## Refactoring Legacy CSS

When you encounter CSS files with variable definitions:

1. **Identify duplicates** - CSS defines variables that should be in presets
2. **Move to presets** - Add all variables to the preset file with standard names
3. **Update CSS** - Remove variable definitions, keep only the style rules
4. **Update component** - Set `themeVariant: 'preset'` if applicable

Before:
```css
.my-component {
    --my-accent: #hex;  /* ❌ Defining in CSS */
    color: var(--my-accent);
}
```

After:
```css
.my-component {
    color: var(--accent);  /* ✅ Using preset variable */
}
```

---

## Variable Granularity & Shared Colors

### When to Create New Variables
**Ask the user before proceeding** if:
1. A color change would affect multiple unrelated components
2. The user requests a specific color for one element that currently shares a variable

### Warning Signs
⚠️ If you find yourself wanting to use a variable from a different category to get the right color, STOP and:
1. Warn the user about the coupling
2. Propose creating a new dedicated variable
3. Update all preset variants with the new variable

---

## Checklist When Making Color Changes

- [ ] Identify which variable controls the color
- [ ] Update the variable in the preset file (not CSS)
- [ ] Update ALL preset variants (default, defaultDark, etc.)
- [ ] Verify CSS references `var(--variable-name)` (not hardcoded)
- [ ] Verify CSS does NOT define variables
- [ ] Test both light and dark modes
