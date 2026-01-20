import { useAppStore } from '@/store/useAppStore';
import { getCurrentWeekIndex } from '@/utils/dateHelpers';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function GroceriesScreen() {
    const { weeks, settings, toggleGroceryItem, clearGroceryChecks } = useAppStore();

    // Active Week Logic
    const isoWeekIndex = getCurrentWeekIndex();
    const activeWeekId = settings.activeWeekOverride
        ? settings.activeWeekOverride
        : `week-${isoWeekIndex}`;

    const activeWeek = weeks.find(w => w.id === activeWeekId) || weeks[0];

    const handleClearChecks = () => {
        clearGroceryChecks(activeWeek.id);
    };

    const completedCount = activeWeek.groceryList.filter(i => i.isChecked).length;
    const totalCount = activeWeek.groceryList.length;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 px-6 pb-6 bg-white border-b border-gray-100">
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-3xl font-bold text-gray-900">Groceries</Text>
                        <Text className="text-gray-500 font-medium">{activeWeek.label} List</Text>
                    </View>
                    <Pressable
                        onPress={handleClearChecks}
                        className="bg-gray-100 px-4 py-2 rounded-full active:bg-gray-200"
                    >
                        <Text className="text-xs font-bold text-gray-600">Clear Checks</Text>
                    </Pressable>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${progress * 100}%` }}
                    />
                </View>
                <Text className="text-right text-xs text-gray-400 mt-2">
                    {completedCount} / {totalCount} items
                </Text>
            </View>

            <FlatList
                data={activeWeek.groceryList}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable
                        className={`flex-row items-center py-4 border-b border-gray-50 ${item.isChecked ? 'opacity-40' : ''}`}
                        onPress={() => toggleGroceryItem(activeWeek.id, item.id)}
                    >
                        <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${item.isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                            {item.isChecked && <FontAwesome name="check" size={12} color="white" />}
                        </View>
                        <View className="flex-1">
                            <Text className={`text-lg transition-all ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                                {item.name}
                            </Text>
                            {!!item.quantity && <Text className="text-gray-400 text-sm">{item.quantity}</Text>}
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <FontAwesome name="shopping-basket" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-400">List is empty</Text>
                        <Text className="text-gray-400 mt-1">Add items in the Plan tab</Text>
                    </View>
                }
            />
        </View>
    );
}
