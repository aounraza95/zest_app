import { GroceryItem } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useActiveWeek } from '@/hooks/useActiveWeek';
import { ZestIcon } from '@/components/ZestIcon';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SectionList,
    Text,
    TextInput,
    View,
} from 'react-native';

type GrocerySection = {
    title: string;
    data: GroceryItem[];
    total: number;
    done: number;
};

export default function GroceriesScreen() {
    const { weeks, toggleGroceryItem, clearGroceryChecks, addGroceryItem, removeGroceryItem } =
        useAppStore();
    const activeWeek = useActiveWeek();

    const [selectedWeekId, setSelectedWeekId] = useState<string>(activeWeek.id);
    const [hideCompleted, setHideCompleted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemCat, setNewItemCat] = useState('General');

    const selectedWeek = weeks.find(w => w.id === selectedWeekId) ?? activeWeek;
    const isCurrentWeek = selectedWeek.id === activeWeek.id;

    const handleClearChecks = () => {
        Alert.alert(
            'Clear Checked Items?',
            'This will uncheck all completed items in your list.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => clearGroceryChecks(selectedWeek.id),
                },
            ],
        );
    };

    const handleAddItem = () => {
        if (!newItemName.trim()) {
            Alert.alert('Item Name Required', 'Please enter a name for the item.');
            return;
        }
        addGroceryItem(selectedWeek.id, {
            name: newItemName.trim(),
            quantity: newItemQty.trim(),
            category: newItemCat.trim() || 'General',
        });
        setNewItemName('');
        setNewItemQty('');
        setNewItemCat('General');
        setModalVisible(false);
    };

    const handleRemoveItem = (itemId: string) => {
        Alert.alert(
            'Remove Item?',
            'This will permanently remove the item from your list.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeGroceryItem(selectedWeek.id, itemId),
                },
            ],
        );
    };

    const completedCount = selectedWeek.groceryList.filter(i => i.isChecked).length;
    const totalCount = selectedWeek.groceryList.length;
    const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const sections = useMemo((): GrocerySection[] => {
        const groups: Record<string, GroceryItem[]> = {};

        const list = hideCompleted
            ? selectedWeek.groceryList.filter(item => !item.isChecked)
            : selectedWeek.groceryList;

        list.forEach(item => {
            const cat = item.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        return Object.keys(groups)
            .sort()
            .map(category => ({
                title: category,
                data: groups[category].sort((a, b) => {
                    if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
                    return a.name.localeCompare(b.name);
                }),
                total: groups[category].length,
                done: groups[category].filter(i => i.isChecked).length,
            }));
    }, [selectedWeek.groceryList, hideCompleted]);

    return (
        <View className="flex-1 bg-gray-50">

            {/* ══ Type B — White Header ═════════════════════════════════════════ */}
            <View className="bg-white pt-16 px-6 pb-5 border-b border-gray-100">

                {/* Row 1: logo + title + actions */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                        <ZestIcon size={40} />
                        <View>
                            <Text className="text-3xl font-black text-gray-900 tracking-tight">
                                Groceries
                            </Text>
                            <Text className="text-gray-400 text-sm font-medium">
                                {selectedWeek.label}
                                {isCurrentWeek ? ' · Current' : ''}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                        {/* Hide completed toggle */}
                        <Pressable
                            onPress={() => setHideCompleted(h => !h)}
                            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full ${
                                hideCompleted ? 'bg-emerald-100' : 'bg-gray-100'
                            }`}
                        >
                            <FontAwesome
                                name={hideCompleted ? 'eye-slash' : 'eye'}
                                size={11}
                                color={hideCompleted ? '#059669' : '#6B7280'}
                            />
                            <Text
                                className={`text-[10px] font-bold ${
                                    hideCompleted ? 'text-emerald-700' : 'text-gray-600'
                                }`}
                            >
                                {hideCompleted ? 'Showing' : 'Hide done'}
                            </Text>
                        </Pressable>

                        {/* Add item FAB */}
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center active:bg-emerald-600 shadow-sm"
                        >
                            <FontAwesome name="plus" size={16} color="white" />
                        </Pressable>
                    </View>
                </View>

                {/* Row 2: Week tabs — browse any week's list */}
                <View className="flex-row gap-2 mb-4">
                    {weeks.map(week => {
                        const isSelected = week.id === selectedWeekId;
                        const isCurrent = week.id === activeWeek.id;
                        const wDone = week.groceryList.filter(i => i.isChecked).length;
                        const wTotal = week.groceryList.length;
                        return (
                            <Pressable
                                key={week.id}
                                onPress={() => setSelectedWeekId(week.id)}
                                className={`flex-1 items-center py-2 rounded-xl border ${
                                    isSelected
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <Text
                                    className={`text-[10px] font-black ${
                                        isSelected ? 'text-white' : 'text-gray-600'
                                    }`}
                                >
                                    Wk {week.label.split(' ')[1]}
                                </Text>
                                {wTotal > 0 && (
                                    <Text
                                        className={`text-[8px] font-bold mt-0.5 ${
                                            isSelected ? 'text-emerald-100' : 'text-gray-400'
                                        }`}
                                    >
                                        {wDone}/{wTotal}
                                    </Text>
                                )}
                                {isCurrent && !isSelected && (
                                    <View className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                                )}
                            </Pressable>
                        );
                    })}
                </View>

                {/* Progress bar + stats */}
                <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                    />
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {completedCount}/{totalCount} items done
                    </Text>
                    {completedCount > 0 && (
                        <Pressable onPress={handleClearChecks} hitSlop={8}>
                            <Text className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                Clear checked
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* ══ Grocery Section List ══════════════════════════════════════════ */}
            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }: { section: GrocerySection }) => (
                    <View className="flex-row items-center justify-between pt-5 pb-2 px-1">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            {section.title}
                        </Text>
                        <Text className="text-[9px] font-bold text-gray-400">
                            {section.done > 0 ? `${section.done}/` : ''}
                            {section.total} item{section.total !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
                renderItem={({
                    item,
                    index,
                    section,
                }: {
                    item: GroceryItem;
                    index: number;
                    section: GrocerySection;
                }) => {
                    const isFirst = index === 0;
                    const isLast = index === section.data.length - 1;
                    return (
                        <View
                            className={`flex-row items-center bg-white ${
                                isFirst && isLast
                                    ? 'rounded-2xl'
                                    : isFirst
                                    ? 'rounded-t-2xl'
                                    : isLast
                                    ? 'rounded-b-2xl'
                                    : ''
                            } ${!isLast ? 'border-b border-gray-50' : ''}`}
                            style={
                                isLast
                                    ? {
                                          shadowColor: '#000',
                                          shadowOpacity: 0.03,
                                          shadowRadius: 6,
                                          shadowOffset: { width: 0, height: 2 },
                                          elevation: 1,
                                      }
                                    : undefined
                            }
                        >
                            {/* Checkbox + item info */}
                            <Pressable
                                onPress={() => toggleGroceryItem(selectedWeek.id, item.id)}
                                style={{ opacity: item.isChecked ? 0.4 : 1 }}
                                className="flex-row items-center flex-1 px-4 py-3.5 gap-3"
                            >
                                <View
                                    className={`w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 ${
                                        item.isChecked
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    {item.isChecked && (
                                        <FontAwesome name="check" size={11} color="white" />
                                    )}
                                </View>

                                <View className="flex-1">
                                    <Text
                                        className={`text-base ${
                                            item.isChecked
                                                ? 'text-gray-400'
                                                : 'text-gray-800 font-semibold'
                                        }`}
                                        style={{
                                            textDecorationLine: item.isChecked ? 'line-through' : 'none',
                                        }}
                                    >
                                        {item.name}
                                    </Text>
                                    {!!item.quantity && (
                                        <Text className="text-xs text-gray-400 mt-0.5">{item.quantity}</Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Delete — rose icon button per branding guide */}
                            <Pressable
                                onPress={() => handleRemoveItem(item.id)}
                                hitSlop={8}
                                className="w-8 h-8 bg-rose-50 rounded-full items-center justify-center mr-4 active:bg-rose-100"
                            >
                                <FontAwesome name="trash-o" size={13} color="#F43F5E" />
                            </Pressable>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-24 opacity-50">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-5">
                            <FontAwesome name="shopping-basket" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg mb-2">
                            {hideCompleted && totalCount > 0
                                ? 'All done!'
                                : 'List is empty'}
                        </Text>
                        <Text className="text-gray-400 text-sm text-center px-10 leading-relaxed">
                            {hideCompleted && totalCount > 0
                                ? "You've checked everything off. Great work!"
                                : "Tap + to add items, or import a meal plan that includes a grocery list."}
                        </Text>
                    </View>
                }
            />

            {/* ══ Add Item Bottom Sheet ═════════════════════════════════════════ */}
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
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900 tracking-tight">
                                Add Item
                            </Text>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
                            >
                                <FontAwesome name="times" size={14} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Adding to label */}
                        <View className="flex-row items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl mb-5 self-start">
                            <FontAwesome name="shopping-basket" size={10} color="#059669" />
                            <Text className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                                Adding to {selectedWeek.label}
                            </Text>
                        </View>

                        {/* Fields */}
                        <View className="gap-4">
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                    Item Name
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                    placeholder="e.g. Avocado"
                                    placeholderTextColor="#9CA3AF"
                                    value={newItemName}
                                    onChangeText={setNewItemName}
                                    autoFocus={true}
                                    returnKeyType="next"
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                        Quantity
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                        placeholder="e.g. 2 kg"
                                        placeholderTextColor="#9CA3AF"
                                        value={newItemQty}
                                        onChangeText={setNewItemQty}
                                        returnKeyType="next"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                        Category
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                        placeholder="e.g. Produce"
                                        placeholderTextColor="#9CA3AF"
                                        value={newItemCat}
                                        onChangeText={setNewItemCat}
                                        returnKeyType="done"
                                        onSubmitEditing={handleAddItem}
                                    />
                                </View>
                            </View>

                            <Pressable
                                onPress={handleAddItem}
                                className="bg-emerald-500 py-4 rounded-2xl items-center mt-2 active:bg-emerald-600"
                                style={{
                                    shadowColor: '#10B981',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 4,
                                }}
                            >
                                <Text className="text-white font-black text-lg">Add to List</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
