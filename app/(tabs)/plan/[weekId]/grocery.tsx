import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

export default function GroceryEditScreen() {
    const { weekId } = useLocalSearchParams<{ weekId: string }>();
    const { weeks, addGroceryItem, removeGroceryItem } = useAppStore();
    const week = weeks.find(w => w.id === weekId);

    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');

    if (!week) return null;

    const handleAdd = () => {
        if (!itemName.trim()) return;
        addGroceryItem(weekId!, { name: itemName, quantity: quantity });
        setItemName('');
        setQuantity('');
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ title: 'Edit Groceries' }} />

            <FlatList
                data={week.groceryList}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className="flex-row items-center py-4 border-b border-gray-50">
                        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                            <Text className="text-gray-400 font-bold">{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
                            {!!item.quantity && <Text className="text-gray-400 text-sm">{item.quantity}</Text>}
                        </View>
                        <Pressable onPress={() => removeGroceryItem(weekId!, item.id)} className="p-2 bg-rose-50 rounded-full">
                            <FontAwesome name="trash" size={16} color="#F43F5E" />
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No items yet. Add something below!</Text>}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
                className="p-6 bg-white border-t border-gray-100 shadow-sm"
            >
                <View className="flex-row mb-3">
                    <TextInput
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mr-3 text-gray-800"
                        placeholder="Item (e.g. Milk)"
                        value={itemName}
                        onChangeText={setItemName}
                    />
                    <TextInput
                        className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                        placeholder="Qty"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>
                <Pressable onPress={handleAdd} className="bg-emerald-500 rounded-xl py-4 items-center active:bg-emerald-600">
                    <Text className="text-white font-bold text-base">Add Item</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
}
