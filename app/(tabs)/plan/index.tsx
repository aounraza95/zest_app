import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function PlanScreen() {
    const weeks = useAppStore(state => state.weeks);

    return (
        <View className="flex-1 bg-gray-50">
            <View className="pt-16 pb-6 px-6 bg-white shadow-sm z-10">
                <Text className="text-3xl font-bold text-gray-900">Planning</Text>
                <Text className="text-gray-500">Manage your 4-week cycle</Text>
            </View>

            <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 50 }}>
                {weeks.map((week, index) => (
                    <Link key={week.id} href={`/(tabs)/plan/${week.id}`} asChild>
                        <Pressable className="bg-white p-6 rounded-3xl mb-4 shadow-sm border border-gray-100 active:scale-95 transition-transform">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                                    <Text className="text-emerald-700 font-bold text-xs">CYCLE {index + 1}</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color="#D1D5DB" />
                            </View>

                            <Text className="text-xl font-bold text-gray-800 mb-2">{week.label}</Text>

                            <View className="flex-row gap-4">
                                <View className="flex-row items-center">
                                    <FontAwesome name="cutlery" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                                    <Text className="text-gray-500 text-sm">
                                        {week.days.reduce((acc, d) => acc + d.meals.filter(m => m.name).length, 0)} Meals
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <FontAwesome name="shopping-cart" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                                    <Text className="text-gray-500 text-sm">{week.groceryList.length} Items</Text>
                                </View>
                            </View>
                        </Pressable>
                    </Link>
                ))}
            </ScrollView>
        </View>
    );
}
