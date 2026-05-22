import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DayEditScreen() {
    const { weekId, dayId } = useLocalSearchParams<{ weekId: string; dayId: string }>();
    const { weeks, settings, upsertMeal, updateDay } = useAppStore();
    const router = useRouter();

    const week = weeks.find(w => w.id === weekId);
    const day = week?.days.find(d => d.id === dayId);
    const definitions = settings.mealDefinitions;

    if (!day) return null;

    const getSlot = (defId: string) => day.meals.find(m => m.definitionId === defId);

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ══ Custom Header ════════════════════════════════════════════ */}
                <View className="bg-white pt-16 px-6 pb-5 border-b border-gray-100 mb-6">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <FontAwesome name="chevron-left" size={14} color="#4B5563" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">{week?.label}</Text>
                            <Text className="text-2xl font-black text-gray-900 tracking-tight">{day.dayOfWeek}</Text>
                        </View>
                        <View className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                            <Text className="text-emerald-700 text-[9px] font-black uppercase tracking-wide">Day {day.dayIndex + 1}</Text>
                        </View>
                    </View>
                </View>

                <View className="px-4">
                    {/* ── Calorie Target ─────────────────────────────────────── */}
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Day Target</Text>
                    <View className="bg-emerald-500 rounded-2xl p-5 mb-8 shadow-md shadow-emerald-200">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                <FontAwesome name="fire" size={18} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-emerald-100 text-[9px] font-black uppercase tracking-widest mb-1">Daily Calorie Target</Text>
                                <TextInput
                                    style={{ padding: 0, color: 'white', fontSize: 24, fontWeight: '900' }}
                                    placeholder="e.g. 2500"
                                    placeholderTextColor="rgba(255,255,255,0.35)"
                                    value={day.totalCalories?.toString() || ''}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        const val = parseInt(text) || 0;
                                        updateDay(weekId!, dayId!, { totalCalories: val });
                                    }}
                                />
                            </View>
                            <Text className="text-white/60 text-sm font-bold">kcal</Text>
                        </View>
                    </View>

                    {/* ── Meal Slots ─────────────────────────────────────────── */}
                    {definitions.length === 0 ? (
                        <View className="items-center justify-center mt-12 opacity-50">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <FontAwesome name="cutlery" size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-lg font-black text-gray-400">No meal slots</Text>
                            <Text className="text-sm text-gray-400 text-center px-10 leading-relaxed mt-1">
                                Add meal slots in Settings to plan your day.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Meals</Text>
                            {definitions.map((def) => {
                                const existingMeal = getSlot(def.id);
                                const mealName    = existingMeal?.name || '';
                                const mealNotes   = existingMeal?.notes || '';
                                const mealRecipe  = existingMeal?.recipeNote || '';
                                const mealQty     = existingMeal?.qty || '';
                                const mealHighlights = existingMeal?.nutritionHighlights?.join(', ') || '';
                                const mealTime    = existingMeal?.time || def.defaultTime || '';

                                return (
                                    <View
                                        key={def.id}
                                        className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOpacity: 0.03,
                                            shadowRadius: 6,
                                            shadowOffset: { width: 0, height: 2 },
                                            elevation: 1,
                                        }}
                                    >
                                        {/* Slot header */}
                                        <View className="flex-row items-center justify-between px-4 py-3.5 bg-gray-50 border-b border-gray-100">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center">
                                                    <FontAwesome name="cutlery" size={12} color="#10B981" />
                                                </View>
                                                <Text className="text-gray-900 font-black text-sm">{def.name}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
                                                <FontAwesome name="clock-o" size={10} color="#9CA3AF" />
                                                <TextInput
                                                    style={{ padding: 0, minWidth: 40, fontSize: 11, fontWeight: '900', color: '#4B5563' }}
                                                    value={mealTime}
                                                    placeholder="HH:MM"
                                                    placeholderTextColor="#D1D5DB"
                                                    onChangeText={(text) => {
                                                        upsertMeal(weekId!, dayId!, def.id, { time: text });
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        {/* Fields */}
                                        <View className="p-4 gap-4">
                                            <View>
                                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Meal Name</Text>
                                                <TextInput
                                                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 font-semibold"
                                                    placeholder={`Enter ${def.name}...`}
                                                    placeholderTextColor="#D1D5DB"
                                                    value={mealName}
                                                    onChangeText={(text) => {
                                                        upsertMeal(weekId!, dayId!, def.id, { name: text });
                                                    }}
                                                />
                                            </View>

                                            <View className="flex-row gap-3">
                                                <View className="flex-1">
                                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Quantity</Text>
                                                    <TextInput
                                                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700"
                                                        placeholder="2 eggs, 1 cup..."
                                                        placeholderTextColor="#D1D5DB"
                                                        value={mealQty}
                                                        onChangeText={(text) => {
                                                            upsertMeal(weekId!, dayId!, def.id, { qty: text });
                                                        }}
                                                    />
                                                </View>
                                                <View style={{ width: 90 }}>
                                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Calories</Text>
                                                    <TextInput
                                                        className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 font-black"
                                                        placeholder="500"
                                                        placeholderTextColor="#A7F3D0"
                                                        value={existingMeal?.calories || ''}
                                                        keyboardType="numeric"
                                                        onChangeText={(text) => {
                                                            upsertMeal(weekId!, dayId!, def.id, { calories: text });
                                                        }}
                                                    />
                                                </View>
                                            </View>

                                            <View>
                                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Recipe / Instructions</Text>
                                                <TextInput
                                                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700"
                                                    style={{ minHeight: 72, textAlignVertical: 'top' }}
                                                    placeholder="How to prepare..."
                                                    placeholderTextColor="#D1D5DB"
                                                    value={mealRecipe}
                                                    multiline
                                                    onChangeText={(text) => {
                                                        upsertMeal(weekId!, dayId!, def.id, { recipeNote: text });
                                                    }}
                                                />
                                            </View>

                                            <View>
                                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Nutrition Highlights</Text>
                                                <TextInput
                                                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700"
                                                    placeholder="Protein, Zinc, Vit E (comma-separated)"
                                                    placeholderTextColor="#D1D5DB"
                                                    value={mealHighlights}
                                                    onChangeText={(text) => {
                                                        const highlights = text.split(',').map(s => s.trim()).filter(s => s !== '');
                                                        upsertMeal(weekId!, dayId!, def.id, { nutritionHighlights: highlights });
                                                    }}
                                                />
                                            </View>

                                            <View>
                                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Notes & Tips</Text>
                                                <TextInput
                                                    className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-700"
                                                    style={{ minHeight: 56, textAlignVertical: 'top' }}
                                                    placeholder="Extra tips or notes..."
                                                    placeholderTextColor="#FDE68A"
                                                    value={mealNotes}
                                                    multiline
                                                    onChangeText={(text) => {
                                                        upsertMeal(weekId!, dayId!, def.id, { notes: text });
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
