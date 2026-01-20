Project scope and core features can be framed like a small, focused, local‑first personal planner app that you fully control. (Tool access is restricted this turn, so specific external citations are not available.)

***

## Project scope

- **Purpose**  
  - Personal 4‑week meal and grocery planner that helps you plan once and then just follow the plan week by week.  
  - Reduce decision fatigue: each week you see only that week’s meals and grocery list.

- **Platform and tech**  
  - React Native app (with Expo) targeting both Android and iOS.  
  - Local‑first: all data stored on device (e.g., SQLite/AsyncStorage), no server or login.

- **Users and usage**  
  - Single user, single device (no multi‑user, no sync).  
  - Designed for repeated monthly cycles: you prepare 4 weeks of meal and grocery data, then reuse/adjust it over time.

- **In scope (v1)**  
  - CRUD (create, read, update, delete) for:
    - 4 weekly meal plans.  
    - 4 weekly grocery lists.  
  - Views focused on the *active week*.  
  - Local notifications for:
    - Weekly grocery run.  
    - Daily meal times.

- **Out of scope (v1)**  
  - No AI, no automatic grocery generation, no barcode scanning, no recipes API.  
  - No account system, cloud sync, or multi‑device support.  
  - No detailed nutrition tracking or macro counting.

***

## Core features

### 1. Four‑week planning model

- Let the user define 4 **Week Plans** (Week 1–4) per cycle.  
- Each Week Plan:
  - Has a start and end date.  
  - Contains 7 **days** (Mon–Sun).  
  - Each day has multiple **meal slots** (breakfast, lunch, dinner, optional snack).  
- User can:
  - Enter/edit meal titles and short notes per slot.  
  - Duplicate a week from another week to avoid retyping.  
  - Reset/clear a week.

### 2. Weekly grocery lists (manual, per week)

- Each Week Plan has its own **Grocery List**.  
- User can:
  - Add items with name, quantity, unit (e.g., “Rice – 2 kg”).  
  - Edit or delete items.  
  - Reorder items (optional nice‑to‑have).  
- Lists are **not auto‑generated**; the user ensures they align with that week’s meals.

### 3. Active week and navigation

- The app maintains an **active week** concept:  
  - Default: uses today’s date to pick Week 1–4 automatically.  
  - User can override via a week selector (e.g., slider or dropdown).  
- Home UI always reflects the active week:
  - Meals view: week’s meal plan.  
  - Groceries view: that week’s grocery list.  
- When the calendar moves into a new week, the app can auto‑switch active week (with optional confirmation).

### 4. Meals view (execution mode)

- On the **Home → Meals** screen, for the active week:  
  - Show a 7‑day strip (Mon–Sun), with today highlighted.  
  - For the selected day, show each meal slot and its name.  
- User can:
  - Tap a slot to see notes (e.g., prep instructions).  
  - Optionally mark a meal as “done” or “skipped”.

### 5. Groceries view (shopping mode)

- On the **Home → Groceries** screen, for the active week:  
  - Show all grocery items as a **checklist**.  
  - Each item displays name, quantity, unit.  
- User can:
  - Check/uncheck items as they shop.  
  - Quickly clear all checks at the start of a new week (while keeping the items).

### 6. Planning screen (edit mode)

- Separate **Plan** section (tab or screen) where the user edits data more comfortably:  
  - Week list showing Week 1–4 and their date ranges.  
  - Week detail allowing:
    - Day‑by‑day meal editing.  
    - Grocery list editing for that week.  
- This keeps “planning” and “using” flows distinct.

### 7. Reminders and notifications

- **Weekly grocery reminder**  
  - Settings for: enable/disable, day of week, time.  
  - Notification text like “Grocery time for Week 2 – tap to see your list.”  
  - Tapping notification opens the Groceries view for the active week.

- **Daily meal reminders**  
  - Settings for each meal slot: enable/disable, time (e.g., breakfast 08:00, lunch 13:00, dinner 19:00).  
  - Notification shows the meal name for that day and slot.  
  - Tapping opens Meals view with that day selected.

### 8. Settings and preferences

- Reminder configuration (times, days, toggles).  
- Option for:
  - First day of week (Monday/Sunday).  
  - Default week selection behavior (auto by date vs last used).  
- Simple “Reset data” option to clear all plans and lists if you want to start over.

### 9. Non‑functional qualities

- **Offline‑first**: everything works without internet.  
- **Fast and lightweight**: minimal dependencies, optimized for a single user’s data.  
- **Simple design**: clear typography, calm color palette, intuitive navigation between Plan / Meals / Groceries / Settings.

