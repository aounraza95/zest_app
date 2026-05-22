import { DayPlan, MealSlot } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useActiveWeek } from '@/hooks/useActiveWeek';
import { ZestIcon } from '@/components/ZestIcon';
import { getDayIndexStart, getDaysForWeek, getStartOfCurrentWeek } from '@/utils/dateHelpers';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format, isSameDay } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export default function MealsScreen() {
    const { settings, updateMeal, upsertMeal } = useAppStore();
    const activeWeek = useActiveWeek();
    const isPlanReady = !!activeWeek && !!activeWeek.days;

    const startOfWeek = getStartOfCurrentWeek();
    const weekDates = getDaysForWeek(startOfWeek);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMeal, setSelectedMeal] = useState<MealSlot | null>(null);

    const isDateToday = isSameDay(selectedDate, new Date());
    const selectedDayIndex = getDayIndexStart(selectedDate);
    const targetDayName = format(selectedDate, 'EEEE');

    const activeDayPlan: DayPlan | undefined =
        activeWeek?.days?.find((d: DayPlan) => d.dayOfWeek === targetDayName) ??
        activeWeek?.days?.find((d: DayPlan) => d.dayIndex === selectedDayIndex);

    // Sorted meal definitions + active "Now" slot
    const { sortedDefs, activeSlotId } = useMemo(() => {
        if (!activeDayPlan) return { sortedDefs: [], activeSlotId: null as string | null };

        const defs = [...(settings.mealDefinitions ?? [])].sort((a, b) => {
            const tA = activeDayPlan.meals.find(m => m.definitionId === a.id)?.time ?? a.defaultTime ?? '00:00';
            const tB = activeDayPlan.meals.find(m => m.definitionId === b.id)?.time ?? b.defaultTime ?? '00:00';
            return tA.localeCompare(tB);
        });

        const now = format(new Date(), 'HH:mm');
        let slot: string | null = defs[0]?.id ?? null;
        for (const def of defs) {
            const t = activeDayPlan.meals.find(m => m.definitionId === def.id)?.time ?? def.defaultTime ?? '00:00';
            if (now >= t) slot = def.id;
            else break;
        }

        return { sortedDefs: defs, activeSlotId: slot };
    }, [activeDayPlan, settings.mealDefinitions]);

    // Daily completion stats
    const doneMeals = useMemo(
        () => (activeDayPlan?.meals ?? []).filter(m => m.isDone).length,
        [activeDayPlan],
    );
    const totalMeals = sortedDefs.length;
    const progressPct = totalMeals > 0 ? (doneMeals / totalMeals) * 100 : 0;

    const handleToggle = (meal: MealSlot | undefined, defId: string, isDone: boolean) => {
        if (!isDateToday || !activeWeek || !activeDayPlan) return;
        if (meal) {
            updateMeal(activeWeek.id, activeDayPlan.id, meal.id, { isDone: !isDone });
        } else {
            upsertMeal(activeWeek.id, activeDayPlan.id, defId, { isDone: true });
        }
    };

    return (
        <View className="flex-1 bg-gray-50">

            {/* ══ Type A — Emerald Hero Header ══════════════════════════════════ */}
            <View className="bg-emerald-500 pt-16 pb-6 px-6 rounded-b-3xl shadow-lg shadow-emerald-200">
                {/* Top row: logo + week label | view-only badge */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                        <ZestIcon size={36} />
                        <View>
                            <Text className="text-emerald-100 font-black uppercase tracking-widest text-[9px]">
                                {activeWeek?.label ?? 'Zest'} Plan
                            </Text>
                            {!!activeWeek?.theme && (
                                <Text className="text-emerald-50 text-[10px] font-medium italic" numberOfLines={1}>
                                    {activeWeek.theme}
                                </Text>
                            )}
                        </View>
                    </View>

                    {!isDateToday && (
                        <View className="bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
                            <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                                View only
                            </Text>
                        </View>
                    )}
                </View>

                {/* Day name + date | calorie target */}
                <View className="flex-row justify-between items-end mb-4">
                    <View>
                        <Text className="text-white text-3xl font-black tracking-tight">
                            {format(selectedDate, 'EEEE')}
                        </Text>
                        <Text className="text-emerald-100 text-base font-medium">
                            {format(selectedDate, 'MMMM do')}
                        </Text>
                    </View>

                    {!!activeDayPlan?.totalCalories && (
                        <View className="items-end">
                            <Text className="text-white font-black text-2xl leading-none">
                                {activeDayPlan.totalCalories}
                            </Text>
                            <Text className="text-emerald-100 text-[9px] font-black uppercase tracking-wider">
                                kcal target
                            </Text>
                        </View>
                    )}
                </View>

                {/* Daily progress bar — today only */}
                {isDateToday && totalMeals > 0 && (
                    <View>
                        <View className="flex-row justify-between items-center mb-1.5">
                            <Text className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                Today's Progress
                            </Text>
                            <Text className="text-white text-[10px] font-black">
                                {doneMeals}/{totalMeals} meals
                            </Text>
                        </View>
                        <View className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progressPct}%` }}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* ══ Week Calendar Strip ════════════════════════════════════════════ */}
            <View className="mt-4 mb-2">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}
                >
                    <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 24, padding: 4 }}>
                        {weekDates.map((date, index) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());
                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => setSelectedDate(date)}
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 48,
                                        height: 64,
                                        borderRadius: 20,
                                        backgroundColor: isSelected ? '#10B981' : 'transparent',
                                        marginRight: index === weekDates.length - 1 ? 0 : 4,
                                        shadowColor: '#10B981',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isSelected ? 0.3 : 0,
                                        shadowRadius: 8,
                                        elevation: isSelected ? 4 : 0,
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        marginBottom: 2,
                                        color: isSelected ? '#FFFFFF' : '#9CA3AF',
                                    }}>
                                        {format(date, 'EEE')}
                                    </Text>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        color: isSelected ? '#FFFFFF' : '#1F2937',
                                    }}>
                                        {format(date, 'd')}
                                    </Text>
                                    {isToday && !isSelected && (
                                        <View style={{
                                            position: 'absolute',
                                            bottom: 8,
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: '#10B981',
                                        }} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* ══ Main Content ══════════════════════════════════════════════════ */}
            {!isPlanReady ? (
                <View className="flex-1 items-center justify-center opacity-50">
                    <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-5">
                        <FontAwesome name="calendar-o" size={32} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-900 font-black text-lg mb-2">No plan loaded</Text>
                    <Text className="text-gray-400 text-sm text-center px-10 leading-relaxed">
                        Import a meal plan from Settings to see your daily meals here.
                    </Text>
                </View>
            ) : (
                <View
                    key={selectedDate.toISOString()}
                    className="flex-1 px-4 pt-4"
                >
                    {/* Section label */}
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {activeDayPlan?.dayOfWeek ?? 'Select Day'}'s Menu
                        </Text>
                        {!isDateToday && (
                            <View className="flex-row items-center gap-1">
                                <FontAwesome name="lock" size={9} color="#9CA3AF" />
                                <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                    View only
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ── Meal Detail Modal ───────────────────────────────────── */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={!!selectedMeal}
                        onRequestClose={() => setSelectedMeal(null)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <Pressable className="flex-1" onPress={() => setSelectedMeal(null)} />

                            <View className="bg-white rounded-t-[40px] p-8 shadow-2xl max-h-[85%]">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Drag handle */}
                                    <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                                    {/* Header row */}
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Meal Details
                                        </Text>
                                        {!!selectedMeal?.calories && (
                                            <View className="bg-emerald-50 px-2.5 py-1 rounded-xl">
                                                <Text className="text-emerald-600 text-xs font-black">
                                                    {selectedMeal.calories} kcal
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                                        {selectedMeal?.name}
                                    </Text>

                                    {!!selectedMeal?.qty && (
                                        <Text className="text-gray-500 text-base font-medium mb-5">
                                            {selectedMeal.qty}
                                        </Text>
                                    )}

                                    {/* Nutrition tags */}
                                    {(selectedMeal?.nutritionHighlights ?? []).length > 0 && (
                                        <View className="flex-row flex-wrap gap-2 mb-6">
                                            {selectedMeal!.nutritionHighlights!.map((tag, idx) => (
                                                <View key={idx} className="bg-emerald-100/50 px-3 py-1 rounded-full">
                                                    <Text className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                                        {tag}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Recipe block */}
                                    {!!selectedMeal?.recipeNote && (
                                        <View className="bg-emerald-50 p-6 rounded-3xl mb-4 border border-emerald-100">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <FontAwesome name="cutlery" size={16} color="#10B981" />
                                                <Text className="text-emerald-800 font-black text-xs uppercase tracking-wider">
                                                    Recipe / Instructions
                                                </Text>
                                            </View>
                                            <Text className="text-gray-700 leading-relaxed text-base">
                                                {selectedMeal.recipeNote}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Tips block */}
                                    {!!selectedMeal?.notes && (
                                        <View className="bg-amber-50 p-6 rounded-3xl mb-6 border border-amber-100">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <FontAwesome name="lightbulb-o" size={16} color="#D97706" />
                                                <Text className="text-amber-800 font-black text-xs uppercase tracking-wider">
                                                    Tips & Notes
                                                </Text>
                                            </View>
                                            <Text className="text-gray-700 leading-relaxed text-base">
                                                {selectedMeal.notes}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Fallback */}
                                    {!selectedMeal?.recipeNote && !selectedMeal?.notes && (
                                        <View className="bg-gray-50 p-6 rounded-3xl mb-6 border border-gray-100 items-center">
                                            <Text className="text-gray-400 font-medium italic">
                                                No specific details for this meal.
                                            </Text>
                                        </View>
                                    )}

                                    <Pressable
                                        onPress={() => setSelectedMeal(null)}
                                        className="bg-emerald-500 py-4 rounded-2xl items-center mb-8 active:bg-emerald-600"
                                        style={{
                                            shadowColor: '#10B981',
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            shadowOffset: { width: 0, height: 4 },
                                            elevation: 4,
                                        }}
                                    >
                                        <Text className="text-white font-bold text-lg">Got it!</Text>
                                    </Pressable>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    {/* ── Meal List ─────────────────────────────────────────────── */}
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {!activeDayPlan || sortedDefs.length === 0 ? (
                            <View className="items-center justify-center mt-16 opacity-50">
                                <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                                    <FontAwesome name="cutlery" size={24} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-500 font-bold text-base">No meals for this day</Text>
                            </View>
                        ) : (
                            sortedDefs.map(def => {
                                const meal = activeDayPlan.meals.find(m => m.definitionId === def.id);
                                const isDone = meal?.isDone ?? false;
                                const mealTime = meal?.time ?? def.defaultTime ?? '00:00';
                                const isCurrentMeal = isDateToday && activeSlotId === def.id;
                                const hasDetail = !!(meal?.recipeNote || meal?.notes);

                                return (
                                    <Pressable
                                        key={def.id}
                                        onPress={() => meal && setSelectedMeal(meal)}
                                        style={{ opacity: isDone ? 0.6 : !isDateToday ? 0.82 : 1 }}
                                        className={`bg-white rounded-2xl mb-4 overflow-hidden ${
                                            isCurrentMeal
                                                ? 'border-2 border-emerald-500'
                                                : 'border border-gray-100'
                                        }`}
                                    >
                                        {/* "Now" banner — replaces floating pill, no z-index hacks */}
                                        {isCurrentMeal && (
                                            <View className="bg-emerald-500 px-4 py-1.5 flex-row items-center gap-2">
                                                <View
                                                    className="w-1.5 h-1.5 rounded-full bg-white"
                                                    style={{ opacity: 0.75 }}
                                                />
                                                <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                                                    Now · Current Meal
                                                </Text>
                                            </View>
                                        )}

                                        <View className="flex-row items-center px-4 py-4 gap-3">
                                            {/* Checkbox */}
                                            <Pressable
                                                onPress={() => handleToggle(meal, def.id, isDone)}
                                                hitSlop={8}
                                                disabled={!isDateToday}
                                                className={`w-8 h-8 rounded-full border-2 items-center justify-center flex-shrink-0 ${
                                                    isDone
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : !isDateToday
                                                        ? 'border-gray-100 bg-white'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                {isDone && <FontAwesome name="check" size={14} color="white" />}
                                            </Pressable>

                                            {/* Content */}
                                            <View className="flex-1">
                                                {/* Slot name + time */}
                                                <View className="flex-row justify-between items-center mb-0.5">
                                                    <Text className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                        {def.name}
                                                    </Text>
                                                    <Text className="text-gray-400 text-[10px] font-bold">
                                                        {mealTime}
                                                    </Text>
                                                </View>

                                                {/* Meal name */}
                                                <Text
                                                    className={`text-base font-bold leading-snug ${
                                                        isDone ? 'text-gray-300' : 'text-gray-900'
                                                    }`}
                                                    style={{ textDecorationLine: isDone ? 'line-through' : 'none' }}
                                                    numberOfLines={2}
                                                >
                                                    {meal?.name ?? 'Not planned'}
                                                </Text>

                                                {/* Quantity */}
                                                {!!meal?.qty && (
                                                    <Text
                                                        className={`text-xs mt-0.5 ${
                                                            isDone ? 'text-gray-300' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {meal.qty}
                                                    </Text>
                                                )}

                                                {/* Calories + nutrition chips */}
                                                {(!!meal?.calories || (meal?.nutritionHighlights ?? []).length > 0) && (
                                                    <View className="flex-row items-center gap-1.5 mt-2 flex-wrap">
                                                        {!!meal?.calories && (
                                                            <View className="bg-emerald-50 px-2 py-0.5 rounded-lg">
                                                                <Text className="text-emerald-600 text-[10px] font-black uppercase">
                                                                    {meal.calories} kcal
                                                                </Text>
                                                            </View>
                                                        )}
                                                        {(meal?.nutritionHighlights ?? []).slice(0, 3).map((tag, i) => (
                                                            <View key={i} className="bg-gray-100 px-1.5 py-0.5 rounded">
                                                                <Text className="text-gray-400 text-[8px] font-black uppercase">
                                                                    {tag}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>

                                            {/* Chevron — only when tapping will show real content */}
                                            {hasDetail && (
                                                <FontAwesome name="chevron-right" size={10} color="#D1D5DB" />
                                            )}
                                        </View>
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}
