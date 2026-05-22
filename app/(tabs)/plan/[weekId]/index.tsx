import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function WeekDetailScreen() {
    const { weekId } = useLocalSearchParams<{ weekId: string }>();
    const weeks = useAppStore(state => state.weeks);
    const week = weeks.find(w => w.id === weekId);
    const router = useRouter();

    if (!week) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-gray-400 font-bold">Week not found</Text>
            </View>
        );
    }

    const weekNum = parseInt((weekId ?? '').split('-')[1] ?? '0') + 1;
    const mealCount = week.days.reduce((acc, d) => acc + d.meals.filter(m => m.name).length, 0);

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ══ Custom Header ════════════════════════════════════════════ */}
                <View className="bg-white pt-16 px-6 pb-6 border-b border-gray-100 mb-6">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <FontAwesome name="chevron-left" size={14} color="#4B5563" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">4-Week Cycle</Text>
                            <Text className="text-2xl font-black text-gray-900 tracking-tight">{week.label}</Text>
                        </View>
                        <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-[9px] font-black uppercase tracking-wider">Wk {weekNum}</Text>
                        </View>
                    </View>
                    {week.theme ? (
                        <Text className="text-gray-400 text-xs font-medium mt-2 ml-[52px]">{week.theme}</Text>
                    ) : null}
                </View>

                <View className="px-4">
                    {/* ── Quick Stats ─────────────────────────────────────────── */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-emerald-500 p-4 rounded-2xl shadow-md shadow-emerald-200 items-center">
                            <Text className="text-white text-xl font-black">{mealCount}</Text>
                            <Text className="text-emerald-100 text-[9px] font-black uppercase tracking-widest mt-0.5">Meals Set</Text>
                        </View>
                        <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                            <Text className="text-gray-900 text-xl font-black">{week.groceryList.length}</Text>
                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Groceries</Text>
                        </View>
                        <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                            <Text className="text-gray-900 text-xl font-black">{week.days.length}</Text>
                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Days</Text>
                        </View>
                    </View>

                    {/* ── Grocery Card ─────────────────────────────────────────── */}
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Shopping</Text>
                    <Link href={`/(tabs)/plan/${weekId}/grocery`} asChild>
                        <Pressable
                            className="bg-white rounded-2xl mb-6 border border-gray-100 overflow-hidden active:opacity-80"
                            style={{
                                shadowColor: '#000',
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 2 },
                                elevation: 2,
                            }}
                        >
                            <View className="flex-row items-center p-5 gap-4">
                                <View className="w-14 h-14 bg-emerald-500 rounded-2xl items-center justify-center shadow-md shadow-emerald-200">
                                    <FontAwesome name="shopping-cart" size={22} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-black text-base">Grocery List</Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">
                                        {week.groceryList.length > 0
                                            ? `${week.groceryList.length} items planned`
                                            : 'No items yet — tap to add'}
                                    </Text>
                                </View>
                                <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                                    <Text className="text-gray-600 text-[10px] font-black uppercase tracking-wide">Edit</Text>
                                </View>
                            </View>
                        </Pressable>
                    </Link>

                    {/* ── Daily Plan ───────────────────────────────────────────── */}
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Daily Meal Plan</Text>
                    <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        {week.days.map((day, index) => {
                            const filledMeals = day.meals.filter(m => m.name).length;
                            return (
                                <Link key={day.id} href={`/(tabs)/plan/${weekId}/day/${day.id}`} asChild>
                                    <Pressable
                                        className={`flex-row items-center px-4 py-4 active:bg-gray-50 ${index < week.days.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-4 border border-gray-100">
                                            <Text className="text-gray-900 text-[10px] font-black uppercase tracking-wide">{day.dayOfWeek.substring(0, 3)}</Text>
                                            <Text className="text-gray-400 text-[8px] font-bold mt-0.5">{day.dayIndex + 1}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-black text-sm">{day.dayOfWeek}</Text>
                                            <Text className={`text-[10px] font-bold mt-0.5 ${filledMeals > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                {filledMeals > 0 ? `${filledMeals} meal${filledMeals !== 1 ? 's' : ''} planned` : 'No meals set'}
                                            </Text>
                                        </View>
                                        <FontAwesome name="chevron-right" size={11} color="#D1D5DB" />
                                    </Pressable>
                                </Link>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
