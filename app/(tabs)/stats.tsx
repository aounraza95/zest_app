import { useAppStore } from '@/store/useAppStore';
import { useActiveWeek } from '@/hooks/useActiveWeek';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SHORT_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MAX_BAR_PX = 76;

const valToBarPx = (val: number, maxVal: number): number => {
    if (maxVal === 0 || val === 0) return 3;
    return Math.max(Math.round((val / maxVal) * MAX_BAR_PX), 6);
};

const completionColor = (pct: number): string =>
    pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : pct > 0 ? '#D1D5DB' : '#F3F4F6';

const progressColor = (pct: number): string =>
    pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#E5E7EB';

const pctLabel = (pct: number): string =>
    pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-gray-400';

export default function StatsScreen() {
    const { weeks, planMeta } = useAppStore();
    const activeWeek = useActiveWeek();
    const [selectedWeekId, setSelectedWeekId] = useState<string>(activeWeek?.id ?? '');

    const selectedWeek = useMemo(() => {
        if (!weeks || weeks.length === 0) return activeWeek;
        return weeks.find(w => w.id === selectedWeekId) ?? activeWeek ?? weeks[0];
    }, [weeks, selectedWeekId, activeWeek]);

    const isCurrentWeek = useMemo(
        () => !!selectedWeek && !!activeWeek && selectedWeek.id === activeWeek.id,
        [selectedWeek, activeWeek]
    );

    const todayIdx = useMemo(() => (new Date().getDay() + 6) % 7, []);
    const calorieTarget = planMeta?.dailyCalorieTarget ?? 0;

    // ── Today's snapshot — always live from the active week ───────────────────
    const todayStats = useMemo(() => {
        const todayDay = activeWeek?.days?.find(d => d.dayIndex === todayIdx);
        if (!todayDay) return { consumed: 0, target: calorieTarget, mealsDone: 0, mealsTotal: 0 };
        const planned = (todayDay.meals ?? []).filter(m => m?.name?.trim());
        const done = planned.filter(m => m.isDone);
        const consumed = done.reduce((s, m) => s + (parseInt(m.calories || '0') || 0), 0);
        return {
            consumed,
            target: todayDay.totalCalories || calorieTarget,
            mealsDone: done.length,
            mealsTotal: planned.length,
        };
    }, [activeWeek, todayIdx, calorieTarget]);

    // ── Stats for the selected week ───────────────────────────────────────────
    const weekStats = useMemo(() => {
        if (!selectedWeek) return {
            totalMeals: 0, completedMeals: 0, adherence: 0, perfectDays: 0,
            streak: 0, dailyData: [], maxPlanCount: 1, topHighlights: [],
            hasPlanData: false, totalPlanned: 0, totalPlannedCalories: 0,
            plannedDaysWithMeals: 0, totalGrocery: 0, checkedGrocery: 0,
            totalSessions: 0, doneSessions: 0,
        };
        const sortedDays = [...(selectedWeek.days ?? [])].sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0));

        let totalMeals = 0;
        let completedMeals = 0;
        let perfectDays = 0;
        let streak = 0;
        let totalPlanned = 0;
        let totalPlannedCalories = 0;
        let plannedDaysWithMeals = 0;

        // Streak: only computable for the live current week
        if (isCurrentWeek) {
            for (let i = todayIdx; i >= 0; i--) {
                const day = sortedDays[i];
                if (!day) break;
                const pl = (day.meals ?? []).filter(m => m?.name?.trim());
                if (pl.length > 0 && pl.every(m => m.isDone)) {
                    streak++;
                } else if (i < todayIdx) {
                    break;
                }
            }
        }

        const dailyData = sortedDays.map(day => {
            const planned = (day.meals ?? []).filter(m => m?.name?.trim());
            const done = planned.filter(m => m.isDone);

            totalMeals += planned.length;
            completedMeals += done.length;
            totalPlanned += planned.length;
            if (planned.length > 0) {
                plannedDaysWithMeals++;
                totalPlannedCalories += (day.totalCalories ?? 0);
            }
            if (planned.length > 0 && done.length === planned.length) perfectDays++;

            const completion = planned.length > 0 ? (done.length / planned.length) * 100 : 0;

            return {
                shortLabel: SHORT_DAYS[day.dayIndex] ?? '?',
                dayIndex: day.dayIndex,
                completion,
                planCount: planned.length,
                doneCount: done.length,
            };
        });

        const maxPlanCount = Math.max(...dailyData.map(d => d.planCount), 1);
        const adherence = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
        const hasPlanData = totalPlanned > 0;

        // Nutrition highlights
        const counts: Record<string, number> = {};
        sortedDays.forEach(day =>
            (day.meals ?? []).forEach(m => {
                const highlights = Array.isArray(m?.nutritionHighlights) ? m.nutritionHighlights : [];
                highlights.forEach(tag => {
                    if (tag) counts[tag] = (counts[tag] || 0) + 1;
                });
            })
        );
        const topHighlights = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);

        const grocery = selectedWeek.groceryList ?? [];
        const cooking = selectedWeek.cookingPlan ?? [];

        return {
            totalMeals,
            completedMeals,
            adherence,
            perfectDays,
            streak,
            dailyData,
            maxPlanCount,
            topHighlights,
            hasPlanData,
            totalPlanned,
            totalPlannedCalories,
            plannedDaysWithMeals,
            totalGrocery: grocery.length,
            checkedGrocery: grocery.filter(g => g.isChecked).length,
            totalSessions: cooking.length,
            doneSessions: cooking.filter(s => s.isCompleted).length,
        };
    }, [selectedWeek, isCurrentWeek, todayIdx]);

    // ── All-4-weeks summary ───────────────────────────────────────────────────
    const allWeeksData = useMemo(() =>
        weeks.map(week => {
            let total = 0, done = 0;
            (week.days ?? []).forEach(day => {
                const pl = (day.meals ?? []).filter(m => m?.name?.trim());
                total += pl.length;
                done += pl.filter(m => m.isDone).length;
            });
            return { id: week.id, label: week.label, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
        }),
        [weeks]
    );

    const calorieProgressPct = todayStats.target > 0
        ? Math.min((todayStats.consumed / todayStats.target) * 100, 100) : 0;

    if (!selectedWeek || weeks.length === 0) return null;

    return (
        <View className="flex-1 bg-gray-50">

            {/* ══ Header ════════════════════════════════════════════════════════ */}
            <View className="bg-white pt-16 px-6 pb-4 border-b border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-3xl font-black text-gray-900 tracking-tight">Insights</Text>
                        <Text className="text-gray-400 text-sm font-medium mt-0.5" numberOfLines={1}>
                            {selectedWeek.label}{selectedWeek.theme ? `  ·  ${selectedWeek.theme}` : ''}
                        </Text>
                    </View>
                    <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center">
                        <FontAwesome name="line-chart" size={18} color="#10B981" />
                    </View>
                </View>

                {/* Week selector */}
                <View className="flex-row bg-gray-100 rounded-2xl p-1 gap-1">
                    {weeks.map(week => {
                        const isSelected = week.id === selectedWeekId;
                        const isCurrent = week.id === activeWeek?.id;
                        return (
                            <TouchableOpacity
                                key={week.id}
                                onPress={() => setSelectedWeekId(week.id)}
                                className={`flex-1 py-2.5 rounded-xl items-center ${isSelected ? 'bg-white' : ''}`}
                                style={isSelected ? {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 1,
                                } : undefined}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-xs font-black ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                    Wk {(week.label ?? '').split(' ')[1] ?? String(weeks.indexOf(week) + 1)}
                                </Text>
                                {isCurrent && (
                                    <View
                                        className="w-1 h-1 rounded-full mt-0.5"
                                        style={{ backgroundColor: isSelected ? '#10B981' : '#6EE7B7' }}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >

                {/* ══ Today's Focus — current week only ════════════════════════ */}
                {isCurrentWeek && (
                    <View className="bg-emerald-500 rounded-[32px] p-6 mb-4 shadow-lg shadow-emerald-200">
                        <Text className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-4">
                            Today's Focus
                        </Text>

                        {(todayStats.mealsTotal > 0 || todayStats.target > 0) ? (
                            <View>
                                <View className="flex-row items-end justify-between mb-3">
                                    <View>
                                        <View className="flex-row items-baseline gap-1">
                                            <Text className="text-white text-4xl font-black">{todayStats.consumed}</Text>
                                            <Text className="text-emerald-200 text-xl font-bold">
                                                {todayStats.target > 0 ? `/ ${todayStats.target}` : ''} kcal
                                            </Text>
                                        </View>
                                        <Text className="text-emerald-100 text-xs font-medium mt-1">Calories consumed today</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-white text-2xl font-black">
                                            {todayStats.mealsDone}
                                            <Text className="text-emerald-200 text-lg font-bold">/{todayStats.mealsTotal}</Text>
                                        </Text>
                                        <Text className="text-emerald-100 text-xs font-medium">meals done</Text>
                                    </View>
                                </View>

                                {todayStats.target > 0 && (
                                    <View>
                                        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                            <View className="h-full bg-white rounded-full" style={{ width: `${calorieProgressPct}%` }} />
                                        </View>
                                        <View className="flex-row justify-between mt-1.5">
                                            <Text className="text-emerald-100 text-[10px] font-medium">
                                                {Math.round(calorieProgressPct)}% of daily target
                                            </Text>
                                            {todayStats.consumed < todayStats.target && (
                                                <Text className="text-emerald-100 text-[10px] font-medium">
                                                    {todayStats.target - todayStats.consumed} kcal to go
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )}

                                {todayStats.mealsTotal > 0 && (
                                    <View className="flex-row gap-1.5 mt-4">
                                        {Array.from({ length: todayStats.mealsTotal }).map((_, i) => (
                                            <View
                                                key={i}
                                                className="h-1.5 flex-1 rounded-full"
                                                style={{ backgroundColor: i < todayStats.mealsDone ? 'white' : 'rgba(255,255,255,0.25)' }}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View className="items-center py-4">
                                <FontAwesome name="cutlery" size={24} color="rgba(255,255,255,0.4)" />
                                <Text className="text-emerald-100 text-sm font-medium mt-3 text-center">
                                    No meals planned for today yet.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ══ Plan Overview — non-current weeks only ════════════════════ */}
                {!isCurrentWeek && (
                    <View className="bg-gray-900 rounded-[32px] p-6 mb-4">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
                            Plan Overview · {selectedWeek.label}
                        </Text>

                        {weekStats.hasPlanData ? (
                            <View>
                                <View className="flex-row items-end justify-between mb-5">
                                    <View>
                                        <Text className="text-white text-4xl font-black">{weekStats.totalPlanned}</Text>
                                        <Text className="text-gray-400 text-xs font-medium mt-1">Meals planned this week</Text>
                                    </View>
                                    {weekStats.totalPlannedCalories > 0 && (
                                        <View className="items-end">
                                            <Text className="text-white text-2xl font-black">
                                                {weekStats.totalPlannedCalories.toLocaleString()}
                                            </Text>
                                            <Text className="text-gray-400 text-xs font-medium">kcal / week</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <Text className="text-white text-xl font-black">{weekStats.plannedDaysWithMeals}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Days with meals</Text>
                                    </View>
                                    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <Text className="text-white text-xl font-black">
                                            {weekStats.plannedDaysWithMeals > 0
                                                ? Math.round(weekStats.totalPlanned / weekStats.plannedDaysWithMeals)
                                                : 0}
                                        </Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Meals / day</Text>
                                    </View>
                                    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <Text className="text-white text-xl font-black">{weekStats.completedMeals}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Completed</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="items-center py-4">
                                <FontAwesome name="calendar-o" size={24} color="rgba(255,255,255,0.2)" />
                                <Text className="text-gray-500 text-sm font-medium mt-3 text-center">
                                    No meal plan imported for {selectedWeek.label} yet.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ══ Momentum Row ══════════════════════════════════════════════ */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-orange-500 p-5 rounded-[28px] shadow-lg shadow-orange-200">
                        <View className="w-8 h-8 bg-orange-400/30 rounded-full items-center justify-center mb-4">
                            <FontAwesome name="bolt" size={14} color="white" />
                        </View>
                        <Text className="text-white text-3xl font-black leading-none">
                            {isCurrentWeek ? weekStats.streak : '--'}
                        </Text>
                        <Text className="text-orange-100 text-[10px] font-bold mt-1 uppercase tracking-wider">Day streak</Text>
                    </View>

                    <View className="flex-1 bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                        <View className="w-8 h-8 bg-emerald-50 rounded-full items-center justify-center mb-4">
                            <FontAwesome name={isCurrentWeek ? 'check-circle' : 'list'} size={14} color="#10B981" />
                        </View>
                        <Text className="text-gray-900 text-3xl font-black leading-none">
                            {isCurrentWeek
                                ? (weekStats.hasPlanData ? `${weekStats.adherence}%` : '--')
                                : (weekStats.hasPlanData ? weekStats.totalPlanned : '--')}
                        </Text>
                        <Text className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-wider">
                            {isCurrentWeek ? 'Adherence' : 'Meals planned'}
                        </Text>
                    </View>

                    <View className="flex-1 bg-indigo-500 p-5 rounded-[28px] shadow-lg shadow-indigo-200">
                        <View className="w-8 h-8 bg-indigo-400/30 rounded-full items-center justify-center mb-4">
                            <FontAwesome name={isCurrentWeek ? 'star' : 'cutlery'} size={14} color="white" />
                        </View>
                        <Text className="text-white text-3xl font-black leading-none">
                            {isCurrentWeek
                                ? (weekStats.hasPlanData ? weekStats.perfectDays : '--')
                                : (weekStats.plannedDaysWithMeals > 0
                                    ? Math.round(weekStats.totalPlanned / weekStats.plannedDaysWithMeals)
                                    : '--')}
                        </Text>
                        <Text className="text-indigo-100 text-[10px] font-bold mt-1 uppercase tracking-wider">
                            {isCurrentWeek ? 'Perfect days' : 'Meals / day'}
                        </Text>
                    </View>
                </View>

                {/* ══ Daily Chart ════════════════════════════════════════════════ */}
                <View className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="font-black text-gray-900 text-lg">
                            {isCurrentWeek ? 'Daily Activity' : 'Daily Plan'}
                        </Text>
                        <View className="flex-row gap-3">
                            {isCurrentWeek ? (
                                <>
                                    <View className="flex-row items-center gap-1">
                                        <View className="w-2 h-2 rounded-sm bg-emerald-500" />
                                        <Text className="text-[9px] text-gray-400 font-bold">≥80%</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <View className="w-2 h-2 rounded-sm bg-amber-400" />
                                        <Text className="text-[9px] text-gray-400 font-bold">50–79%</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <View className="w-2 h-2 rounded-sm bg-gray-200" />
                                        <Text className="text-[9px] text-gray-400 font-bold">&lt;50%</Text>
                                    </View>
                                </>
                            ) : (
                                <View className="flex-row items-center gap-1">
                                    <View className="w-2 h-2 rounded-sm bg-emerald-500" />
                                    <Text className="text-[9px] text-gray-400 font-bold">Meals planned</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {weekStats.hasPlanData ? (
                        <View className="flex-row justify-between items-end px-1">
                            {weekStats.dailyData.map(day => {
                                const isToday = isCurrentWeek && day.dayIndex === todayIdx;
                                const barH = isCurrentWeek
                                    ? valToBarPx(day.completion, 100)
                                    : valToBarPx(day.planCount, weekStats.maxPlanCount);
                                const color = isCurrentWeek
                                    ? completionColor(day.completion)
                                    : (day.planCount > 0 ? '#10B981' : '#F3F4F6');
                                const label = isCurrentWeek
                                    ? `${Math.round(day.completion)}%`
                                    : `${day.planCount}`;
                                const showLabel = isCurrentWeek ? day.completion > 0 : day.planCount > 0;

                                return (
                                    <View key={day.dayIndex} className="items-center flex-1">
                                        <Text
                                            className="text-[8px] font-black text-gray-400 mb-1"
                                            style={{ opacity: showLabel ? 1 : 0 }}
                                        >
                                            {label}
                                        </Text>
                                        <View style={{ width: 18, height: barH, borderRadius: 6, backgroundColor: color }} />
                                        <Text
                                            className="text-[10px] mt-2 font-black"
                                            style={{ color: isToday ? '#10B981' : day.planCount > 0 ? '#4B5563' : '#D1D5DB' }}
                                        >
                                            {day.shortLabel}
                                        </Text>
                                        <View
                                            className="w-1 h-1 rounded-full mt-0.5"
                                            style={{ backgroundColor: isToday ? '#10B981' : 'transparent' }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="items-center py-6">
                            <FontAwesome name="bar-chart" size={28} color="#E5E7EB" />
                            <Text className="text-gray-400 text-sm font-medium mt-3">No meal data for this week yet</Text>
                        </View>
                    )}
                </View>

                {/* ══ Week Summary / Plan Detail ════════════════════════════════ */}
                <View className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm">
                    <Text className="font-black text-gray-900 text-lg mb-5">
                        {isCurrentWeek ? 'Week Summary' : 'Plan Detail'}
                    </Text>

                    {weekStats.hasPlanData ? (
                        isCurrentWeek ? (
                            <View>
                                <View className="flex-row justify-between mb-5">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</Text>
                                        <View className="flex-row items-baseline gap-1">
                                            <Text className="text-gray-900 text-3xl font-black">{weekStats.completedMeals}</Text>
                                            <Text className="text-gray-400 text-lg font-bold">/ {weekStats.totalMeals}</Text>
                                        </View>
                                        <Text className="text-gray-400 text-xs font-medium mt-0.5">meals this week</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Missed</Text>
                                        <Text className="text-rose-500 text-3xl font-black">
                                            {weekStats.totalMeals - weekStats.completedMeals}
                                        </Text>
                                        <Text className="text-gray-400 text-xs font-medium mt-0.5">meals</Text>
                                    </View>
                                </View>
                                <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${weekStats.totalMeals > 0 ? (weekStats.completedMeals / weekStats.totalMeals) * 100 : 0}%` }}
                                    />
                                </View>
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-[10px] text-emerald-600 font-bold">{weekStats.adherence}% adherence rate</Text>
                                    <Text className="text-[10px] text-rose-400 font-bold">
                                        {weekStats.totalMeals - weekStats.completedMeals} missed
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row justify-between mb-5">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Planned</Text>
                                        <Text className="text-gray-900 text-3xl font-black">{weekStats.totalPlanned}</Text>
                                        <Text className="text-gray-400 text-xs font-medium mt-0.5">meals scheduled</Text>
                                    </View>
                                    {weekStats.totalPlannedCalories > 0 && (
                                        <View className="items-end">
                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Est. Calories</Text>
                                            <Text className="text-gray-900 text-3xl font-black">
                                                {weekStats.totalPlannedCalories.toLocaleString()}
                                            </Text>
                                            <Text className="text-gray-400 text-xs font-medium mt-0.5">kcal planned</Text>
                                        </View>
                                    )}
                                </View>
                                {weekStats.completedMeals > 0 && (
                                    <View>
                                        <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${(weekStats.completedMeals / weekStats.totalMeals) * 100}%` }}
                                            />
                                        </View>
                                        <Text className="text-[10px] text-emerald-600 font-bold mt-2">
                                            {weekStats.completedMeals} of {weekStats.totalMeals} meals completed
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )
                    ) : (
                        <View className="items-center py-4">
                            <FontAwesome name="calendar-o" size={28} color="#E5E7EB" />
                            <Text className="text-gray-400 text-sm font-medium mt-3 text-center">
                                No meals planned for {selectedWeek.label} yet.
                            </Text>
                        </View>
                    )}
                </View>

                {/* ══ 4-Week Overview ════════════════════════════════════════════ */}
                <View className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm">
                    <Text className="font-black text-gray-900 text-lg mb-1">4-Week Progress</Text>
                    <Text className="text-gray-400 text-xs font-medium mb-5">Tap a week to view its insights</Text>

                    {allWeeksData.map(week => {
                        const isCurrent = week.id === activeWeek?.id;
                        const isSelected = week.id === selectedWeekId;
                        return (
                            <TouchableOpacity
                                key={week.id}
                                onPress={() => setSelectedWeekId(week.id)}
                                className="mb-5"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-center mb-2">
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`text-sm font-black ${isSelected ? 'text-emerald-600' : 'text-gray-700'}`}>
                                            {week.label}
                                        </Text>
                                        {isCurrent && (
                                            <View className="bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                                <Text className="text-emerald-700 text-[8px] font-black uppercase tracking-wide">current</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className={`text-sm font-black ${week.total > 0 ? pctLabel(week.pct) : 'text-gray-300'}`}>
                                        {week.total > 0 ? `${week.pct}%` : '--'}
                                    </Text>
                                </View>
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    {week.total > 0 && (
                                        <View
                                            className="h-full rounded-full"
                                            style={{ width: `${week.pct}%`, backgroundColor: progressColor(week.pct) }}
                                        />
                                    )}
                                </View>
                                <Text className="text-gray-400 text-[10px] font-medium mt-1.5">
                                    {week.total > 0 ? `${week.done} of ${week.total} meals completed` : 'No meal data'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ══ Nutrition Focus ════════════════════════════════════════════ */}
                {weekStats.topHighlights.length > 0 && (
                    <View className="bg-white rounded-[32px] p-6 mb-4 border border-gray-100 shadow-sm">
                        <Text className="font-black text-gray-900 text-lg mb-1">Nutrition Focus</Text>
                        <Text className="text-gray-400 text-xs font-medium mb-5">
                            Most frequent highlights in {selectedWeek.label}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {weekStats.topHighlights.map(([tag, count], i) => (
                                <View
                                    key={tag}
                                    className="flex-row items-center bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-2xl gap-2"
                                    style={{ opacity: Math.max(1 - i * 0.1, 0.5) }}
                                >
                                    <Text className="text-emerald-800 text-sm font-bold">{tag}</Text>
                                    <View className="bg-emerald-500 w-5 h-5 rounded-full items-center justify-center">
                                        <Text className="text-white text-[9px] font-black">{count}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ══ Prep Readiness ════════════════════════════════════════════ */}
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                        <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                            <FontAwesome name="shopping-cart" size={16} color="#6366F1" />
                        </View>
                        {weekStats.totalGrocery > 0 ? (
                            <View>
                                <View className="flex-row items-baseline gap-0.5">
                                    <Text className="text-gray-900 text-2xl font-black">{weekStats.checkedGrocery}</Text>
                                    <Text className="text-gray-400 text-base font-bold">/{weekStats.totalGrocery}</Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Groceries</Text>
                                <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                                    <View
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(weekStats.checkedGrocery / weekStats.totalGrocery) * 100}%` }}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-gray-300 text-2xl font-black">--</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Groceries</Text>
                                <Text className="text-gray-300 text-[9px] mt-2">No list yet</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                        <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center mb-4">
                            <FontAwesome name="fire" size={16} color="#F59E0B" />
                        </View>
                        {weekStats.totalSessions > 0 ? (
                            <View>
                                <View className="flex-row items-baseline gap-0.5">
                                    <Text className="text-gray-900 text-2xl font-black">{weekStats.doneSessions}</Text>
                                    <Text className="text-gray-400 text-base font-bold">/{weekStats.totalSessions}</Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Cook sessions</Text>
                                <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                                    <View
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{ width: `${(weekStats.doneSessions / weekStats.totalSessions) * 100}%` }}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-gray-300 text-2xl font-black">--</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Cook sessions</Text>
                                <Text className="text-gray-300 text-[9px] mt-2">No plan yet</Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
