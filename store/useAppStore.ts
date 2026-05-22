import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppState, DayPlan, GroceryItem, MealSlot, WeekPlan } from '../types';
import { requestNotificationPermissionsAsync, scheduleAllReminders } from '../utils/notifications';
import { supabase } from '../utils/supabase';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyDay = (weekId: string, dayIndex: number, dayOfWeek: string): DayPlan => ({
    id: `${weekId}-day-${dayIndex}`,
    dayIndex,
    dayOfWeek,
    meals: [],
});

const createEmptyWeek = (index: number): WeekPlan => {
    const weekId = `week-${index}`;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return {
        id: weekId,
        label: `Week ${index + 1}`,
        days: days.map((day, idx) => createEmptyDay(weekId, idx, day)),
        groceryList: [],
        cookingPlan: [],
    };
};

const INITIAL_WEEKS: WeekPlan[] = [0, 1, 2, 3].map(createEmptyWeek);

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            weeks: INITIAL_WEEKS,
            settings: {
                isGroceryReminderEnabled: false,
                groceryReminderDay: 7, // Saturday
                groceryReminderTime: '13:00',
                activeWeekOverride: null,
                mealDefinitions: [],
            },
            planMeta: {},

            updateMeal: async (weekId: string, dayId: string, mealId: string, updates: Partial<MealSlot>) => {
                // 1. Optimistic UI update
                set((state: AppState) => ({
                    weeks: state.weeks.map((week: WeekPlan) =>
                        week.id === weekId
                            ? {
                                ...week,
                                days: week.days.map((day: DayPlan) =>
                                    day.id === dayId
                                        ? {
                                            ...day,
                                            meals: day.meals.map((meal: MealSlot) =>
                                                meal.id === mealId ? { ...meal, ...updates } : meal
                                            ),
                                        }
                                        : day
                                ),
                            }
                            : week
                    ),
                }));

                // 2. Supabase Sync
                const { error } = await supabase
                    .from('meals')
                    .update({
                        name: updates.name,
                        qty: updates.qty,
                        notes: updates.notes,
                        recipe_note: updates.recipeNote,
                        nutrition_highlights: updates.nutritionHighlights,
                        is_done: updates.isDone,
                        time: updates.time,
                        calories: updates.calories
                    })
                    .eq('id', mealId);

                if (error) {
                    console.error("Sync Error [updateMeal]:", error);
                    Alert.alert("Sync Issue", "We couldn't save your meal update to the cloud. It will remain on your device for now.");
                }
            },

            upsertMeal: async (weekId: string, dayId: string, definitionId: string, updates: Partial<MealSlot>) => {
                // Compute the new meal state BEFORE set() so the updater remains a pure function.
                const currentDay = get().weeks
                    .find((w: WeekPlan) => w.id === weekId)?.days
                    .find((d: DayPlan) => d.id === dayId);
                const existing = currentDay?.meals.find((m: MealSlot) => m.definitionId === definitionId);
                const mealToSync: MealSlot = existing
                    ? { ...existing, ...updates }
                    : { id: generateId(), definitionId, name: '', isDone: false, ...updates };

                set((state: AppState) => ({
                    weeks: state.weeks.map((week: WeekPlan) =>
                        week.id !== weekId ? week : {
                            ...week,
                            days: week.days.map((day: DayPlan) => {
                                if (day.id !== dayId) return day;
                                const idx = day.meals.findIndex((m: MealSlot) => m.definitionId === definitionId);
                                const meals = idx >= 0
                                    ? day.meals.map((m, i) => i === idx ? mealToSync : m)
                                    : [...day.meals, mealToSync];
                                return { ...day, meals };
                            }),
                        }
                    ),
                }));

                const { error } = await supabase
                    .from('meals')
                    .upsert({
                        id: mealToSync.id,
                        day_id: dayId,
                        definition_id: definitionId,
                        name: mealToSync.name,
                        qty: mealToSync.qty,
                        notes: mealToSync.notes,
                        recipe_note: mealToSync.recipeNote,
                        nutrition_highlights: mealToSync.nutritionHighlights,
                        is_done: mealToSync.isDone,
                        time: mealToSync.time,
                        calories: mealToSync.calories
                    });
                if (error) {
                    console.error("Sync Error [upsertMeal]:", error);
                    Alert.alert("Sync Issue", "We couldn't synchronize this meal slot with your cloud database.");
                }
            },

            addGroceryItem: async (weekId: string, item: any) => {
                const newItem = { ...item, id: generateId(), isChecked: false };

                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: [
                                    ...week.groceryList,
                                    newItem,
                                ],
                            }
                            : week
                    ),
                }));

                const { error } = await supabase
                    .from('grocery_items')
                    .insert({
                        id: newItem.id,
                        week_id: weekId,
                        name: newItem.name,
                        quantity: newItem.quantity,
                        is_checked: newItem.isChecked,
                        category: newItem.category
                    });
                if (error) console.error("Sync Error [addGroceryItem]:", error);
            },

            updateGroceryItem: async (weekId: string, itemId: string, updates: Partial<GroceryItem>) => {
                set((state) => ({
                    weeks: state.weeks.map((week) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.map((item) =>
                                    item.id === itemId ? { ...item, ...updates } : item
                                ),
                            }
                            : week
                    ),
                }));

                const dbUpdates: any = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
                if (updates.category !== undefined) dbUpdates.category = updates.category;
                if (updates.isChecked !== undefined) dbUpdates.is_checked = updates.isChecked;

                const { error } = await supabase
                    .from('grocery_items')
                    .update(dbUpdates)
                    .eq('id', itemId);
                if (error) console.error("Sync Error [updateGroceryItem]:", error);
            },

            toggleGroceryItem: async (weekId: string, itemId: string) => {
                let isChecked = false;
                set((state) => ({
                    weeks: state.weeks.map((week) => {
                        if (week.id !== weekId) return week;
                        const newList = week.groceryList.map((item) => {
                            if (item.id === itemId) {
                                isChecked = !item.isChecked;
                                return { ...item, isChecked: !item.isChecked };
                            }
                            return item;
                        });
                        return { ...week, groceryList: newList };
                    }),
                }));

                const { error } = await supabase
                    .from('grocery_items')
                    .update({ is_checked: isChecked })
                    .eq('id', itemId);
                if (error) console.error("Sync Error [toggleGroceryItem]:", error);
            },

            removeGroceryItem: async (weekId: string, itemId: string) => {
                set((state: AppState) => ({
                    weeks: state.weeks.map((week: WeekPlan) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.filter((item: any) => item.id !== itemId),
                            }
                            : week
                    ),
                }));

                const { error } = await supabase
                    .from('grocery_items')
                    .delete()
                    .eq('id', itemId);
                if (error) console.error("Sync Error [removeGroceryItem]:", error);
            },

            clearGroceryChecks: async (weekId: string) => {
                set((state: AppState) => ({
                    weeks: state.weeks.map((week: WeekPlan) =>
                        week.id === weekId
                            ? {
                                ...week,
                                groceryList: week.groceryList.map((item: any) => ({ ...item, isChecked: false })),
                            }
                            : week
                    ),
                }));

                const { error } = await supabase
                    .from('grocery_items')
                    .update({ is_checked: false })
                    .eq('week_id', weekId);
                if (error) console.error("Sync Error [clearGroceryChecks]:", error);
            },

            toggleCookingSession: async (weekId: string, sessionId: string) => {
                let isCompleted = false;
                set((state) => ({
                    weeks: state.weeks.map((week) => {
                        if (week.id !== weekId) return week;
                        const newPlan = week.cookingPlan.map((session) => {
                            if (session.id === sessionId) {
                                isCompleted = !session.isCompleted;
                                return { ...session, isCompleted: !session.isCompleted };
                            }
                            return session;
                        });
                        return { ...week, cookingPlan: newPlan };
                    }),
                }));

                const { error } = await supabase
                    .from('cooking_sessions')
                    .update({ is_completed: isCompleted })
                    .eq('id', sessionId);
                if (error) console.error("Sync Error [toggleCookingSession]:", error);
            },

            toggleCookItem: async (weekId: string, sessionId: string, itemId: string) => {
                let isCompleted = false;
                set((state) => ({
                    weeks: state.weeks.map((week) => {
                        if (week.id !== weekId) return week;
                        return {
                            ...week,
                            cookingPlan: week.cookingPlan.map((session) => {
                                if (session.id !== sessionId) return session;
                                return {
                                    ...session,
                                    cookItems: session.cookItems.map((item) => {
                                        if (item.id === itemId) {
                                            isCompleted = !item.isCompleted;
                                            return { ...item, isCompleted: !item.isCompleted };
                                        }
                                        return item;
                                    })
                                };
                            })
                        };
                    }),
                }));

                const { error } = await supabase
                    .from('cooking_items')
                    .update({ is_completed: isCompleted })
                    .eq('id', itemId);
                if (error) console.error("Sync Error [toggleCookItem]:", error);
            },

            setActiveWeekOverride: async (weekId: string | null) => {
                set((state) => ({
                    settings: { ...state.settings, activeWeekOverride: weekId },
                }));

                const { error } = await supabase
                    .from('app_settings')
                    .update({ active_week_override: weekId })
                    .eq('id', 1);
                if (error) console.error("Sync Error [setActiveWeekOverride]:", error);
            },

            toggleGroceryReminders: async (enabled: boolean) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        isGroceryReminderEnabled: enabled,
                    },
                }));

                if (enabled) {
                    const granted = await requestNotificationPermissionsAsync();
                    if (granted) {
                        scheduleAllReminders(
                            get().settings.mealDefinitions,
                            true,
                            get().settings.groceryReminderDay,
                            get().settings.groceryReminderTime
                        );
                    } else {
                        set((state) => ({
                            settings: {
                                ...state.settings,
                                isGroceryReminderEnabled: false,
                            },
                        }));
                        Alert.alert("Permission Denied", "Please enable notifications in your device settings.");
                    }
                } else {
                    scheduleAllReminders(
                        get().settings.mealDefinitions,
                        false,
                        get().settings.groceryReminderDay,
                        get().settings.groceryReminderTime
                    );
                }

                const { error } = await supabase
                    .from('app_settings')
                    .update({ is_grocery_reminder_enabled: enabled })
                    .eq('id', 1);
                if (error) console.error("Sync Error [toggleGroceryReminders]:", error);
            },

            updateGroceryReminderSettings: async (updates) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        ...updates,
                    },
                }));

                const s = get().settings;
                if (s.isGroceryReminderEnabled) {
                    scheduleAllReminders(
                        s.mealDefinitions,
                        true,
                        s.groceryReminderDay,
                        s.groceryReminderTime
                    );
                }

                const { error } = await supabase
                    .from('app_settings')
                    .update({
                        grocery_reminder_day: s.groceryReminderDay,
                        grocery_reminder_time: s.groceryReminderTime
                    })
                    .eq('id', 1);
                if (error) console.error("Sync Error [updateGroceryReminderSettings]:", error);
            },

            addMealDefinition: async (def) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: [...state.settings.mealDefinitions, def],
                    },
                }));

                if (get().settings.isGroceryReminderEnabled) {
                    const s = get().settings;
                    scheduleAllReminders(s.mealDefinitions, true, s.groceryReminderDay, s.groceryReminderTime);
                }

                const { error } = await supabase
                    .from('meal_definitions')
                    .insert({
                        id: def.id,
                        name: def.name,
                        default_time: def.defaultTime,
                        notify: def.notify
                    });
                if (error) console.error("Sync Error [addMealDefinition]:", error);
            },

            updateMealDefinition: async (defId: string, updates: any) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: state.settings.mealDefinitions.map(def =>
                            def.id === defId ? { ...def, ...updates } : def
                        ),
                    },
                }));

                if (get().settings.isGroceryReminderEnabled) {
                    const s = get().settings;
                    scheduleAllReminders(s.mealDefinitions, true, s.groceryReminderDay, s.groceryReminderTime);
                }

                const { error } = await supabase
                    .from('meal_definitions')
                    .update({
                        name: updates.name,
                        default_time: updates.defaultTime,
                        notify: updates.notify
                    })
                    .eq('id', defId);
                if (error) console.error("Sync Error [updateMealDefinition]:", error);
            },

            removeMealDefinition: async (defId: string) => {
                const newDefs = get().settings.mealDefinitions.filter(def => def.id !== defId);
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mealDefinitions: newDefs,
                    },
                }));

                if (get().settings.isGroceryReminderEnabled) {
                    const s = get().settings;
                    scheduleAllReminders(newDefs, true, s.groceryReminderDay, s.groceryReminderTime);
                }

                const { error } = await supabase
                    .from('meal_definitions')
                    .delete()
                    .eq('id', defId);
                if (error) console.error("Sync Error [removeMealDefinition]:", error);
            },

            initialize: async () => {
                try {
                    // 1. Fetch Weeks
                    const { data: weeksData, error: weeksError } = await supabase
                        .from('weeks')
                        .select(`
                            *,
                            grocery_items (*),
                            cooking_sessions (
                                *,
                                cooking_items (*)
                            ),
                            days (
                                *,
                                meals (*)
                            )
                        `)
                        .order('index', { ascending: true });

                    if (weeksError) throw weeksError;

                    // 2. Fetch Settings
                    const { data: settingsData, error: settingsError } = await supabase
                        .from('app_settings')
                        .select('*')
                        .maybeSingle();

                    if (settingsError) throw settingsError;

                    // 3. Fetch Definitions
                    const { data: defsData, error: defsError } = await supabase
                        .from('meal_definitions')
                        .select('*')
                        .order('created_at', { ascending: true });

                    if (defsError) throw defsError;

                    // 4. Fetch Plan Meta
                    const { data: metaData, error: metaError } = await supabase
                        .from('plan_meta')
                        .select('*')
                        .maybeSingle();

                    if (metaError) throw metaError;

                    // 5. Map to State
                    if ((weeksData?.length ?? 0) === 0 && (defsData?.length ?? 0) === 0) {
                        console.log("No data found in Supabase. Keeping current state.");
                        return;
                    }

                    const mappedWeeks: WeekPlan[] = (weeksData || []).map(w => ({
                        id: w.id,
                        label: w.label,
                        groceryList: (w.grocery_items || []).map((g: any) => ({
                            id: g.id,
                            name: g.name,
                            quantity: g.quantity,
                            category: g.category,
                            isChecked: g.is_checked
                        })),
                        cookingPlan: (w.cooking_sessions || []).map((c: any) => ({
                            id: c.id,
                            sessionType: c.session_type,
                            day: c.day,
                            dayIndex: c.day_index,
                            label: c.label,
                            estimatedDuration: c.estimated_duration,
                            bestTime: c.best_time,
                            kitchenNote: c.kitchen_note,
                            cookItems: (c.cooking_items || []).map((item: any) => ({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                quantity: item.quantity,
                                cookMethod: item.cook_method,
                                instructions: item.instructions,
                                portionInto: item.portion_into,
                                portionSize: item.portion_size,
                                storageType: item.storage_type,
                                storageDays: item.storage_days,
                                storageNote: item.storage_note,
                                usage: item.usage || [],
                                isCompleted: item.is_completed || false
                            })),
                            prepAhead: c.prep_ahead || [],
                            equipmentNeeded: c.equipment_needed || [],
                            isCompleted: c.is_completed
                        })),
                        days: (w.days || []).sort((a: any, b: any) => a.day_index - b.day_index).map((d: any) => ({
                            id: d.id,
                            dayOfWeek: d.day_of_week,
                            dayIndex: d.day_index,
                            totalCalories: d.total_calories,
                            meals: (d.meals || []).map((m: any) => ({
                                id: m.id,
                                definitionId: m.definition_id,
                                name: m.name,
                                qty: m.qty,
                                notes: m.notes,
                                recipeNote: m.recipe_note,
                                nutritionHighlights: m.nutrition_highlights,
                                isDone: m.is_done,
                                time: m.time,
                                calories: m.calories
                            }))
                        })),
                        theme: w.theme
                    }));

                    set({
                        weeks: mappedWeeks.length > 0 ? mappedWeeks : get().weeks,
                        planMeta: metaData ? {
                            purpose: metaData.purpose,
                            gender: metaData.gender,
                            age: metaData.age,
                            location: metaData.location,
                            currentWeight_kg: metaData.current_weight_kg,
                            targetWeight_kg: metaData.target_weight_kg,
                            timeline: metaData.timeline,
                            activityLevel: metaData.activity_level,
                            skinNotes: metaData.skin_notes,
                            dailyCalorieTarget: metaData.daily_calorie_target,
                            dailyProteinTarget_g: metaData.daily_protein_target_g,
                            mealsPerDay: metaData.meals_per_day
                        } : get().planMeta,
                        settings: {
                            isGroceryReminderEnabled: settingsData?.is_grocery_reminder_enabled ?? get().settings.isGroceryReminderEnabled,
                            groceryReminderDay: settingsData?.grocery_reminder_day ?? get().settings.groceryReminderDay,
                            groceryReminderTime: settingsData?.grocery_reminder_time ?? get().settings.groceryReminderTime,
                            activeWeekOverride: settingsData?.active_week_override ?? get().settings.activeWeekOverride,
                            mealDefinitions: (defsData || []).length > 0
                                ? (defsData || []).map(d => ({
                                    id: d.id,
                                    name: d.name,
                                    defaultTime: d.default_time,
                                    notify: d.notify
                                }))
                                : get().settings.mealDefinitions
                        }
                    });

                    // Initial schedule of reminders if enabled
                    if (settingsData?.is_grocery_reminder_enabled || get().settings.isGroceryReminderEnabled) {
                        const s = get().settings;
                        scheduleAllReminders(s.mealDefinitions, true, s.groceryReminderDay, s.groceryReminderTime);
                    }

                } catch (err) {
                    console.error("Initialization Error:", err);
                }
            },


            importData: async (data: any) => {
                const newState: Partial<AppState> = {};

                // 0. Import Plan Meta
                if (data && data.meta) {
                    newState.planMeta = {
                        purpose: data.meta.purpose,
                        gender: data.meta.gender,
                        age: data.meta.age,
                        location: data.meta.location,
                        currentWeight_kg: data.meta.currentWeight_kg,
                        targetWeight_kg: data.meta.targetWeight_kg,
                        timeline: data.meta.timeline,
                        activityLevel: data.meta.activityLevel,
                        skinNotes: data.meta.skinNotes,
                        dailyCalorieTarget: data.meta.dailyCalorieTarget,
                        dailyProteinTarget_g: data.meta.dailyProteinTarget_g,
                        mealsPerDay: data.meta.mealsPerDay
                    };
                }

                // 1. Import Settings / Definitions
                if (data && data.settings && Array.isArray(data.settings.mealDefinitions)) {
                    newState.settings = {
                        ...get().settings,
                        mealDefinitions: data.settings.mealDefinitions.map((d: any) => ({
                            id: d.id || generateId(),
                            name: d.name,
                            defaultTime: d.defaultTime,
                            notify: d.notify || false
                        }))
                    };
                }

                // 2. Import Weeks
                if (data && Array.isArray(data.weeks)) {
                    // Create a deep copy of INITIAL_WEEKS to prevent any shallow references
                    const newWeeks = JSON.parse(JSON.stringify(INITIAL_WEEKS));

                    data.weeks.forEach((importedWeek: any, index: number) => {
                        if (index > 3) return;

                        const mergedDays = newWeeks[index].days.map((emptyDay: any) => {
                            const importedDay = importedWeek.days?.find((d: any) => d.dayIndex === emptyDay.dayIndex);
                            if (!importedDay) return emptyDay;

                            // Carefully map imported meals perfectly
                            const importedMeals = (importedDay.meals || []).map((m: any) => ({
                                id: generateId(), // New clean ID for local state (we wiped DB)
                                definitionId: m.definitionId,
                                name: m.name,
                                qty: m.qty,
                                notes: m.notes,
                                recipeNote: m.recipeNote,
                                nutritionHighlights: m.nutritionHighlights,
                                isDone: m.isDone || false,
                                // Use undefined (not '') so the display falls back to def.defaultTime cleanly
                                time: m.time || undefined,
                                // JSON stores calories as number; normalise to string to match the MealSlot type
                                calories: m.calories != null ? String(m.calories) : ''
                            }));

                            // Maintain the stable emptyDay.id (week-x-day-y) to prevent random duplicate rows
                            return {
                                ...emptyDay,
                                totalCalories: importedDay.totalCalories,
                                meals: importedMeals
                            };
                        });

                        const importedGroceries = (importedWeek.groceryList || []).map((g: any) => ({
                            id: generateId(),
                            name: g.name,
                            category: g.category || 'Uncategorized',
                            quantity: g.estimatedQty || g.quantity || '',
                            isChecked: g.isChecked || false
                        }));

                        const importedCookingPlan = (importedWeek.cookingSessions || []).map((c: any) => ({
                            id: c.id || generateId(),
                            sessionType: c.sessionType || 'primary',
                            day: c.day || 'Sunday',
                            dayIndex: c.dayIndex ?? 6,
                            label: c.label || 'Cooking Session',
                            estimatedDuration: c.estimatedDuration || '',
                            bestTime: c.bestTime || '',
                            kitchenNote: c.kitchenNote || '',
                            cookItems: (c.cookItems || []).map((item: any) => ({
                                id: item.id || generateId(),
                                name: item.name,
                                category: item.category,
                                quantity: item.quantity,
                                cookMethod: item.cookMethod,
                                instructions: item.instructions,
                                usage: (item.usedInMeals || item.usage || []).map((u: any) => ({
                                    day: u.day,
                                    mealSlot: u.mealSlot,
                                    use: u.use
                                })),
                                portionInto: item.portionInto,
                                portionSize: item.portionSize,
                                storageType: item.storageType,
                                storageDays: item.storageDays,
                                storageNote: item.storageNote,
                                isCompleted: item.isCompleted || false
                            })),
                            prepAhead: Array.isArray(c.prepAhead) ? c.prepAhead : [],
                            equipmentNeeded: Array.isArray(c.equipmentNeeded) ? c.equipmentNeeded : [],
                            isCompleted: c.isCompleted || false
                        }));

                        newWeeks[index] = {
                            ...newWeeks[index],
                            label: importedWeek.label || newWeeks[index].label,
                            theme: importedWeek.theme,
                            days: mergedDays,
                            groceryList: importedGroceries,
                            cookingPlan: importedCookingPlan
                        };
                    });
                    newState.weeks = newWeeks;
                }

                if (Object.keys(newState).length > 0) {
                    // Pre-emptively update UI so it feels instant
                    set((state) => ({ ...state, ...newState }));

                    // --- SUPABASE BULK SYNC (DESTRUCTIVE CLEANUP FIRST) ---
                    try {
                        // WIPE EXISTING GHOST DAYS AND MEALS!
                        await supabase.from('meals').delete().not('id', 'is', null);
                        await supabase.from('days').delete().not('id', 'is', null);
                        await supabase.from('cooking_sessions').delete().not('id', 'is', null);
                        await supabase.from('plan_meta').delete().not('id', 'is', null);

                        const finalWeeks = newState.weeks || get().weeks;
                        const finalSettings = newState.settings || get().settings;
                        const finalMeta = newState.planMeta || get().planMeta;

                        // 1. Sync Definitions
                        if (finalSettings.mealDefinitions.length > 0) {
                            await supabase.from('meal_definitions').upsert(
                                finalSettings.mealDefinitions.map(d => ({
                                    id: d.id,
                                    name: d.name,
                                    default_time: d.defaultTime,
                                    notify: d.notify
                                }))
                            );
                        }

                        // 2. Sync Weeks
                        await supabase.from('weeks').upsert(
                            finalWeeks.map(w => ({
                                id: w.id,
                                label: w.label,
                                theme: w.theme,
                                index: parseInt(w.id.split('-')[1]) || 0
                            }))
                        );

                        // 3. Sync Days cleanly (Unique stable ID)
                        const allDays = finalWeeks.flatMap(w => w.days.map(d => ({
                            id: d.id,
                            week_id: w.id,
                            day_index: d.dayIndex,
                            day_of_week: d.dayOfWeek,
                            total_calories: d.totalCalories
                        })));
                        await supabase.from('days').upsert(allDays);

                        // 4. Sync Meals cleanly
                        const allMeals = finalWeeks.flatMap(w =>
                            w.days.flatMap(d =>
                                d.meals.map(m => ({
                                    id: m.id,
                                    day_id: d.id,
                                    definition_id: m.definitionId,
                                    name: m.name,
                                    qty: m.qty,
                                    notes: m.notes,
                                    recipe_note: m.recipeNote,
                                    nutrition_highlights: m.nutritionHighlights,
                                    is_done: m.isDone,
                                    time: m.time,
                                    calories: m.calories
                                }))
                            )
                        );
                        if (allMeals.length > 0) {
                            await supabase.from('meals').upsert(allMeals);
                        }

                        // 5. Sync Groceries
                        await supabase.from('grocery_items').delete().not('id', 'is', null);
                        const allGroceries = finalWeeks.flatMap(w =>
                            w.groceryList.map(g => ({
                                id: g.id,
                                week_id: w.id,
                                name: g.name,
                                quantity: g.quantity || '',
                                category: g.category || 'Uncategorized',
                                is_checked: g.isChecked
                            }))
                        );
                        if (allGroceries.length > 0) {
                            const { error: gErr } = await supabase.from('grocery_items').upsert(allGroceries);
                            if (gErr) console.error("Sync Error [import Groceries]:", gErr);
                        }

                        // 6. Sync Settings
                        const { error: sErr } = await supabase.from('app_settings').upsert({
                            id: 1,
                            is_grocery_reminder_enabled: finalSettings.isGroceryReminderEnabled,
                            grocery_reminder_day: finalSettings.groceryReminderDay,
                            grocery_reminder_time: finalSettings.groceryReminderTime,
                            active_week_override: finalSettings.activeWeekOverride
                        });
                        if (sErr) throw sErr;

                        // 7. Sync Plan Meta
                        if (finalMeta && Object.keys(finalMeta).length > 0) {
                            const { error: mErr } = await supabase.from('plan_meta').upsert({
                                id: 1,
                                purpose: finalMeta.purpose,
                                gender: finalMeta.gender,
                                age: finalMeta.age,
                                location: finalMeta.location,
                                current_weight_kg: finalMeta.currentWeight_kg,
                                target_weight_kg: finalMeta.targetWeight_kg,
                                timeline: finalMeta.timeline,
                                activity_level: finalMeta.activityLevel,
                                skin_notes: finalMeta.skinNotes,
                                daily_calorie_target: finalMeta.dailyCalorieTarget,
                                daily_protein_target_g: finalMeta.dailyProteinTarget_g,
                                meals_per_day: finalMeta.mealsPerDay
                            });
                            if (mErr) console.error("Sync Error [import PlanMeta]:", mErr);
                        }

                        // 8. Sync Cooking Sessions & Items
                        const allCooking = finalWeeks.flatMap(w =>
                            w.cookingPlan.map(c => ({
                                id: c.id,
                                week_id: w.id,
                                session_type: c.sessionType,
                                day: c.day,
                                day_index: c.dayIndex,
                                label: c.label,
                                estimated_duration: c.estimatedDuration,
                                best_time: c.bestTime,
                                kitchen_note: c.kitchenNote,
                                prep_ahead: c.prepAhead,
                                equipment_needed: c.equipmentNeeded,
                                is_completed: c.isCompleted
                            }))
                        );

                        const allCookingItems = finalWeeks.flatMap(w =>
                            w.cookingPlan.flatMap(c =>
                                c.cookItems.map(item => ({
                                    id: item.id,
                                    session_id: c.id,
                                    name: item.name,
                                    category: item.category,
                                    quantity: item.quantity,
                                    cook_method: item.cookMethod,
                                    instructions: item.instructions,
                                    portion_into: item.portionInto,
                                    portion_size: item.portionSize,
                                    storage_type: item.storageType,
                                    storage_days: item.storageDays,
                                    storage_note: item.storageNote,
                                    usage: item.usage,
                                    is_completed: item.isCompleted || false
                                }))
                            )
                        );

                        if (allCooking.length > 0) {
                            const { error: cErr } = await supabase.from('cooking_sessions').upsert(allCooking);
                            if (cErr) console.error("Sync Error [import CookingSessions]:", cErr);

                            // Delete old items first to ensure a clean state
                            const sessionIds = allCooking.map(s => s.id);
                            await supabase.from('cooking_items').delete().in('session_id', sessionIds);

                            // Insert new items
                            if (allCookingItems.length > 0) {
                                const { error: ciErr } = await supabase.from('cooking_items').insert(allCookingItems);
                                if (ciErr) console.error("Sync Error [import CookingItems]:", ciErr);
                            }
                        }

                        console.log("Bulk sync completed successfully, DB wiped and rewritten.");

                    } catch (err) {
                        console.error("Bulk Import Sync Error:", err);
                        Alert.alert(
                            "Import Sync Issue",
                            "The data was imported to your device, but we had trouble uploading it to the cloud. It will stay on this device only until you try again."
                        );
                    }
                }
            },

            updateDay: async (weekId: string, dayId: string, updates: Partial<DayPlan>) => {
                set((state: AppState) => ({
                    weeks: state.weeks.map((week: WeekPlan) =>
                        week.id === weekId
                            ? {
                                ...week,
                                days: week.days.map((day: DayPlan) =>
                                    day.id === dayId ? { ...day, ...updates } : day
                                ),
                            }
                            : week
                    ),
                }));

                const { error } = await supabase
                    .from('days')
                    .update({
                        total_calories: updates.totalCalories,
                    })
                    .eq('id', dayId);

                if (error) {
                    console.error("Sync Error [updateDay]:", error);
                }
            },

            resetData: async () => {
                // 1. Optimistic local reset
                set({
                    weeks: INITIAL_WEEKS,
                    settings: {
                        isGroceryReminderEnabled: false,
                        groceryReminderDay: 5,
                        groceryReminderTime: '09:00',
                        activeWeekOverride: null,
                        mealDefinitions: [],
                    },
                    planMeta: {}
                });

                // 2. Supabase Cloud Reset — delete in FK order (children before parents)
                try {
                    await supabase.from('meals').delete().not('id', 'is', null);
                    await supabase.from('cooking_items').delete().not('id', 'is', null);
                    await supabase.from('cooking_sessions').delete().not('id', 'is', null);
                    await supabase.from('grocery_items').delete().not('id', 'is', null);
                    await supabase.from('days').delete().not('id', 'is', null);
                    await supabase.from('meal_definitions').delete().not('id', 'is', null);
                    await supabase.from('app_settings').delete().eq('id', 1);
                    await supabase.from('plan_meta').delete().eq('id', 1);
                } catch (err) {
                    console.error("Cloud Reset Error:", err);
                }
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
