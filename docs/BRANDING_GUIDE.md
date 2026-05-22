# Zest — UI/UX Branding Guide

> Reference for all design decisions. Every visual change to the app must be consistent with this guide.

---

## 1. Brand Identity

| Property | Value |
|----------|-------|
| **App Name** | Zest |
| **Tagline** | Master your health with a professional-grade meal planning experience |
| **Personality** | Clean, confident, health-forward, data-driven — feels like a premium wellness coach, not a diet tracker |
| **Target User** | Health-conscious individuals who follow structured multi-week nutrition plans |
| **Tone** | Direct and motivating. No fluff. Data shown with purpose. |

### Brand Promise
Zest should feel like it's already on your side — it shows you exactly what to eat, what to buy, and what to cook, without overwhelming you. Every screen has one job and does it well.

---

## 2. Color System

### Primary Palette

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| **Emerald 500** | `emerald-500` | `#10B981` | Primary action color — CTAs, active states, hero headers, progress fills, checkboxes |
| **Emerald 600** | `emerald-600` | `#059669` | Pressed/active state of emerald-500 |
| **Emerald 50** | `emerald-50` | `#ECFDF5` | Tinted backgrounds for info callouts, kcal badges, recipe cards |
| **Emerald 100** | `emerald-100` | `#D1FAE5` | Subtle tag backgrounds, icon container fills |
| **Emerald 200** | `emerald-200` | `#A7F3D0` | Shadow tint for emerald surfaces (`shadow-emerald-200`) |

### Secondary Palette

| Name | Token | Hex | Usage |
|------|-------|-----|-------|
| **Indigo 500** | `indigo-500` | `#6366F1` | Secondary accent — stats cards, grocery list header, meal diversity, section-level accents |
| **Indigo 50** | `indigo-50` | `#EEF2FF` | Indigo tinted card backgrounds |
| **Indigo 100** | `indigo-100` | `#E0E7FF` | Icon containers with indigo icons |

### Semantic Palette

| Meaning | Token | Hex | Usage |
|---------|-------|-----|-------|
| **Warning / Tip** | `amber-50` / `amber-100` | `#FFFBEB` / `#FEF3C7` | Kitchen notes, tips & notes callout blocks |
| **Amber accent** | `amber-500` | `#F59E0B` | Cooking session "top-up" accent bar, warning icons |
| **Danger** | `rose-50` / `rose-500` | `#FFF1F2` / `#F43F5E` | Destructive actions (delete, reset), danger zones |
| **Info / Cook** | `sky-50` / `sky-700` | `#F0F9FF` / `#0369A1` | Storage type badges on cook items |
| **Dark Surface** | `gray-900` | `#111827` | Dark headers (Cook screen), dark CTA buttons (Close Profile) |
| **Orange** | `orange-500` | `#F97316` | Streak card, calorie fire icon |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-50` | `#F9FAFB` | Screen background |
| `gray-100` | `#F3F4F6` | Pill container backgrounds, subtle dividers |
| `gray-200` | `#E5E7EB` | Borders, input borders, unchecked toggle track |
| `gray-300` | `#D1D5DB` | Chevron icons, light text |
| `gray-400` | `#9CA3AF` | Secondary body text, placeholder text, inactive tab icons |
| `gray-500` | `#6B7280` | Label text, section headers |
| `gray-800` | `#1F2937` | Primary body content, list item text |
| `gray-900` | `#111827` | Headings, titles |
| `white` | `#FFFFFF` | Card surfaces, modal backgrounds, tab bar |

### Color Rules
- **Never** mix emerald and indigo on the same interactive element — they belong to different semantic roles (primary action vs. secondary accent).
- **Never** use raw hex values in JSX. Always use Tailwind tokens.
- **Always** pair a colored surface with its shadow tint (e.g., `shadow-emerald-200`, `shadow-indigo-200`).
- Danger actions (trash, reset) always use the `rose` palette — never gray or orange.
- Completed/done states use opacity (`opacity-40`, `opacity-60`) rather than a different color, preserving the original element's identity while signaling completion.

---

## 3. Typography

### Font System
The app uses the system default font (San Francisco on iOS, Roboto on Android). All weight and style control is via Tailwind font-weight classes.

### Scale & Usage

| Role | Classes | Notes |
|------|---------|-------|
| **Hero Title** | `text-5xl font-black tracking-tighter` | Splash screen only. "Zest" wordmark. |
| **Screen Title** | `text-3xl font-bold` or `text-3xl font-black tracking-tight` | Top of each tab screen. "Insights", "Settings", "Batch Cook". |
| **Section Heading** | `text-xl font-black` | Section titles within a screen. "Daily Blueprint", "Vitals & Lifestyle". |
| **Card Title** | `text-lg font-black` or `text-xl font-black` | Bold names in cards. Health profile stat values. |
| **List Item Primary** | `text-lg font-semibold` or `text-base font-bold` | Meal names, grocery item names. |
| **List Item Secondary** | `text-sm` or `text-xs text-gray-500` | Quantity, time, sub-labels. |
| **Section Label** | `text-[10px] font-black uppercase tracking-widest text-gray-400` | Category dividers, section headers within cards. The app's distinctive micro-label style. |
| **Metadata / Badge** | `text-[9px] font-bold uppercase tracking-wider` | Chips, tags, storage badges, method labels. |
| **Body Copy** | `text-base leading-relaxed text-gray-700` | Recipe notes, kitchen instructions, wellness notes. |
| **Caption** | `text-xs text-gray-400 font-medium` | Subtitles, time labels, "week 1 list" descriptors. |

### Typography Rules
- Headings on dark/colored surfaces use `text-white` or `text-emerald-100`, never a gray shade.
- **`font-black` is the strong emphasis weight** — use it for numbers, stats, and section labels.
- **Letter spacing** (`tracking-widest`, `tracking-wider`, `tracking-tighter`) is used intentionally:
  - `tracking-tight` / `tracking-tighter` → large hero numbers and titles (compact, powerful)
  - `tracking-widest` / `tracking-wider` → micro-labels and uppercase tags (airy, readable)
- Strikethrough (`textDecorationLine: 'line-through'`) combined with `opacity-40-60` signals completed items. Never use only one without the other.
- Line height: `leading-relaxed` for multi-line body copy; default for single-line UI labels.

---

## 4. Spacing & Layout

### Screen Structure
```
┌─────────────────────────────────────┐
│  Status bar clearance: pt-16        │  ← Always pt-16 at top of first element
│  Header / Hero                      │
│─────────────────────────────────────│
│  Content area                       │
│  px-4 or px-6 (horizontal padding)  │
│  gap between cards: mb-4 to mb-6    │
│                                     │
│  ...                                │
│                                     │
│  paddingBottom: 100–120             │  ← Always clear the floating tab bar
└─────────────────────────────────────┘
       [Floating Tab Bar — absolute]
```

### Core Spacing Tokens

| Purpose | Value |
|---------|-------|
| Screen horizontal padding | `px-4` (16px) or `px-6` (24px) |
| Screen top padding (below status bar) | `pt-16` (64px) |
| Card bottom margin | `mb-4` (16px) standard, `mb-6` (24px) between sections |
| Card inner padding | `p-4` (16px) compact, `p-5` (20px) standard, `p-6` (24px) spacious, `p-8` (32px) modal hero |
| List item vertical padding | `py-4` (16px) — generous touch targets |
| Icon container margin from text | `mr-3` (12px) or `mr-4` (16px) |
| Bottom scroll clearance | `paddingBottom: 100` to `paddingBottom: 120` |
| Section gap inside card | `mb-4` between sub-sections |

### Grid
- Two-column layouts use `flex-row gap-4` with `flex-1` on each child.
- Three-column stat rows use `flex-row gap-4` with `flex-1` on each child.
- Full-width elements always span the horizontal gutter (`px-4`/`px-6` context).

---

## 5. Border Radius System

The app uses a graduated radius system — larger = more prominent/interactive.

| Radius | Token | Usage |
|--------|-------|-------|
| `rounded-full` | 9999px | Circular elements: checkboxes, avatar containers, progress dots, FAB buttons, day picker items |
| `rounded-lg` | 8px | Small chips, week selector tabs, compact badges |
| `rounded-xl` | 12px | Input fields, small action buttons, notification badge backgrounds |
| `rounded-2xl` | 16px | Standard cards, meal cards, settings rows, buttons |
| `rounded-3xl` | 24px | Hero sections, modal drag handles, calendar strip container |
| `rounded-[28px]` | 28px | StatCard in health profile |
| `rounded-[32px]` | 32px | Large feature cards (stats screen, health profile metric cards) |
| `rounded-[40px]` | 40px | Bottom sheet modals, hero card in health profile |
| `rounded-[48px]` | 48px | Splash screen logo container |

**Rule:** The more a surface dominates the visual hierarchy, the larger its radius. Small utility elements (chips, tags) use small radii. Hero blocks and modals use the largest radii.

---

## 6. Elevation & Shadow

Shadows create depth hierarchy. The app uses a soft, modern shadow system.

| Level | Style | Usage |
|-------|-------|-------|
| **Flat** | `border border-gray-100` | Standard cards that shouldn't float (settings rows, list items) |
| **Low** | `shadow-sm` | Card containers that need subtle lift |
| **Medium** | `shadow-lg shadow-{color}-200` | Colored stat cards, FAB button, CTA buttons on colored surface |
| **High** | `shadow-2xl` | Modal sheets (bottom sheets, full screen modals) |
| **Dark header** | Inline: `shadowOpacity: 0.04, shadowRadius: 8` | Session cards, functional cards needing precise control |

**Rules:**
- All colored stat cards (emerald, indigo, orange) include a **colored shadow tint** matching their surface: `shadow-emerald-200`, `shadow-indigo-200`, `shadow-orange-200`.
- White cards on `gray-50` backgrounds use `border border-gray-100` instead of a visible shadow — the border provides definition without visual noise.
- Modals always use `shadow-2xl` as they float above all other content.

---

## 7. Component Patterns

### 7.1 Screen Headers

Three header archetypes are used across the app:

**Type A — Colored Hero Header** (Meals tab)
```
bg-emerald-500  pt-16  pb-8  px-6  rounded-b-3xl  shadow-lg
- App logo + week label (top-left)
- Status badge (top-right, conditional)
- Day name (3xl font-extrabold white)
- Date + calorie target (bottom row)
```

**Type B — White/Light Header** (Groceries, Settings, Stats)
```
bg-white  pt-16  px-6  pb-6  border-b border-gray-100
- Screen title (3xl font-bold text-gray-900)
- Subtitle or active week label (gray-500 font-medium)
- Action buttons (top-right)
- Progress bar (bottom, optional)
```

**Type C — Dark Header** (Cook tab)
```
bg-gray-900  pt-16  px-6  pb-5
- Screen title (3xl font-black text-white)
- Status badge (top-right, emerald pill, conditional)
- Subtitle in gray-500
- Stats row with progress bar
- Week selector tabs
```

### 7.2 Cards

**Standard Content Card**
```
bg-white  rounded-2xl  border border-gray-100  shadow-sm  mb-4  p-4 or p-5
```

**Colored Stat Card** (Stats screen hero row)
```
flex-1  bg-{color}-500  p-5 or p-6  rounded-[32px]  shadow-lg  shadow-{color}-200
- Icon in bg-{color}-400/30 rounded-full (top-left)
- Label in text-white/80 text-[10px] uppercase (top-right)
- Value in text-white text-3xl font-black
- Sub-label in text-{color}-100 text-[10px] font-bold
```

**Section Card** (Settings sections)
```
bg-white  rounded-2xl  overflow-hidden  mb-6  shadow-sm  border border-gray-100
Header row: p-4  border-b border-gray-50  bg-gray-50/50
Content rows: p-4  border-b border-gray-50
```

**Cook Session Card**
```
bg-white  mb-4  rounded-2xl  overflow-hidden  border border-gray-100
Left accent bar: 3px wide, colored by session type
Content: pl-5 pr-4 pt-4 pb-5
```

### 7.3 Buttons & Pressables

**Primary CTA**
```
bg-emerald-500  py-4  rounded-2xl  items-center
Text: text-white font-bold text-base (or text-lg for modal CTAs)
Active: active:bg-emerald-600
Shadow: shadow-lg shadow-emerald-200 (when on neutral bg)
```

**Destructive Action**
```
bg-rose-50  p-4  rounded-xl  border border-rose-100  flex-row items-center justify-center
Text: text-rose-500 font-bold
Icon: rose-500
```

**Ghost / Secondary**
```
bg-gray-100  px-3  py-2  rounded-full
Text: text-[10px] font-bold text-gray-600
```

**Active Toggle State** (filter buttons, day selectors, week tabs)
```
Active:   bg-emerald-500  border-emerald-500  text-white
Inactive: bg-white / bg-gray-800(dark)  border-gray-200 / border-gray-700  text-gray-600 / text-gray-400
```

**FAB (Floating Action Button)**
```
bg-emerald-500  w-10 h-10  rounded-full  items-center justify-center  shadow-sm
Icon: FontAwesome "plus", size 16, color white
Active: active:bg-emerald-600
```

**Icon Button (Edit/Delete row actions)**
```
Edit:   w-8 h-8  bg-gray-100  rounded-full  active:bg-gray-200
Delete: w-8 h-8  bg-rose-50   rounded-full  active:bg-rose-100
```

### 7.4 Checkboxes

**Round (Groceries)**
```
w-6 h-6  rounded-full  border-2
Checked:   bg-emerald-500  border-emerald-500  + FontAwesome "check" size 12 white
Unchecked: border-gray-300  bg-white
```

**Square-ish (Meals)**
```
w-8 h-8  rounded-full  border-2
Checked:   bg-emerald-500  border-emerald-500  + FontAwesome "check" size 14 white
Unchecked: border-gray-200  bg-white
```

**Compact (Cook items)**
```
w-5 h-5  rounded-md  border-2  mt-0.5
Checked:   bg-emerald-500  border-emerald-500  + FontAwesome "check" size 9 white
Unchecked: border-gray-300  bg-white
```

**Rule:** Checked state always uses emerald-500 fill + white checkmark. The checkbox container size scales with the list item density — larger lists (groceries) use larger checkboxes for easy tapping.

### 7.5 Progress Bars

```
Container: h-1.5 (or h-2)  bg-gray-100 (or bg-gray-700 on dark)  rounded-full  overflow-hidden
Fill:       h-full  bg-emerald-500  rounded-full  width: {pct}%
```
Always accompanied by a text label (`{done} / {total} items`) positioned below or beside.

### 7.6 Input Fields

```
bg-gray-50  border border-gray-200  rounded-xl  px-4  py-3  text-base  text-gray-800
Placeholder: gray-400 (system default)
Label above: text-sm font-semibold text-gray-500 mb-2
```

In modals, use `rounded-2xl` and `px-5 py-4` for a more generous feel.

### 7.7 Badges & Chips

**Micro label (section header above content)**
```
text-[10px]  font-black  uppercase  tracking-widest  text-gray-400
```

**Status pill (active states, "Now", "Current")**
```
bg-emerald-500  px-2 to px-2.5  py-0.5 to py-1  rounded-full
Text: text-white text-[8px] to text-[10px] font-black uppercase tracking-wider
```

**Nutrition / macro tag**
```
bg-emerald-100/50  px-3  py-1  rounded-full
Text: text-emerald-700 text-[10px] font-bold uppercase tracking-wider
```

**Generic attribute chip (cook item usage)**
```
bg-gray-100  px-2  py-0.5  rounded-full
Text: text-[9px] text-gray-500 font-bold
```

**Equipment chip**
```
bg-gray-50  border border-gray-100  px-2.5  py-1  rounded-lg
Text: text-[10px] font-semibold text-gray-500
```

### 7.8 Callout Blocks

**Recipe / Primary Info**
```
bg-emerald-50  p-6  rounded-3xl  border border-emerald-100
Icon: FontAwesome "cutlery" emerald-500
Title: text-emerald-800 font-bold text-sm uppercase tracking-wider
Body: text-gray-700 leading-relaxed text-base
```

**Tip / Kitchen Note / Warning**
```
bg-amber-50  border border-amber-100  rounded-xl  px-3  py-2.5  flex-row  gap-2.5
Icon: FontAwesome "lightbulb-o" amber-600 (#D97706)
Body: text-amber-800 text-xs leading-relaxed font-medium
```

**Info / Wellness Note**
```
bg-indigo-50  border border-indigo-100  rounded-[32px]  p-6
Icon: emerald or indigo, FontAwesome
Title: text-indigo-900 font-black text-[10px] uppercase tracking-widest
Body: text-indigo-800/80 text-xs leading-relaxed font-medium
```

### 7.9 Bottom Sheet Modals

```
Container:  flex-1 justify-end bg-black/50
Sheet:      bg-white  rounded-t-3xl or rounded-t-[40px]  p-6 to p-8  shadow-2xl
Drag handle (optional): w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6
Title:      text-xl to text-2xl font-black text-gray-900 mb-6
```
All modals use `KeyboardAvoidingView` with `behavior="padding"` on iOS and `behavior="height"` on Android.

### 7.10 Icon Containers

Colored icon containers follow a consistent pattern:

```
w-{size} h-{size}  bg-{color}-100 or bg-{color}-500  rounded-2xl or rounded-full
Icon inside at ~40-50% of container size
```

| Container Size | Icon Size | Usage |
|---------------|-----------|-------|
| `w-8 h-8` | 14–16px | Compact row accessory icons |
| `w-10 h-10` | 18px | Feature list bullets, daily metric icons |
| `w-12 h-12` | 20px | Settings row icons, grocery header logo |
| `w-16 h-16` | 32px | Hero profile avatar container |
| `w-20 h-20` | 32px | Empty state illustration container |

### 7.11 Empty States

```
View: items-center justify-center mt-24 opacity-50
Container: w-20 h-20 bg-gray-100 (or bg-gray-200) rounded-full items-center justify-center mb-4 (or mb-5)
Icon: FontAwesome, size 32, color #9CA3AF
Title: text-lg font-semibold (or font-black) text-gray-400 (or text-gray-900) mt-4
Body: text-sm text-gray-400 text-center px-10 leading-relaxed mt-1
```
The `opacity-50` wrapper on the entire empty state communicates "inactive" without aggressive red/warning styling.

### 7.12 Section Dividers

Within section cards:
```
border-b border-gray-50   (very subtle, between list rows)
border-b border-gray-100  (standard, between card header and body)
```

Between major sections:
- Spacing via `mb-6` between cards
- No horizontal rules — whitespace is the divider

---

## 8. Navigation

### Tab Bar
```
position: 'absolute'
bottom: 30 (iOS) / 20 (Android)
left: 20, right: 20
backgroundColor: '#ffffff'
borderRadius: 25
height: 70
paddingBottom: 20 (iOS) / 10 (Android)
paddingTop: 10
borderTopWidth: 0
shadowColor: '#000', shadowOffset: {0, 4}, shadowOpacity: 0.1, shadowRadius: 10
```

| State | Icon Color | Label Color |
|-------|-----------|-------------|
| Active | `#10B981` (emerald-500) | `#10B981` |
| Inactive | `#9CA3AF` (gray-400) | `#9CA3AF` |

Icon size: `24`. All tabs use `FontAwesome` icons.

### Tab Icons

| Tab | Icon |
|-----|------|
| Meals | `cutlery` |
| Groceries | `shopping-cart` |
| Plan | `calendar` |
| Cook | `fire` |
| Stats | `bar-chart` |
| Settings | `cog` |

### Stack Navigation (Plan sub-screens, Health Profile)
- `headerShown: false` on all tab screens (custom headers)
- `headerShown: true` only on modal/stack screens with native header (Health Profile uses `headerLargeTitle`, `headerStyle: { backgroundColor: '#F9FAFB' }`, `headerShadowVisible: false`)
- `presentation: 'modal'` for Health Profile

---

## 9. Interaction & Motion

### Touch Feedback
- `TouchableOpacity` with `activeOpacity={0.7}` — the standard for interactive elements.
- `Pressable` with `active:bg-*` Tailwind classes — used for buttons in settings and grocery actions where visual feedback is more complex.

### Scroll Behavior
- All scrollable lists: `showsVerticalScrollIndicator={false}` — clean, app-like feel.
- `contentContainerStyle={{ paddingBottom: 100–120 }}` on every scroll view — always clear the floating tab bar.
- Horizontal scroll containers (calendar strip, week tabs): `showsHorizontalScrollIndicator={false}`.

### Animations
- Splash screen: `Animated.timing` fade-in over 1000ms with `useNativeDriver: true`.
- Modal: `animationType="slide"` — native bottom-sheet slide-up behavior.
- No custom spring/bounce animations — keep motion purposeful, not decorative.

### State Feedback Patterns

| Interaction | Visual Response |
|-------------|----------------|
| Meal marked done | `opacity-60` + `line-through` on name |
| Grocery item checked | `opacity-40` + `line-through` on name |
| Cook item completed | `opacity: 0.45` + `line-through` on name |
| Session completed | Green progress badge + `line-through` on label |
| Current meal slot | `border-emerald-500 border-[2px]` + "Now" floating badge |
| Today in calendar | Small `4x4` emerald dot at bottom of date cell |
| Current week tab | Emerald dot below label when not selected; no dot needed when selected (fill communicates it) |

---

## 10. Icon Library

The app uses **FontAwesome 4** via `@expo/vector-icons/FontAwesome` exclusively. No other icon libraries.

### Icon Usage Reference

| Context | Icon Name |
|---------|-----------|
| Meal / cutlery | `cutlery` |
| Grocery / cart | `shopping-cart` |
| Shopping basket | `shopping-basket` |
| Plan / calendar | `calendar`, `calendar-o`, `calendar-check-o` |
| Cook | `fire` |
| Stats / insights | `bar-chart`, `line-chart` |
| Settings / gear | `cog` |
| Check / done | `check` |
| Streak | `bolt` |
| Variety | `cubes` |
| Timer | `clock-o` |
| Notification bell | `bell` |
| Light bulb / tip | `lightbulb-o` |
| Recipe | `cutlery` |
| Notes | `sticky-note` |
| User / profile | `user`, `user-md` |
| Upload | `upload` |
| Delete | `trash`, `trash-o` |
| Edit | `pencil` |
| Close | `times` |
| Back / chevron | `chevron-right`, `chevron-left` |
| Lock | `lock` |
| Calories / fire | `fire` |
| Protein | `flash` |
| Eye / hide | `eye`, `eye-slash` |
| Archive / storage | `archive` |
| Portions | `th-large` |
| Wellness / magic | `magic` |
| Rocket / activity | `rocket` |
| Gender | `venus-mars` |

### Icon Sizing

| Context | Size |
|---------|------|
| Tab bar icons | 24 |
| Section/card header icons | 20 |
| Row action icons (edit, trash) | 12 |
| Inline label icons | 13–16 |
| Feature bullet icons | 18 |
| Hero / avatar icons | 32 |
| Metadata micro icons | 9 |

---

## 11. Screen-by-Screen Reference

### Splash / Welcome (`app/index.tsx`)
- White background, centered content, fade-in animation
- Logo: `w-48 h-48 bg-emerald-50 rounded-[48px]`
- Brand name: `text-5xl font-black text-gray-900 tracking-tighter`
- Emerald divider line: `h-1 w-12 bg-emerald-500 rounded-full`
- Feature bullets: emerald / indigo / rose icon containers
- Loading spinner: `border-emerald-500` ring

### Meals (`app/(tabs)/index.tsx`)
- Emerald hero header with app logo, day name, calorie target
- Day selector: horizontal pill scroll strip with `bg-gray-100` container, emerald active state
- Meal cards: white `rounded-2xl`, emerald border when "current slot"
- "Now" badge: absolute positioned above card, emerald pill

### Groceries (`app/(tabs)/groceries.tsx`)
- White header with app logo, `text-3xl font-bold` title
- Progress bar below header
- Section headers: `text-emerald-500 font-bold text-xs uppercase tracking-widest`
- Items: `border-b border-gray-50`, round checkboxes, trash icon on right

### Plan (`app/(tabs)/plan/*`)
- Standard white/gray-50 screens
- Week cards, day cards using standard card pattern

### Cook (`app/(tabs)/cook.tsx`)
- **Dark** (`bg-gray-900`) header — unique to this screen
- Week tabs inside the header on dark background
- Session cards with colored left accent bar (3px)
- Three session type accents: emerald (primary), amber (top-up), indigo (default)

### Stats (`app/(tabs)/stats.tsx`)
- Light header with icon
- Two hero rows: [Streak (orange), Variety (indigo)] then [Today Kcal (emerald), Weekly (indigo)]
- Bar chart: custom `View` bars, emerald fill
- Grocery summary card: full-width

### Settings (`app/(tabs)/settings.tsx`)
- Standard section card layout
- Health Profile link card: emerald icon container
- Meal slots: list inside section card
- Bottom: version string in `text-[10px] font-bold uppercase tracking-[2px] text-gray-400`

### Health Profile (`app/health_profile.tsx`)
- Emerald hero card: `p-8 rounded-[40px]` with goal, weight, timeline
- Daily Blueprint: three-column metric row
- Stat list: `StatCard` pattern with colored icon containers
- Dark close button: `bg-gray-900 p-6 rounded-[28px]`

---

## 12. Do's and Don'ts

### Do
- Use `pt-16` at the top of every screen's first element for consistent status bar clearance.
- Add `paddingBottom: 100–120` on every ScrollView to clear the floating tab bar.
- Use `font-black` for numbers, stats, and short-form labels that need strong visual weight.
- Apply `tracking-widest uppercase text-[10px] font-black text-gray-400` for every section sub-header label.
- Keep card borders at `border-gray-100` on white cards and `border-gray-50` on row dividers — anything heavier is too noisy.
- Match shadow tint color to surface color for colored stat cards.
- Use `activeOpacity={0.7}` on all `TouchableOpacity` elements.
- Show `showsVerticalScrollIndicator={false}` on all scroll views.

### Don't
- Don't use `alert()` (web global). Always use `Alert.alert()` from React Native.
- Don't add a new color that isn't in the palette above without updating this guide.
- Don't use `border-gray-200` for card outlines — `border-gray-100` is the standard (softer).
- Don't use hard drop shadows on white cards — use `border border-gray-100` instead.
- Don't create new icon containers with arbitrary sizes — use the defined size scale.
- Don't show `showsVerticalScrollIndicator` (default is true) — always explicitly hide it.
- Don't use `font-bold` where `font-black` is specified for stat numbers — the contrast difference matters.
- Don't use different border radii for components of the same type — pick the right tier from the radius system.
- Don't use raw color hex values in JSX — always use Tailwind tokens.
- Don't mix `Pressable` and `TouchableOpacity` on the same conceptual element type — pick one per component pattern and be consistent.

---

## 13. Accessibility

- Minimum touch target: `40x40px` — all interactive elements must meet this. Icon buttons use explicit `w-8 h-8` minimum and have additional padding from parent layout.
- Color is never the **only** signal — completed states combine color + opacity + strikethrough.
- Text on colored surfaces must maintain sufficient contrast: white text on emerald-500 and gray-900 both meet WCAG AA.
- Avoid purely decorative opacity reductions below `opacity-40` — below this threshold, content becomes unreadable.

---

*Version 1.0 — Generated from full codebase audit. Update this guide whenever a new pattern is introduced or an existing one is changed.*
