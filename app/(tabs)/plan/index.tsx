import { useAppStore } from '@/store/useAppStore';
import { ZestIcon } from '@/components/ZestIcon';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const WEEK_ACCENTS = [
    { badge: 'bg-emerald-500', light: 'bg-emerald-50', icon: '#10B981' },
    { badge: 'bg-indigo-500',  light: 'bg-indigo-50',  icon: '#6366F1' },
    { badge: 'bg-orange-500',  light: 'bg-orange-50',  icon: '#F97316' },
    { badge: 'bg-emerald-500', light: 'bg-emerald-50', icon: '#10B981' },
] as const;

export default function PlanScreen() {
    const weeks = useAppStore(state => state.weeks);

    return (
        <View className="flex-1 bg-gray-50">
            {/* ══ Type B Header ════════════════════════════════════════════ */}
            <View className="bg-white pt-16 px-6 pb-6 border-b border-gray-100">
                <View className="flex-row items-center gap-3">
                    <ZestIcon size={40} />
                    <View>
                        <Text className="text-3xl font-black text-gray-900 tracking-tight">Planning</Text>
                        <Text className="text-gray-400 text-sm font-medium">Your 4-week meal cycle</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            >
                {weeks.length === 0 ? (
                    <View className="items-center justify-center mt-24 opacity-50">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <FontAwesome name="calendar" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-lg font-black text-gray-400 mt-4">No weeks yet</Text>
                        <Text className="text-sm text-gray-400 text-center px-10 leading-relaxed mt-1">
                            Import a plan JSON to get started.
                        </Text>
                    </View>
                ) : (
                    weeks.map((week, index) => {
                        const accent = WEEK_ACCENTS[index % WEEK_ACCENTS.length];
                        const mealCount = week.days.reduce((acc, d) => acc + d.meals.filter(m => m.name).length, 0);
                        return (
                            <Link key={week.id} href={`/(tabs)/plan/${week.id}`} asChild>
                                <Pressable
                                    className="bg-white rounded-2xl mb-4 border border-gray-100 overflow-hidden active:opacity-80"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOpacity: 0.04,
                                        shadowRadius: 8,
                                        shadowOffset: { width: 0, height: 2 },
                                        elevation: 2,
                                    }}
                                >
                                    {/* Top row */}
                                    <View className="px-5 pt-5 pb-4 flex-row items-start justify-between">
                                        <View className="flex-row items-center gap-4">
                                            <View className={`w-14 h-14 ${accent.badge} rounded-2xl items-center justify-center`}>
                                                <Text className="text-white text-[9px] font-black uppercase tracking-widest">WK</Text>
                                                <Text className="text-white text-xl font-black leading-tight">{index + 1}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-gray-900 text-lg font-black">{week.label}</Text>
                                                {week.theme ? (
                                                    <Text className="text-gray-400 text-xs font-medium mt-0.5" numberOfLines={1}>{week.theme}</Text>
                                                ) : (
                                                    <Text className="text-gray-300 text-xs font-medium mt-0.5">No theme set</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mt-1">
                                            <FontAwesome name="chevron-right" size={11} color="#9CA3AF" />
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View className="h-px bg-gray-50 mx-5" />

                                    {/* Stats row */}
                                    <View className="flex-row px-5 py-4 gap-6">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-7 h-7 bg-emerald-50 rounded-lg items-center justify-center">
                                                <FontAwesome name="cutlery" size={11} color="#10B981" />
                                            </View>
                                            <View>
                                                <Text className="text-gray-900 font-black text-sm">{mealCount}</Text>
                                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Meals</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-7 h-7 bg-indigo-50 rounded-lg items-center justify-center">
                                                <FontAwesome name="shopping-cart" size={11} color="#6366F1" />
                                            </View>
                                            <View>
                                                <Text className="text-gray-900 font-black text-sm">{week.groceryList.length}</Text>
                                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Groceries</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-7 h-7 bg-amber-50 rounded-lg items-center justify-center">
                                                <FontAwesome name="calendar" size={11} color="#F59E0B" />
                                            </View>
                                            <View>
                                                <Text className="text-gray-900 font-black text-sm">{week.days.length}</Text>
                                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Days</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            </Link>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}
