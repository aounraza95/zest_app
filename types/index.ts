export type MealType = string; // Dynamic now

export interface MealDefinition {
  id: string;
  name: string;
  defaultTime?: string; // "08:00"
  notify: boolean;
}

export interface MealSlot {
  id: string;
  definitionId: string; // Links to MealDefinition
  name: string; // The actual food
  notes?: string;
  isDone: boolean;
  time?: string; // Override time
}

export interface DayPlan {
  id: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  dayIndex: number; // 0-6 (0=Monday)
  meals: MealSlot[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string; // e.g. "2 kg"
  category?: string;
  isChecked: boolean;
}

export interface WeekPlan {
  id: string; // "week-1", "week-2", etc.
  label: string; // "Week 1", "Week 2"
  days: DayPlan[];
  groceryList: GroceryItem[];
}
export interface AppSettings {
  isGroceryReminderEnabled: boolean;
  groceryReminderDay: number;
  groceryReminderTime: string;
  activeWeekOverride: string | null;
  mealDefinitions: MealDefinition[];
}

export interface AppState {
  weeks: WeekPlan[];
  settings: AppSettings;

  // Actions
  updateMeal: (weekId: string, dayId: string, mealId: string, updates: Partial<MealSlot>) => void;
  upsertMeal: (weekId: string, dayId: string, definitionId: string, updates: Partial<MealSlot>) => void;
  addGroceryItem: (weekId: string, item: Omit<GroceryItem, 'id' | 'isChecked'>) => void;
  toggleGroceryItem: (weekId: string, itemId: string) => void;
  removeGroceryItem: (weekId: string, itemId: string) => void;
  clearGroceryChecks: (weekId: string) => void;
  setActiveWeekOverride: (weekId: string | null) => void;
  addMealDefinition: (def: MealDefinition) => void;
  removeMealDefinition: (defId: string) => void;
  updateMealDefinition: (defId: string, updates: Partial<MealDefinition>) => void;
  importData: (data: any) => void;
  resetData: () => void;
}
