export type MealType = string; // Dynamic now

export interface MealDefinition {
  id: string;
  name: string;
  defaultTime?: string; // "08:00"
  notify: boolean;
}

export interface MealSlot {
  id: string;
  definitionId: string; // Links to meal_definitions.id (UUID string)
  name: string; // The actual food
  qty?: string;
  notes?: string;
  recipeNote?: string;
  nutritionHighlights?: string[];
  isDone: boolean;
  time?: string; // Override time
  dayId?: string; // Back-link for Supabase (UUID)
  calories?: string;
}

export interface DayPlan {
  id: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  dayIndex: number; // 0-6 (0=Monday)
  totalCalories?: number;
  meals: MealSlot[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string; // e.g. "2 kg"
  category?: string;
  isChecked: boolean;
}

export interface CookItemUsage {
  day: string;
  mealSlot: string;
  use: string;
}

export interface CookItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  cookMethod: string;
  instructions: string;
  usage: CookItemUsage[];
  portionInto?: number;
  portionSize?: string;
  storageType?: string;
  storageDays?: number;
  storageNote?: string;
  isCompleted: boolean;
}

export interface CookingSession {
  id: string;
  sessionType: string;
  day: string;
  dayIndex: number;
  label: string;
  estimatedDuration: string;
  bestTime: string;
  kitchenNote: string;
  cookItems: CookItem[];
  prepAhead: string[];
  equipmentNeeded: string[];
  isCompleted: boolean;
}

export interface WeekPlan {
  id: string; // "week-1", "week-2", etc.
  label: string; // "Week 1", "Week 2"
  theme?: string;
  days: DayPlan[];
  groceryList: GroceryItem[];
  cookingPlan: CookingSession[];
}

export interface PlanMeta {
  purpose?: string;
  gender?: string;
  age?: number;
  location?: string;
  currentWeight_kg?: number;
  targetWeight_kg?: number;
  timeline?: string;
  activityLevel?: string;
  skinNotes?: string;
  dailyCalorieTarget?: number;
  dailyProteinTarget_g?: string;
  mealsPerDay?: number;
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
  planMeta: PlanMeta;

  // Actions
  updateMeal: (weekId: string, dayId: string, mealId: string, updates: Partial<MealSlot>) => Promise<void>;
  upsertMeal: (weekId: string, dayId: string, definitionId: string, updates: Partial<MealSlot>) => Promise<void>;
  addGroceryItem: (weekId: string, item: Omit<GroceryItem, 'id' | 'isChecked'>) => Promise<void>;
  updateGroceryItem: (weekId: string, itemId: string, updates: Partial<GroceryItem>) => Promise<void>;
  toggleGroceryItem: (weekId: string, itemId: string) => Promise<void>;
  removeGroceryItem: (weekId: string, itemId: string) => Promise<void>;
  clearGroceryChecks: (weekId: string) => Promise<void>;
  toggleCookingSession: (weekId: string, sessionId: string) => Promise<void>;
  toggleCookItem: (weekId: string, sessionId: string, itemId: string) => Promise<void>;
  setActiveWeekOverride: (weekId: string | null) => Promise<void>;
  addMealDefinition: (def: MealDefinition) => Promise<void>;
  removeMealDefinition: (defId: string) => Promise<void>;
  updateMealDefinition: (defId: string, updates: Partial<MealDefinition>) => Promise<void>;
  importData: (data: any) => Promise<void>;
  updateDay: (weekId: string, dayId: string, updates: Partial<DayPlan>) => Promise<void>;
  toggleGroceryReminders: (enabled: boolean) => Promise<void>;
  updateGroceryReminderSettings: (updates: Partial<Pick<AppSettings, 'groceryReminderDay' | 'groceryReminderTime'>>) => Promise<void>;
  resetData: () => Promise<void>;
  initialize: () => Promise<void>;
}
