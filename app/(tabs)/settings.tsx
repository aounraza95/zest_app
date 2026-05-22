import { useAppStore } from '@/store/useAppStore';
import { MealDefinition } from '@/types';
import { ZestIcon } from '@/components/ZestIcon';
import { getCurrentWeekIndex } from '@/utils/dateHelpers';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { TimePickerModal } from '@/components/TimePickerModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Reusable section label ───────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
    return (
        <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
            {label}
        </Text>
    );
}

export default function SettingsScreen() {
    const {
        settings,
        planMeta,
        setActiveWeekOverride,
        resetData,
        addMealDefinition,
        updateMealDefinition,
        removeMealDefinition,
        importData,
        toggleGroceryReminders,
        updateGroceryReminderSettings,
    } = useAppStore();

    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingDef, setEditingDef] = useState<MealDefinition | null>(null);
    const [defName, setDefName] = useState('');
    const [defTime, setDefTime] = useState('09:00');
    const [defNotify, setDefNotify] = useState(false);

    const [groceryTimePickerVisible, setGroceryTimePickerVisible] = useState(false);
    const [mealTimePickerVisible, setMealTimePickerVisible] = useState(false);

    const openModal = (def?: MealDefinition) => {
        if (def) {
            setEditingDef(def);
            setDefName(def.name);
            setDefTime(def.defaultTime || '09:00');
            setDefNotify(def.notify);
        } else {
            setEditingDef(null);
            setDefName('');
            setDefTime('09:00');
            setDefNotify(false);
        }
        setModalVisible(true);
    };

    const handleSaveDef = () => {
        if (!defName.trim()) {
            Alert.alert('Required', 'Please enter a name for this slot.');
            return;
        }
        if (editingDef) {
            updateMealDefinition(editingDef.id, {
                name: defName.trim(),
                defaultTime: defTime,
                notify: defNotify,
            });
        } else {
            addMealDefinition({
                id: Math.random().toString(36).substring(2, 9),
                name: defName.trim(),
                defaultTime: defTime,
                notify: defNotify,
            });
        }
        setModalVisible(false);
    };

    const handleDeleteDef = (id: string) => {
        Alert.alert(
            'Remove Meal Slot?',
            'This removes the slot from your plan views. Data already saved for this slot is preserved.',
            [
                { text: 'Keep Slot', style: 'cancel' },
                {
                    text: 'Remove Permanently',
                    style: 'destructive',
                    onPress: () => removeMealDefinition(id),
                },
            ],
        );
    };

    const handleReset = () => {
        Alert.alert(
            'Reset All Data',
            'This will permanently wipe ALL plans, slots, and settings from both local and cloud storage. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await resetData();
                        Alert.alert('Done', 'All data has been cleared successfully.');
                    },
                },
            ],
        );
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const response = await fetch(fileUri);
            const parsedData = await response.json();

            if (!parsedData.weeks && !parsedData.settings) {
                Alert.alert('Invalid File', "JSON must contain a 'weeks' or 'settings' key.");
                return;
            }

            await importData(parsedData);
            Alert.alert('Success', 'Data imported successfully!');
        } catch (err: any) {
            Alert.alert('Import Failed', err?.message || 'Something went wrong while reading the file.');
        }
    };

    const autoWeekIndex = getCurrentWeekIndex();
    const isOverrideActive = !!settings.activeWeekOverride;
    const effectiveWeekId = settings.activeWeekOverride ?? `week-${autoWeekIndex}`;
    const effectiveWeekNum = parseInt(effectiveWeekId.split('-')[1]) + 1;

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ══ Type B Header ════════════════════════════════════════════ */}
                <View className="bg-white pt-16 px-6 pb-6 border-b border-gray-100 mb-6">
                    <View className="flex-row items-center gap-3">
                        <ZestIcon size={40} />
                        <View>
                            <Text className="text-3xl font-black text-gray-900 tracking-tight">Settings</Text>
                            <Text className="text-gray-400 text-sm font-medium">
                                Preferences & plan configuration
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-4">

                    {/* ── Health Profile ────────────────────────────────────── */}
                    <View className="mb-6">
                        <SectionLabel label="Your Profile" />
                        <Pressable
                            onPress={() => router.push('/health_profile')}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 active:opacity-90"
                            style={{
                                shadowColor: '#10B981',
                                shadowOpacity: 0.12,
                                shadowRadius: 12,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 3,
                            }}
                        >
                            {/* Emerald hero strip */}
                            <View className="bg-emerald-500 px-5 pt-5 pb-5">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center">
                                            <FontAwesome name="user-md" size={20} color="white" />
                                        </View>
                                        <View>
                                            <Text className="text-white font-black text-base">Health Profile</Text>
                                            <Text className="text-emerald-100 text-[10px] font-bold mt-0.5">
                                                {planMeta?.purpose || 'Goals & body metrics'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                                        <FontAwesome name="chevron-right" size={11} color="white" />
                                    </View>
                                </View>

                                {/* Quick stats */}
                                <View className="flex-row gap-2">
                                    {[
                                        { label: 'Calories', value: planMeta?.dailyCalorieTarget ? `${planMeta.dailyCalorieTarget} kcal` : '—' },
                                        { label: 'Protein',  value: planMeta?.dailyProteinTarget_g ? `${planMeta.dailyProteinTarget_g}g` : '—' },
                                        { label: 'Meals',    value: planMeta?.mealsPerDay ? `${planMeta.mealsPerDay}/day` : '—' },
                                    ].map(stat => (
                                        <View key={stat.label} className="flex-1 bg-white/15 rounded-xl px-3 py-2">
                                            <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest">{stat.label}</Text>
                                            <Text className="text-white font-black text-sm mt-0.5">{stat.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Bottom tap hint */}
                            <View className="px-5 py-3 flex-row items-center gap-2 bg-white">
                                <FontAwesome name="eye" size={11} color="#10B981" />
                                <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">View full profile</Text>
                            </View>
                        </Pressable>
                    </View>

                    {/* ── Meal Slots ────────────────────────────────────────── */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-2 px-1">
                            <SectionLabel label="Meal Slots" />
                            <Pressable
                                onPress={() => openModal()}
                                className="flex-row items-center gap-1 bg-emerald-100 px-2.5 py-1.5 rounded-lg active:bg-emerald-200"
                            >
                                <FontAwesome name="plus" size={9} color="#059669" />
                                <Text className="text-[10px] font-black text-emerald-700">New Slot</Text>
                            </Pressable>
                        </View>

                        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            {settings.mealDefinitions.length === 0 ? (
                                <View className="items-center py-8 px-6 opacity-50">
                                    <FontAwesome name="cutlery" size={24} color="#9CA3AF" />
                                    <Text className="text-gray-500 font-bold text-sm mt-3 text-center">
                                        No meal slots yet
                                    </Text>
                                    <Text className="text-gray-400 text-xs mt-1 text-center leading-relaxed">
                                        Add slots like Breakfast, Lunch, Dinner to structure your daily plan.
                                    </Text>
                                </View>
                            ) : (
                                settings.mealDefinitions.map((def, index) => (
                                    <View
                                        key={def.id}
                                        className={`flex-row items-center px-4 py-3.5 ${
                                            index < settings.mealDefinitions.length - 1
                                                ? 'border-b border-gray-50'
                                                : ''
                                        }`}
                                    >
                                        {/* Time badge */}
                                        <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-3 flex-shrink-0 border border-gray-100">
                                            <Text className="text-[10px] font-black text-gray-600 leading-tight">
                                                {(def.defaultTime || '—').split(':')[0]}
                                            </Text>
                                            <Text className="text-[8px] font-bold text-gray-400">
                                                {(def.defaultTime || '—').split(':')[1] ?? ''}
                                            </Text>
                                        </View>

                                        <View className="flex-1">
                                            <Text className="font-bold text-gray-800 text-sm">{def.name}</Text>
                                            <View className="flex-row items-center gap-1.5 mt-0.5">
                                                <FontAwesome
                                                    name={def.notify ? 'bell' : 'bell-o'}
                                                    size={9}
                                                    color={def.notify ? '#10B981' : '#9CA3AF'}
                                                />
                                                <Text
                                                    className={`text-[9px] font-bold ${
                                                        def.notify ? 'text-emerald-500' : 'text-gray-400'
                                                    }`}
                                                >
                                                    {def.notify ? 'Reminder on' : 'No reminder'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row gap-2">
                                            <Pressable
                                                onPress={() => openModal(def)}
                                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
                                            >
                                                <FontAwesome name="pencil" size={12} color="#4B5563" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDeleteDef(def.id)}
                                                className="w-8 h-8 bg-rose-50 rounded-full items-center justify-center active:bg-rose-100"
                                            >
                                                <FontAwesome name="trash" size={12} color="#F43F5E" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    {/* ── Notifications ─────────────────────────────────────── */}
                    <View className="mb-6">
                        <SectionLabel label="Notifications" />
                        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            {/* Reminders toggle */}
                            <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-50">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center">
                                        <FontAwesome name="bell" size={16} color="#6366F1" />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-bold text-gray-800">
                                            Grocery Reminders
                                        </Text>
                                        <Text className="text-[10px] text-gray-400 mt-0.5">
                                            Get reminded to go shopping
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={settings.isGroceryReminderEnabled}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor="#FFFFFF"
                                    onValueChange={toggleGroceryReminders}
                                />
                            </View>

                            {/* Schedule — dims when reminders are off */}
                            <View style={{ opacity: settings.isGroceryReminderEnabled ? 1 : 0.38 }}>
                                {/* Shopping day picker */}
                                <View className="px-4 pt-4 pb-3 border-b border-gray-50">
                                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                        Shopping Day
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {DAYS.map((day, i) => {
                                            const isActive = settings.groceryReminderDay === i + 1;
                                            return (
                                                <Pressable
                                                    key={i}
                                                    onPress={() =>
                                                        updateGroceryReminderSettings({
                                                            groceryReminderDay: i + 1,
                                                        })
                                                    }
                                                    disabled={!settings.isGroceryReminderEnabled}
                                                    className={`px-3.5 py-2 rounded-xl border ${
                                                        isActive
                                                            ? 'bg-emerald-500 border-emerald-500'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-xs font-black ${
                                                            isActive ? 'text-white' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {day}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Reminder time */}
                                <View className="px-4 py-4">
                                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Reminder Time
                                    </Text>
                                    <Pressable
                                        onPress={() => setGroceryTimePickerVisible(true)}
                                        disabled={!settings.isGroceryReminderEnabled}
                                        className={`flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 ${
                                            !settings.isGroceryReminderEnabled ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <Text className="text-base font-bold text-gray-800">
                                            {settings.groceryReminderTime || '09:00'}
                                        </Text>
                                        <FontAwesome name="chevron-down" size={12} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ── Active Week ───────────────────────────────────────── */}
                    <View className="mb-6">
                        <SectionLabel label="Active Week" />
                        <View className="bg-white rounded-2xl border border-gray-100 p-4">
                            {/* Status row */}
                            <View className="flex-row items-start gap-3 mb-4">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center flex-shrink-0">
                                    <FontAwesome name="calendar-check-o" size={16} color="#10B981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-800">
                                        {isOverrideActive
                                            ? `Override — Week ${effectiveWeekNum}`
                                            : `Auto — Week ${effectiveWeekNum}`}
                                    </Text>
                                    <Text className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                                        {isOverrideActive
                                            ? 'Manually locked. Tap the active week below to release back to auto.'
                                            : `Auto-cycling based on today's date. Select a week to override.`}
                                    </Text>
                                </View>
                            </View>

                            {/* Week selector */}
                            <View className="flex-row gap-2">
                                {[0, 1, 2, 3].map(i => {
                                    const weekId = `week-${i}`;
                                    const isSelected = effectiveWeekId === weekId;
                                    const isAutoWeek = !isOverrideActive && autoWeekIndex === i;
                                    return (
                                        <Pressable
                                            key={i}
                                            onPress={() =>
                                                setActiveWeekOverride(
                                                    settings.activeWeekOverride === weekId ? null : weekId,
                                                )
                                            }
                                            className={`flex-1 items-center py-2.5 rounded-xl border ${
                                                isSelected
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-black ${
                                                    isSelected ? 'text-white' : 'text-gray-600'
                                                }`}
                                            >
                                                Wk {i + 1}
                                            </Text>
                                            {isAutoWeek && (
                                                <Text className="text-[7px] font-bold text-emerald-500 mt-0.5 uppercase">
                                                    Auto
                                                </Text>
                                            )}
                                            {isOverrideActive && isSelected && (
                                                <Text className="text-[7px] font-bold text-emerald-100 mt-0.5 uppercase">
                                                    Active
                                                </Text>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* ── Data Management ───────────────────────────────────── */}
                    <View className="mb-6">
                        <SectionLabel label="Data" />
                        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            {/* Import */}
                            <Pressable
                                onPress={handleImport}
                                className="flex-row items-center gap-4 px-4 py-4 border-b border-gray-50 active:bg-gray-50"
                            >
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                                    <FontAwesome name="upload" size={16} color="#10B981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-800">Import JSON Plan</Text>
                                    <Text className="text-[10px] text-gray-400 mt-0.5">
                                        Load a meal plan file from your device
                                    </Text>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color="#D1D5DB" />
                            </Pressable>

                            {/* Reset */}
                            <Pressable
                                onPress={handleReset}
                                className="flex-row items-center gap-4 px-4 py-4 active:bg-rose-50"
                            >
                                <View className="w-10 h-10 bg-rose-50 rounded-xl items-center justify-center">
                                    <FontAwesome name="trash" size={16} color="#F43F5E" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-rose-500">Reset All Data</Text>
                                    <Text className="text-[10px] text-rose-300 mt-0.5">
                                        Permanently wipe plans, slots & settings
                                    </Text>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color="#FCA5A5" />
                            </Pressable>
                        </View>
                    </View>

                    {/* ── Footer ────────────────────────────────────────────── */}
                    <View className="items-center mt-4 opacity-50">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">
                            Zest · v1.0.0
                        </Text>
                        <Text className="text-gray-300 text-[8px] mt-1 uppercase tracking-widest">
                            Crafted for healthy living
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* ══ Meal Slot Modal ═══════════════════════════════════════════════ */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end bg-black/50"
                >
                    <View className="bg-white rounded-t-[40px] p-8 shadow-2xl">
                        {/* Drag handle */}
                        <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                        {/* Modal header */}
                        <View className="flex-row items-center gap-3 mb-6">
                            <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                                <FontAwesome name="cutlery" size={16} color="#10B981" />
                            </View>
                            <View>
                                <Text className="text-xl font-black text-gray-900 tracking-tight">
                                    {editingDef ? 'Edit Slot' : 'New Meal Slot'}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {editingDef
                                        ? `Editing "${editingDef.name}"`
                                        : 'Configure a new daily meal slot'}
                                </Text>
                            </View>
                        </View>

                        <View className="gap-4">
                            {/* Slot name */}
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    Slot Name
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                    placeholder="e.g. Breakfast"
                                    placeholderTextColor="#9CA3AF"
                                    value={defName}
                                    onChangeText={setDefName}
                                    autoFocus={true}
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Default time */}
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    Default Time
                                </Text>
                                <Pressable
                                    onPress={() => setMealTimePickerVisible(true)}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4"
                                >
                                    <Text className="text-base font-bold text-gray-800">
                                        {defTime || '09:00'}
                                    </Text>
                                    <FontAwesome name="chevron-down" size={12} color="#9CA3AF" />
                                </Pressable>
                            </View>

                            {/* Reminder toggle row */}
                            <View className="flex-row justify-between items-center bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
                                <View className="flex-row items-center gap-3">
                                    <FontAwesome
                                        name="bell"
                                        size={16}
                                        color={defNotify ? '#10B981' : '#9CA3AF'}
                                    />
                                    <View>
                                        <Text className="text-sm font-bold text-gray-800">Daily Reminder</Text>
                                        <Text className="text-[10px] text-gray-400 mt-0.5">
                                            Notify me at meal time
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={defNotify}
                                    onValueChange={setDefNotify}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            {/* Save CTA */}
                            <Pressable
                                onPress={handleSaveDef}
                                className="bg-emerald-500 py-4 rounded-2xl items-center mt-2 active:bg-emerald-600"
                                style={{
                                    shadowColor: '#10B981',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 4,
                                }}
                            >
                                <Text className="text-white font-black text-lg">
                                    {editingDef ? 'Save Changes' : 'Add Slot'}
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => setModalVisible(false)} className="py-3 items-center">
                                <Text className="text-gray-400 font-medium">Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ══ Grocery Reminder Time Picker ══════════════════════════════════ */}
            <TimePickerModal
                visible={groceryTimePickerVisible}
                initialTime={settings.groceryReminderTime || '09:00'}
                onClose={() => setGroceryTimePickerVisible(false)}
                onConfirm={(formattedTime) => {
                    updateGroceryReminderSettings({ groceryReminderTime: formattedTime });
                }}
                title="Shopping Reminder"
            />

            {/* ══ Meal Slot Time Picker ═════════════════════════════════════════ */}
            <TimePickerModal
                visible={mealTimePickerVisible}
                initialTime={defTime || '09:00'}
                onClose={() => setMealTimePickerVisible(false)}
                onConfirm={(formattedTime) => {
                    setDefTime(formattedTime);
                }}
                title="Meal Slot Time"
            />
        </View>
    );
}
