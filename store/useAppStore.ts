
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppState, DayPlan, WeekPlan } from '../types';
// For simplicity in Expo Go without polyfills, we can use a simple random string generator.

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyDay = (dayIndex: number, dayOfWeek: string): DayPlan => ({
    id: generateId(),
    dayIndex,
    dayOfWeek,
    meals: [
        { id: generateId(), definitionId: 'def-1', name: '', isDone: false, time: '08:00' },
        { id: generateId(), definitionId: 'def-2', name: '', isDone: false, time: '13:00' },
        { id: generateId(), definitionId: 'def-3', name: '', isDone: false, time: '19:00' },
        { id: generateId(), definitionId: 'def-4', name: '', isDone: false, time: '16:00' },
    ],
});

const createEmptyWeek = (index: number): WeekPlan => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return {
        id: `week-${index}`,
        label: `Week ${index + 1}`,
        days: days.map((day, idx) => createEmptyDay(idx, day)),
        groceryList: [],
    };
};

const INITIAL_WEEKS: WeekPlan[] = [0, 1, 2, 3].map(createEmptyWeek);

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            weeks: INITIAL_WEEKS,
            settings: {
                isGroceryReminderEnabled: false,
                groceryReminderDay: 5, // Saturday
                groceryReminderTime: '09:00',
                activeWeekOverride: null,
                mealDefinitions: [
                    { id: 'def-1', name: 'Breakfast', defaultTime: '08:00', notify: true },
                    { id: 'def-2', name: 'Lunch', defaultTime: '13:00', notify: true },
                    { id: 'def-3', name: 'Dinner', defaultTime: '19:00', notify: true },
                    { id: 'def-4', name: 'Snack', defaultTime: '16:00', notify: false },
                ],
            },

            updateMeal: (weekId, dayId, mealId, updates) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                days: week.days.map((day) =>
                                    day.id === dayId
                                        ? {
                                            ...day,
                                            meals: day.meals.map((meal) =>
                                                meal.id === mealId ? { ...meal, ...updates } : meal
                                            ),
                                        }
                                        : day
                                ),
                            }
                            : week
                    ),
                }));
            },

            upsertMeal: (weekId, dayId, definitionId, updates) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                days: week.days.map((day) => {
                                    if (day.id !== dayId) return day;
                                    const existingMealIndex = day.meals.findIndex(m => m.definitionId === definitionId);
                                    if (existingMealIndex >= 0) {
                                        const updatedMeals = [...day.meals];
                                        updatedMeals[existingMealIndex] = { ...updatedMeals[existingMealIndex], ...updates };
                                        return { ...day, meals: updatedMeals };
                                    } else {
                                        // Simplified type assertion for generic action
                                        const newMeal: any = {
                                            id: generateId(),
                                            definitionId,
                                            name: '',
                                            isDone: false,
                                            ...updates
                                        };
                                        return { ...day, meals: [...day.meals, newMeal] };
                                    }
                                })
                            }
                            : week
                    ),
                }));
            },

            addGroceryItem: (weekId, item) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: [
                                    ...week.groceryList,
                                    { ...item, id: generateId(), isChecked: false },
                                ],
                            }
                            : week
                    ),
                }));
            },

            toggleGroceryItem: (weekId, itemId) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.map((item) =>
                                    item.id === itemId
                                        ? { ...item, isChecked: !item.isChecked }
                                        : item
                                ),
                            }
                            : week
                    ),
                }));
            },

            removeGroceryItem: (weekId, itemId) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.filter((item) => item.id !== itemId),
                            }
                            : week
                    ),
                }));
            },

            clearGroceryChecks: (weekId) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.map((item) => ({ ...item, isChecked: false })),
                            }
                            : week
                    ),
                }));
            },

            setActiveWeekOverride: (weekId) => {
                set((state) => ({
                    settings: { ...state.settings, activeWeekOverride: weekId },
                }));
            },

            addMealDefinition: (def) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: [...state.settings.mealDefinitions, def],
                    },
                }));
            },

            updateMealDefinition: (defId, updates) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: state.settings.mealDefinitions.map(def =>
                            def.id === defId ? { ...def, ...updates } : def
                        ),
                    },
                }));
            },

            removeMealDefinition: (defId) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: state.settings.mealDefinitions.filter(def => def.id !== defId),
                    },
                }));
            },

            importData: (data: any) => {
                const newState: Partial<AppState> = {};

                // 1. Import Settings / Definitions
                if (data.settings && Array.isArray(data.settings.mealDefinitions)) {
                    newState.settings = {
                        ...get().settings,
                        mealDefinitions: data.settings.mealDefinitions
                    };
                }

                // 2. Import Weeks
                if (Array.isArray(data.weeks)) {
                    // We need to adhere to the 4-week structure.
                    // Map the incoming weeks to the existing 4 slots if possible, or just replace.
                    // Safest is to map index 0-3.
                    const newWeeks = [...INITIAL_WEEKS]; // Start with empty defaults

                    data.weeks.forEach((importedWeek: any, index: number) => {
                        if (index > 3) return; // Only 4 weeks supported

                        // Merge imported days into empty week template
                        const mergedDays = newWeeks[index].days.map(emptyDay => {
                            const importedDay = importedWeek.days?.find((d: any) => d.dayIndex === emptyDay.dayIndex);
                            if (!importedDay) return emptyDay;

                            // Map meals
                            // We need to map imported meals to our structure.
                            // The template uses definitionId.
                            // We should probably rely on the imported meals list, but ensure they have IDs.
                            const importedMeals = (importedDay.meals || []).map((m: any) => ({
                                id: m.id || generateId(),
                                definitionId: m.definitionId,
                                name: m.name,
                                notes: m.notes,
                                isDone: m.isDone || false,
                                time: m.time
                            }));

                            return {
                                ...emptyDay,
                                meals: importedMeals
                            };
                        });

                        // Map grocery list
                        const importedGroceries = (importedWeek.groceryList || []).map((g: any) => ({
                            id: g.id || generateId(),
                            name: g.name,
                            category: g.category || 'Uncategorized',
                            isChecked: g.isChecked || false
                        }));

                        newWeeks[index] = {
                            ...newWeeks[index],
                            label: importedWeek.label || newWeeks[index].label,
                            days: mergedDays,
                            groceryList: importedGroceries
                        };
                    });

                    newState.weeks = newWeeks;
                }

                if (Object.keys(newState).length > 0) {
                    set((state) => ({ ...state, ...newState }));
                }
            },

            resetData: () => {
                set({ weeks: INITIAL_WEEKS, settings: { ...get().settings, activeWeekOverride: null } });
            },
        }),
        {
            name: 'grocery-app-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Migration from v0 to v1: Add mealDefinitions
                    const newDefinitions = [
                        { id: 'def-1', name: 'Breakfast', defaultTime: '08:00', notify: true },
                        { id: 'def-2', name: 'Lunch', defaultTime: '13:00', notify: true },
                        { id: 'def-3', name: 'Dinner', defaultTime: '19:00', notify: true },
                        { id: 'def-4', name: 'Snack', defaultTime: '16:00', notify: false },
                    ];
                    return {
                        ...persistedState,
                        settings: {
                            ...persistedState.settings,
                            mealDefinitions: newDefinitions
                        }
                    };
                }
                return persistedState;
            },
        }
    )
);
