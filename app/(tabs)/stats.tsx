import { useAppStore } from '@/store/useAppStore';
import { getCurrentWeekIndex } from '@/utils/dateHelpers';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function StatsScreen() {
    const { weeks, settings } = useAppStore();

    // 1. Get Active Week Data
    const isoWeekIndex = getCurrentWeekIndex();
    const activeWeekId = settings.activeWeekOverride || `week-${isoWeekIndex}`;
    const activeWeek = weeks.find(w => w.id === activeWeekId) || weeks[0];

    // 2. Calculate Metrics
    const stats = useMemo(() => {
        let totalMeals = 0;
        let completedMeals = 0;
        const dailyBreakdown = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

        activeWeek.days.forEach(day => {
            const mealsInDay = day.meals.length; // Count actual planned slots?
            // Or only count meals that have a name? Let's count all slots as "opportunities".
            // Actually, better to count only meals that HAVE a name/plan, otherwise empty slots skew stats.
            const plannedMeals = day.meals.filter(m => m.name.trim().length > 0);

            totalMeals += plannedMeals.length;

            const done = plannedMeals.filter(m => m.isDone).length;
            completedMeals += done;

            dailyBreakdown[day.dayIndex] = done;
        });

        const rate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

        return { totalMeals, completedMeals, rate, dailyBreakdown };
    }, [activeWeek]);

    // Helper for max value in graph
    const maxDaily = Math.max(...stats.dailyBreakdown, 4); // Min height of 4 for scale

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
                <View className="pt-16 pb-6 px-6 bg-white rounded-b-3xl shadow-sm mb-6">
                    <Text className="text-3xl font-bold text-gray-900">Insights</Text>
                    <Text className="text-gray-400 mt-1">Track your consistency</Text>
                </View>

                {/* Main Progress Card */}
                <View className="mx-6 p-6 bg-emerald-500 rounded-3xl shadow-lg mb-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-emerald-100 font-bold uppercase tracking-widest text-xs">
                                Weekly Adherence
                            </Text>
                            <Text className="text-white text-4xl font-extrabold mt-1">
                                {stats.rate}%
                            </Text>
                        </View>
                        <View className="bg-emerald-400/30 p-3 rounded-full">
                            <FontAwesome name="trophy" size={24} color="white" />
                        </View>
                    </View>

                    {/* Custom Progress Bar */}
                    <View className="h-4 bg-emerald-900/20 rounded-full overflow-hidden mb-2">
                        <View
                            className="h-full bg-white rounded-full"
                            style={{ width: `${stats.rate}%` }}
                        />
                    </View>
                    <Text className="text-emerald-100 text-xs font-medium">
                        {stats.completedMeals} of {stats.totalMeals} meals completed
                    </Text>
                </View>

                {/* Activity Graph */}
                <View className="mx-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <Text className="font-bold text-gray-800 text-lg mb-6">Activity Snapshot</Text>

                    <View className="flex-row justify-between items-end h-40 pb-2 border-b border-gray-100">
                        {stats.dailyBreakdown.map((count, index) => {
                            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            // Calculate height percentage relative to max, cap at 100%
                            const heightPct = (count / maxDaily) * 100;

                            return (
                                <View key={index} className="items-center w-8">
                                    <View
                                        className={`w-4 rounded-t-lg ${count > 0 ? 'bg-emerald-400' : 'bg-gray-100'}`}
                                        style={{ height: `${heightPct || 5}%` }} // Min 5% for visibility
                                    />
                                    <Text className="text-gray-400 text-xs mt-2 font-medium">{days[index]}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Detail Stats Grid */}
                <View className="mx-6 flex-row gap-4 mb-24">
                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
                            <FontAwesome name="fire" size={18} color="#FF9F1C" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">
                            {stats.completedMeals}
                        </Text>
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center">
                            Total Done
                        </Text>
                    </View>

                    <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-rose-100 rounded-full items-center justify-center mb-3">
                            <FontAwesome name="times" size={18} color="#F43F5E" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">
                            {stats.totalMeals - stats.completedMeals}
                        </Text>
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center">
                            Missed
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
