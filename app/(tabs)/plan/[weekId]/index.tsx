import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function WeekDetailScreen() {
    const { weekId } = useLocalSearchParams<{ weekId: string }>();
    const weeks = useAppStore(state => state.weeks);
    const week = weeks.find(w => w.id === weekId);

    if (!week) return <View className="flex-1 justify-center items-center"><Text>Week not found</Text></View>;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ title: week.label, headerBackTitle: 'Plan' }} />

            <View className="p-6">
                {/* Groceries Card */}
                <Link href={`/(tabs)/plan/${weekId}/grocery`} asChild>
                    <Pressable className="bg-emerald-500 p-6 rounded-3xl mb-6 shadow-md shadow-emerald-200 active:scale-95 transition-transform">
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-emerald-100 font-bold text-xs uppercase mb-1">Shopping List</Text>
                                <Text className="text-white text-2xl font-bold">Groceries</Text>
                                <Text className="text-emerald-50 mt-2">{week.groceryList.length} items planned</Text>
                            </View>
                            <View className="bg-white/20 p-4 rounded-2xl">
                                <FontAwesome name="shopping-cart" size={24} color="white" />
                            </View>
                        </View>
                    </Pressable>
                </Link>

                <Text className="text-gray-900 font-bold text-xl mb-4 ml-1">Daily Meal Plan</Text>

                {/* Days List */}
                <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                    {week.days.map((day, index) => (
                        <Link key={day.id} href={`/(tabs)/plan/${weekId}/day/${day.id}`} asChild>
                            <Pressable className={`p-4 flex-row justify-between items-center active:bg-gray-50 ${index !== week.days.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-4">
                                        <Text className="text-indigo-600 font-bold text-xs">{day.dayOfWeek.substring(0, 3).toUpperCase()}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-900 font-semibold">{day.dayOfWeek}</Text>
                                        <Text className="text-gray-400 text-xs">
                                            {day.meals.filter(m => m.name).length} meals
                                        </Text>
                                    </View>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color="#E5E7EB" />
                            </Pressable>
                        </Link>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
