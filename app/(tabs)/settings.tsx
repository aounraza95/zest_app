import { useAppStore } from '@/store/useAppStore';
import { MealDefinition } from '@/types';
import { registerForPushNotificationsAsync, scheduleAllReminders } from '@/utils/notifications';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

export default function SettingsScreen() {
    const { settings, setActiveWeekOverride, resetData, addMealDefinition, updateMealDefinition, removeMealDefinition, importData } = useAppStore();
    const [reminderEnabled, setReminderEnabled] = useState(false);

    // Modal State for Edit/Add
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDef, setEditingDef] = useState<MealDefinition | null>(null);
    const [defName, setDefName] = useState('');
    const [defTime, setDefTime] = useState('');
    const [defNotify, setDefNotify] = useState(false);

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
            alert("Name required");
            return;
        }
        if (editingDef) {
            updateMealDefinition(editingDef.id, { name: defName, defaultTime: defTime, notify: defNotify });
        } else {
            addMealDefinition({
                id: Math.random().toString(36).substring(2, 9),
                name: defName,
                defaultTime: defTime,
                notify: defNotify
            });
        }
        setModalVisible(false);
    };

    const handleDeleteDef = (id: string) => {
        Alert.alert("Delete Slot", "This will remove this slot from future days. Existing plans keep their data.", [
            { text: "Cancel" },
            { text: "Delete", style: 'destructive', onPress: () => removeMealDefinition(id) }
        ]);
    };

    const handleReset = () => {
        Alert.alert(
            "Reset All Data",
            "Are you sure? This will delete all meal plans and grocery lists.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Everything", style: "destructive", onPress: async () => {
                        resetData();
                        alert("Data reset.");
                    }
                }
            ]
        );
    };

    const toggleNotifications = async (value: boolean) => {
        setReminderEnabled(value);
        if (value) {
            const granted = await registerForPushNotificationsAsync();
            if (granted) {
                scheduleAllReminders(settings.mealDefinitions, true);
                alert("Reminders set for groceries and active meal slots.");
            } else {
                setReminderEnabled(false);
                alert("Permission not granted. Please enable notifications in device settings.");
            }
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="pt-16 pb-6 px-6">
                    <Text className="text-3xl font-bold text-gray-900">Settings</Text>
                </View>

                <View className="px-4 pb-20">
                    {/* Section: Dynamic Meal Slots */}
                    <View className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                        <View className="p-4 border-b border-gray-50 bg-gray-50/50 flex-row justify-between items-center">
                            <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider">Meal Slots</Text>
                            <Pressable onPress={() => openModal()} className="bg-emerald-100 px-2 py-1 rounded">
                                <Text className="text-emerald-700 text-xs font-bold">+ New</Text>
                            </Pressable>
                        </View>
                        {settings.mealDefinitions.map((def) => (
                            <View key={def.id} className="p-4 border-b border-gray-50 flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-800">{def.name}</Text>
                                    <Text className="text-xs text-gray-400">
                                        {def.defaultTime || 'No time'} • {def.notify ? 'Notify On' : 'Notify Off'}
                                    </Text>
                                </View>
                                <View className="flex-row gap-4">
                                    <Pressable onPress={() => openModal(def)}>
                                        <FontAwesome name="pencil" size={16} color="#4B5563" />
                                    </Pressable>
                                    <Pressable onPress={() => handleDeleteDef(def.id)}>
                                        <FontAwesome name="trash" size={16} color="#F43F5E" />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Section: Notifications */}
                    <View className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                        <View className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider">Preferences</Text>
                        </View>
                        <View className="p-4 flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                                    <FontAwesome name="bell" size={14} color="#6366F1" />
                                </View>
                                <Text className="text-gray-800 font-medium">Grocery Reminders</Text>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                                onValueChange={toggleNotifications}
                            />
                        </View>
                    </View>

                    {/* Section: Override */}
                    <View className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                        <View className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider">Active Week Override</Text>
                        </View>
                        <View className="p-4 flex-row flex-wrap gap-2">
                            {[0, 1, 2, 3].map(i => {
                                const weekId = `week-${i}`;
                                const isActive = settings.activeWeekOverride === weekId;
                                return (
                                    <Pressable
                                        key={i}
                                        className={`px-4 py-2 rounded-lg border ${isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}
                                        onPress={() => setActiveWeekOverride(isActive ? null : weekId)}
                                    >
                                        <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                            WK {i + 1}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Section: Data Management */}
                    <View className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                        <View className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider">Data Management</Text>
                        </View>

                        <View className="p-4">
                            <Pressable
                                onPress={async () => {
                                    try {
                                        const result = await DocumentPicker.getDocumentAsync({
                                            type: 'application/json',
                                            copyToCacheDirectory: true
                                        });

                                        if (result.canceled) return;

                                        const fileUri = result.assets[0].uri;

                                        // Use fetch for file:// or content:// URIs
                                        const response = await fetch(fileUri);
                                        const parsedData = await response.json();

                                        // Basic validation
                                        if (!parsedData.weeks && !parsedData.settings) {
                                            alert("Invalid JSON format. Needs 'weeks' or 'settings'.");
                                            return;
                                        }

                                        importData(parsedData);
                                        alert("Data imported successfully!");

                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to import data.");
                                    }
                                }}
                                className="bg-emerald-50 p-4 rounded-xl flex-row items-center justify-center mb-3 border border-emerald-100"
                            >
                                <FontAwesome name="upload" size={16} color="#10B981" />
                                <Text className="text-emerald-700 font-bold ml-2">Import JSON Data</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleReset}
                                className="bg-rose-50 p-4 rounded-xl items-center flex-row justify-center border border-rose-100"
                            >
                                <FontAwesome name="trash-o" size={16} color="#F43F5E" />
                                <Text className="text-rose-500 font-bold ml-2">Reset All Data</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text className="text-center text-gray-300 text-xs mt-8">Grocery Meal Helper v1.0.0</Text>
                </View>
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
                        <Text className="text-xl font-bold text-gray-900 mb-6">
                            {editingDef ? 'Edit Slot' : 'New Meal Slot'}
                        </Text>

                        <Text className="text-sm font-semibold text-gray-500 mb-2">Slot Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="e.g. Breakfast"
                            value={defName}
                            onChangeText={setDefName}
                        />

                        <Text className="text-sm font-semibold text-gray-500 mb-2">Default Time (24h)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="HH:MM"
                            value={defTime}
                            onChangeText={setDefTime}
                        />

                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="font-semibold text-gray-800">Daily Reminder</Text>
                            <Switch
                                value={defNotify}
                                onValueChange={setDefNotify}
                                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                            />
                        </View>

                        <Pressable onPress={handleSaveDef} className="bg-emerald-500 py-4 rounded-xl items-center mb-2">
                            <Text className="text-white font-bold text-base">Save</Text>
                        </Pressable>
                        <Pressable onPress={() => setModalVisible(false)} className="py-4 items-center">
                            <Text className="text-gray-500 font-medium">Cancel</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
