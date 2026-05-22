import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';

export default function HealthProfileScreen() {
    const { planMeta } = useAppStore();
    const router = useRouter();

    if (!planMeta) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center p-6">
                <Stack.Screen options={{ headerShown: false }} />
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4 opacity-50">
                    <FontAwesome name="user" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-400 font-semibold text-center text-lg">No profile information available.</Text>
            </View>
        );
    }

    const vitals = [
        { icon: 'venus-mars', label: 'Gender',         value: planMeta.gender,        bg: 'bg-rose-100',   color: '#FB7185' },
        { icon: 'calendar-o', label: 'Age',            value: planMeta.age ? `${planMeta.age} yrs` : undefined, bg: 'bg-sky-100',   color: '#38BDF8' },
        { icon: 'rocket',     label: 'Activity Level', value: planMeta.activityLevel,  bg: 'bg-indigo-100', color: '#6366F1' },
        { icon: 'map-marker', label: 'Location',       value: planMeta.location,       bg: 'bg-amber-100',  color: '#F59E0B' },
    ] as const;

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ══ Hero Header ══════════════════════════════════════════════ */}
                <View className="bg-emerald-500 pt-16 px-6 pb-10 rounded-b-[40px] shadow-xl shadow-emerald-200 mb-8">
                    {/* Nav row */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <FontAwesome name="chevron-left" size={14} color="white" />
                        </TouchableOpacity>
                        <View className="bg-white/20 px-4 py-1.5 rounded-full">
                            <Text className="text-white text-[9px] font-black uppercase tracking-widest">Health Profile</Text>
                        </View>
                        <View className="w-10" />
                    </View>

                    {/* Avatar + Goal */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-white/20 rounded-[32px] items-center justify-center mb-4">
                            <FontAwesome name="user" size={36} color="white" />
                        </View>
                        <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Your Goal</Text>
                        <Text className="text-white text-2xl font-black text-center">{planMeta.purpose || 'Optimize Health'}</Text>
                    </View>

                    {/* Weight cards */}
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1 bg-white/15 rounded-2xl p-4">
                            <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Current</Text>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-white text-2xl font-black">{planMeta.currentWeight_kg}</Text>
                                <Text className="text-white/60 text-sm font-bold">kg</Text>
                            </View>
                        </View>
                        <View className="flex-1 bg-white/15 rounded-2xl p-4">
                            <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Target</Text>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-white text-2xl font-black">{planMeta.targetWeight_kg}</Text>
                                <Text className="text-white/60 text-sm font-bold">kg</Text>
                            </View>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View className="bg-white/10 rounded-2xl px-4 py-3 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <FontAwesome name="clock-o" size={12} color="rgba(255,255,255,0.6)" />
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Timeline</Text>
                        </View>
                        <Text className="text-white font-black text-sm">{planMeta.timeline}</Text>
                    </View>
                </View>

                <View className="px-4">
                    {/* ── Daily Blueprint ───────────────────────────────────── */}
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Daily Blueprint</Text>

                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1 bg-orange-500 p-5 rounded-[28px] shadow-lg shadow-orange-200 items-center">
                            <View className="w-9 h-9 bg-orange-400/30 rounded-full items-center justify-center mb-3">
                                <FontAwesome name="fire" size={16} color="white" />
                            </View>
                            <Text className="text-white text-2xl font-black">{planMeta.dailyCalorieTarget}</Text>
                            <Text className="text-orange-100 text-[9px] font-black uppercase tracking-widest mt-1 text-center">kcal / day</Text>
                        </View>

                        <View className="flex-1 bg-indigo-500 p-5 rounded-[28px] shadow-lg shadow-indigo-200 items-center">
                            <View className="w-9 h-9 bg-indigo-400/30 rounded-full items-center justify-center mb-3">
                                <FontAwesome name="flash" size={16} color="white" />
                            </View>
                            <Text className="text-white text-2xl font-black">{planMeta.dailyProteinTarget_g}</Text>
                            <Text className="text-indigo-100 text-[9px] font-black uppercase tracking-widest mt-1 text-center">protein (g)</Text>
                        </View>

                        <View className="flex-1 bg-emerald-500 p-5 rounded-[28px] shadow-lg shadow-emerald-200 items-center">
                            <View className="w-9 h-9 bg-emerald-400/30 rounded-full items-center justify-center mb-3">
                                <FontAwesome name="cutlery" size={16} color="white" />
                            </View>
                            <Text className="text-white text-2xl font-black">{planMeta.mealsPerDay}</Text>
                            <Text className="text-emerald-100 text-[9px] font-black uppercase tracking-widest mt-1 text-center">meals / day</Text>
                        </View>
                    </View>

                    {/* ── Vitals & Lifestyle ────────────────────────────────── */}
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Vitals & Lifestyle</Text>

                    <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-6">
                        {vitals.map((item, i) => (
                            <View
                                key={item.label}
                                className={`flex-row items-center px-4 py-4 ${i < vitals.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                                <View className={`w-10 h-10 ${item.bg} rounded-xl items-center justify-center mr-4`}>
                                    <FontAwesome name={item.icon as any} size={16} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</Text>
                                    <Text className="text-gray-900 font-black text-base">{item.value || 'Not set'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* ── Wellness Focus ────────────────────────────────────── */}
                    {planMeta.skinNotes && (
                        <View className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 mb-6">
                            <View className="flex-row items-center gap-3 mb-3">
                                <View className="w-8 h-8 bg-indigo-100 rounded-xl items-center justify-center">
                                    <FontAwesome name="magic" size={14} color="#4F46E5" />
                                </View>
                                <Text className="text-indigo-900 font-black text-[10px] uppercase tracking-widest">Wellness Focus</Text>
                            </View>
                            <Text className="text-indigo-800/80 text-xs leading-relaxed font-medium">
                                {planMeta.skinNotes}
                            </Text>
                        </View>
                    )}

                    {/* ── Close ─────────────────────────────────────────────── */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        className="bg-gray-900 p-6 rounded-[28px] items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 6 },
                        }}
                    >
                        <Text className="text-white font-black text-lg">Close Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
