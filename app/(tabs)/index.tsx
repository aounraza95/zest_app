import { useAppStore } from '@/store/useAppStore';
import { getCurrentWeekIndex, getDayIndexStart, getDaysForWeek, getStartOfCurrentWeek } from '@/utils/dateHelpers';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format, isSameDay } from 'date-fns';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MealsScreen() {
    const { weeks, settings, updateMeal, upsertMeal } = useAppStore();

    // Active Week Logic
    const isoWeekIndex = getCurrentWeekIndex();
    const activeWeekId = settings.activeWeekOverride
        ? settings.activeWeekOverride
        : `week-${isoWeekIndex}`;

    const activeWeek = weeks.find(w => w.id === activeWeekId) || weeks[0];

    // Calendar Strip Logic
    const startOfWeek = getStartOfCurrentWeek();
    const weekDates = getDaysForWeek(startOfWeek);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedDayIndex = getDayIndexStart(selectedDate);
    const activeDayPlan = activeWeek.days.find(d => d.dayIndex === selectedDayIndex);

    const toggleMealDone = (mealId: string, currentStatus: boolean) => {
        if (activeDayPlan) {
            updateMeal(activeWeek.id, activeDayPlan.id, mealId, { isDone: !currentStatus });
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Hero Header */}
            <View className="bg-emerald-500 pt-16 pb-8 px-6 rounded-b-3xl shadow-lg">
                <Text className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">
                    {activeWeek.label} Plan
                </Text>
                <Text className="text-white text-3xl font-extrabold">
                    {format(selectedDate, 'EEEE')}
                </Text>
                <Text className="text-emerald-100 text-lg">
                    {format(selectedDate, 'MMMM do')}
                </Text>
            </View>

            {/* Week Calendar Strip */}
            <View className="mt-6 mb-2">
                <FlatList
                    horizontal
                    data={weekDates}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: date }) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());
                        return (
                            <TouchableOpacity
                                className={`mr-3 items-center justify-center w-14 h-20 rounded-2xl ${isSelected ? 'bg-emerald-500 shadow-md' : 'bg-white border border-gray-100'}`}
                                onPress={() => setSelectedDate(date)}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-xs font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {format(date, 'EEE')}
                                </Text>
                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {format(date, 'd')}
                                </Text>
                                {isToday && !isSelected && (
                                    <View className="absolute bottom-2 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Meals List */}
            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {!activeDayPlan ? (
                    <Text className="text-center text-gray-400 mt-10">No plan for this day.</Text>
                ) : (
                    (settings.mealDefinitions || []).map((def) => {
                        const meal = activeDayPlan.meals.find(m => m.definitionId === def.id);
                        const isDone = meal?.isDone || false;

                        // Handle toggle: if meal exists, update. If not, create.
                        // Handle toggle: if meal exists, update. If not, create.
                        const handleToggle = () => {
                            if (meal) {
                                toggleMealDone(meal.id, isDone);
                            } else {
                                if (activeWeek && activeDayPlan) {
                                    upsertMeal(activeWeek.id, activeDayPlan.id, def.id, { isDone: !isDone });
                                }
                            }
                        };

                        // Wait, I need upsertMeal in the component 

                        return (
                            <TouchableOpacity
                                key={def.id}
                                className={`flex-row items-center p-5 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 ${isDone ? 'opacity-60 bg-gray-50' : ''}`}
                                onPress={handleToggle}
                                activeOpacity={0.7}
                            >
                                <View className={`w-8 h-8 rounded-full border-2 mr-4 items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 bg-white'}`}>
                                    {isDone && <FontAwesome name="check" size={14} color="white" />}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-emerald-500 font-bold text-xs uppercase tracking-wider">
                                            {def.name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs font-medium">
                                            {meal?.time || def.defaultTime || ''}
                                        </Text>
                                    </View>

                                    <Text className={`text-lg font-semibold ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {meal?.name || 'Not planned'}
                                    </Text>
                                    {!!meal?.notes && (
                                        <Text className="text-gray-400 text-sm mt-1 italic">
                                            {meal.notes}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
                <View className="h-24" />
            </ScrollView>
        </View>
    );
}
