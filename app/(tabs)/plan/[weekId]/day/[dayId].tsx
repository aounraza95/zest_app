import { useAppStore } from '@/store/useAppStore';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

export default function DayEditScreen() {
    const { weekId, dayId } = useLocalSearchParams<{ weekId: string; dayId: string }>();
    const { weeks, settings, upsertMeal } = useAppStore();

    const week = weeks.find(w => w.id === weekId);
    const day = week?.days.find(d => d.id === dayId);
    const definitions = settings.mealDefinitions;

    if (!day) return null;

    const getSlot = (defId: string) => day.meals.find(m => m.definitionId === defId);

    return (
        <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Stack.Screen options={{ title: day.dayOfWeek }} />
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {definitions.map((def) => {
                    const existingMeal = getSlot(def.id);
                    const mealName = existingMeal?.name || '';
                    const mealNotes = existingMeal?.notes || '';
                    const mealTime = existingMeal?.time || def.defaultTime || '';

                    return (
                        <View key={def.id} className="mb-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="bg-emerald-100 px-3 py-1 rounded-full mr-2">
                                        <Text className="text-emerald-700 text-xs font-bold uppercase">{def.name}</Text>
                                    </View>
                                </View>
                                <TextInput
                                    className="bg-gray-50 px-3 py-1 rounded-lg text-xs font-bold text-gray-600 w-16 text-center"
                                    value={mealTime}
                                    placeholder="HH:MM"
                                    onChangeText={(text) => {
                                        upsertMeal(weekId!, dayId!, def.id, { time: text });
                                    }}
                                />
                            </View>

                            <Text className="text-sm font-semibold text-gray-500 mb-2 ml-1">Meal Name</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
                                placeholder={`Enter ${def.name}...`}
                                value={mealName}
                                onChangeText={(text) => {
                                    upsertMeal(weekId!, dayId!, def.id, { name: text });
                                }}
                            />

                            <Text className="text-sm font-semibold text-gray-500 mb-2 ml-1">Prep Notes</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 h-24"
                                placeholder="Add ingredients..."
                                value={mealNotes}
                                multiline
                                textAlignVertical="top"
                                onChangeText={(text) => {
                                    upsertMeal(weekId!, dayId!, def.id, { notes: text });
                                }}
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
