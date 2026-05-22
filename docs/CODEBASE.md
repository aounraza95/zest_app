# Zest - Codebase Knowledge Base

> Personal 4-week meal & grocery planner with batch-cooking support.
> Single user, single device, offline-first with optional Supabase cloud sync.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo ~54 |
| Routing | expo-router ~6 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) + `global.css` |
| State | Zustand v5 with AsyncStorage persistence |
| Cloud | Supabase JS v2 (dual-write sync) |
| Dates | date-fns v4 |
| Notifications | expo-notifications |
| Icons | @expo/vector-icons (FontAwesome) |

---

## Project Structure

```
zest_app/
├── app/
│   ├── _layout.tsx                  # Root layout (init store, fonts, theme)
│   ├── index.tsx                    # Splash/welcome screen (auto-redirect 2.5s)
│   ├── health_profile.tsx           # Modal: read-only health profile viewer
│   └── (tabs)/
│       ├── _layout.tsx              # 6-tab bottom bar
│       ├── index.tsx                # Meals tab (daily execution view)
│       ├── groceries.tsx            # Shopping checklist
│       ├── cook.tsx                 # Batch cooking session tracker
│       ├── stats.tsx                # Insights & progress analytics
│       ├── settings.tsx             # Settings, meal slots, data management
│       └── plan/
│           ├── index.tsx            # 4-week overview list
│           └── [weekId]/
│               ├── index.tsx        # Week detail (days + grocery link)
│               ├── day/[dayId].tsx  # Meal editor for a day
│               └── grocery.tsx      # Grocery list editor for a week
├── store/
│   └── useAppStore.ts               # Single Zustand store (all state + actions)
├── types/
│   └── index.ts                     # All TypeScript interfaces
├── utils/
│   ├── supabase.ts                  # Supabase client
│   ├── dateHelpers.ts               # Week/day index utilities
│   └── notifications.ts             # (utility file)
├── supabase/
│   ├── config.toml
│   └── migrations/                  # 10 migration files
├── json_template/                   # Sample JSON import files
├── docs/                            # Documentation
└── __tests__/                       # Jest tests
```

---

## Data Model

### Hierarchy
```
AppState
├── weeks: WeekPlan[4]          (week-0 to week-3)
│   ├── days: DayPlan[7]        (Monday to Sunday)
│   │   └── meals: MealSlot[]   (per MealDefinition)
│   ├── groceryList: GroceryItem[]
│   └── cookingPlan: CookingSession[]
│       └── cookItems: CookItem[]
├── settings: AppSettings
│   └── mealDefinitions: MealDefinition[]
└── planMeta: PlanMeta          (health profile, import-only)
```

### Key Type Details

**MealDefinition** — Named meal slot (Breakfast, Lunch, etc.). Dynamic, user-configurable.
```ts
{ id, name, defaultTime: "HH:MM", notify: boolean }
```

**MealSlot** — Actual food planned for a day+slot.
```ts
{ id, definitionId, name, qty, notes, recipeNote, nutritionHighlights: string[], isDone, time, calories }
```

**DayPlan**
```ts
{ id: "week-{n}-day-{0-6}", dayOfWeek, dayIndex: 0-6, totalCalories?, meals }
```

**GroceryItem**
```ts
{ id, name, quantity, category, isChecked }
```

**CookingSession** — Batch prep session (typically Sunday cook-ahead).
```ts
{ id, sessionType, day, dayIndex, label, estimatedDuration, bestTime, kitchenNote, cookItems, prepAhead: string[], equipmentNeeded: string[], isCompleted }
```

**CookItem** — Individual item cooked in a session.
```ts
{ id, name, category, quantity, cookMethod, instructions, usage: [{day, mealSlot, use}], portionInto, portionSize, storageType, storageDays, storageNote, isCompleted }
```

**AppSettings**
```ts
{ isGroceryReminderEnabled, groceryReminderDay, groceryReminderTime, activeWeekOverride: string|null, mealDefinitions }
```

---

## State Management

### Store (`store/useAppStore.ts`)
- Single Zustand store with `persist` middleware
- Persisted to AsyncStorage under key `grocery-app-storage` (schema version: 1)
- Migration v0→v1: adds default meal definitions

### Dual-Write Pattern
Every action does:
1. Optimistic local `set(...)` — immediate UI update
2. Async `await supabase.from(...).update/upsert/insert(...)` — cloud sync
3. On error: logs to console + optional Alert (local state is not rolled back)

### Initialization
`app/_layout.tsx` → after fonts load → `useAppStore.getState().initialize()` → fetches all Supabase data → replaces local state if data found → `SplashScreen.hideAsync()`

---

## Active Week Logic

The app uses a monthly 4-week cycle based on the day of the month:
- Days 1-7 → Week 0 (displayed as "Week 1")
- Days 8-14 → Week 1
- Days 15-21 → Week 2
- Days 22-28 → Week 3
- Days 29+ → cycles back to Week 0

```ts
// utils/dateHelpers.ts
getCurrentWeekIndex(): Math.floor((new Date().getDate() - 1) / 7) % 4
```

User can override this via **Settings → Active Week Override**.

---

## Navigation

- Tab bar: floating pill shape, 6 tabs (Meals, Groceries, Plan, Cook, Stats, Settings)
- Primary color: `emerald-500` (#10B981)
- Stack navigation within Plan section for drill-down editing

---

## Supabase Tables

| Table | Description |
|-------|-------------|
| `weeks` | 4 week records (seeded, TEXT ids: "week-0"..."week-3") |
| `days` | 7 days per week (TEXT ids: "week-n-day-0"..."week-n-day-6") |
| `meals` | Individual meal slots per day |
| `grocery_items` | Shopping list items per week |
| `cooking_sessions` | Batch prep sessions per week |
| `cooking_items` | Individual items within a cooking session |
| `meal_definitions` | Named meal slot templates |
| `app_settings` | Singleton row (id=1) for global settings |
| `plan_meta` | Singleton row (id=1) for health profile |

RLS: enabled on all tables with public access policy (`USING (true)`), no auth required.

---

## Data Import (JSON)

Import via **Settings → Import JSON Data** using the device file picker.

### JSON Format
```json
{
  "meta": { "purpose": "...", "gender": "...", "age": 25, "dailyCalorieTarget": 3000, ... },
  "settings": {
    "mealDefinitions": [
      { "id": "def-breakfast", "name": "Breakfast", "defaultTime": "08:00", "notify": true }
    ]
  },
  "weeks": [
    {
      "id": "week-0", "label": "Week 1", "theme": "optional",
      "days": [
        {
          "dayIndex": 0, "dayOfWeek": "Monday", "totalCalories": 3000,
          "meals": [
            { "definitionId": "def-breakfast", "name": "Oats with Banana", "isDone": false,
              "qty": "200g oats", "calories": "450", "recipeNote": "...", "notes": "...",
              "nutritionHighlights": ["Protein", "Fiber"] }
          ]
        }
      ],
      "groceryList": [{ "name": "Oats", "estimatedQty": "500g", "category": "Grains" }],
      "cookingSessions": [
        {
          "id": "session-1", "sessionType": "primary", "day": "Sunday", "dayIndex": 6,
          "label": "Sunday Batch Cook", "estimatedDuration": "3 hours", "bestTime": "Morning",
          "kitchenNote": "...", "prepAhead": ["Wash vegetables", "Soak lentils"],
          "equipmentNeeded": ["Rice cooker", "Large pot"],
          "cookItems": [
            {
              "id": "item-1", "name": "Boiled Chicken", "category": "Protein",
              "quantity": "1kg", "cookMethod": "Boil", "instructions": "Boil for 30 min...",
              "portionInto": 7, "portionSize": "150g", "storageType": "fridge", "storageDays": 5,
              "usage": [{ "day": "Monday", "mealSlot": "Lunch", "use": "Chicken curry" }]
            }
          ]
        }
      ]
    }
  ]
}
```

See `json_template/4_week_gym_bulking_meal_plan.json` for a complete real-world example.

---

## Running the App

```bash
npm start           # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm test            # Jest tests
```

Note: `NODE_OPTIONS='--require ./polyfill.js'` is prepended to all run commands (see `polyfill.js`).

---

## Key Gotchas

1. **Week IDs are 0-indexed** in code (`week-0`), but **displayed as 1-indexed** ("Week 1") to users.
2. **Day IDs are stable** (`week-n-day-0`). Never regenerate them — they're used for Supabase upserts.
3. **Meal IDs are ephemeral** — regenerated fresh on every import. The stable link is `definitionId`.
4. **`calories` field is a string** on MealSlot (parsed via `parseInt` when needed for math).
5. **Import is destructive** — wipes Supabase tables before re-inserting. Local state updates first.
6. **`groceryReminderDay`** uses Expo's calendar weekday format: 1=Sunday, 2=Monday, ..., 7=Saturday.
7. **No auth** — Supabase anon key is hardcoded. RLS uses public access policies.
8. **`upsertMeal`** is used for editing: finds existing meal by `definitionId`, or creates new one.
