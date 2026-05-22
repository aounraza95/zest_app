import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SectionList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroceryItem } from '@/types';

export default function GroceryEditScreen() {
    const { weekId } = useLocalSearchParams<{ weekId: string }>();
    const { weeks, addGroceryItem, removeGroceryItem, updateGroceryItem } = useAppStore();
    const week = weeks.find(w => w.id === weekId);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('General');

    if (!week) return null;

    const handleOpenAdd = () => {
        setEditingItem(null);
        setItemName('');
        setQuantity('');
        setCategory('General');
        setModalVisible(true);
    };

    const handleOpenEdit = (item: GroceryItem) => {
        setEditingItem(item);
        setItemName(item.name);
        setQuantity(item.quantity || '');
        setCategory(item.category || 'General');
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!itemName.trim()) {
            Alert.alert('Required', 'Item name is needed');
            return;
        }
        if (editingItem) {
            updateGroceryItem(weekId!, editingItem.id, {
                name: itemName.trim(),
                quantity: quantity.trim(),
                category: category.trim() || 'General',
            });
        } else {
            addGroceryItem(weekId!, {
                name: itemName.trim(),
                quantity: quantity.trim(),
                category: category.trim() || 'General',
            });
        }
        setItemName('');
        setQuantity('');
        setModalVisible(false);
    };

    const handleRemove = (itemId: string) => {
        Alert.alert(
            'Remove Item',
            'Delete this item from your weekly list?',
            [
                { text: 'Keep', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeGroceryItem(weekId!, itemId) },
            ],
        );
    };

    const sections = useMemo(() => {
        const groups: { [key: string]: typeof week.groceryList } = {};
        week.groceryList.forEach(item => {
            const cat = item.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return Object.keys(groups).sort().map(cat => ({
            title: cat,
            data: groups[cat].sort((a, b) => a.name.localeCompare(b.name)),
        }));
    }, [week.groceryList]);

    return (
        <View className="flex-1 bg-gray-50">
            {/* ══ Custom Header ════════════════════════════════════════════ */}
            <View className="bg-white pt-16 px-6 pb-6 border-b border-gray-100">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                    >
                        <FontAwesome name="chevron-left" size={14} color="#4B5563" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">{week.label}</Text>
                        <Text className="text-2xl font-black text-gray-900 tracking-tight">Grocery List</Text>
                    </View>
                    <View className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Text className="text-indigo-600 text-[9px] font-black uppercase tracking-wide">{week.groceryList.length} items</Text>
                    </View>
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 160,
                }}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="pt-4 pb-2">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            {title}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View className="flex-row items-center bg-white rounded-2xl mb-2 border border-gray-100 overflow-hidden"
                        style={{
                            shadowColor: '#000',
                            shadowOpacity: 0.03,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 1 },
                            elevation: 1,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => handleOpenEdit(item)}
                            activeOpacity={0.7}
                            className="flex-row items-center flex-1 px-4 py-3.5"
                        >
                            <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                                <FontAwesome name="shopping-basket" size={15} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900 leading-tight">{item.name}</Text>
                                {!!item.quantity && (
                                    <Text className="text-gray-400 text-xs mt-0.5">{item.quantity}</Text>
                                )}
                            </View>
                            <View className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center mr-2">
                                <FontAwesome name="pencil" size={10} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleRemove(item.id)}
                            activeOpacity={0.7}
                            className="w-14 self-stretch bg-rose-50 items-center justify-center border-l border-gray-100"
                        >
                            <FontAwesome name="trash-o" size={16} color="#F43F5E" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <FontAwesome name="shopping-cart" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-lg font-black text-gray-400">Empty List</Text>
                        <Text className="text-sm text-gray-400 text-center px-10 leading-relaxed mt-1">
                            Tap + to add your first grocery item.
                        </Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                onPress={handleOpenAdd}
                activeOpacity={0.7}
                style={{ bottom: insets.bottom + 80 }}
                className="absolute right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-xl shadow-emerald-200 z-50"
            >
                <FontAwesome name="plus" size={20} color="white" />
            </TouchableOpacity>

            {/* ══ Add / Edit Modal ══════════════════════════════════════════ */}
            <Modal
                animationType="slide"
                transparent
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
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                                    <FontAwesome name="shopping-basket" size={16} color="#10B981" />
                                </View>
                                <View>
                                    <Text className="text-xl font-black text-gray-900">
                                        {editingItem ? 'Edit Item' : 'New Item'}
                                    </Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">
                                        {editingItem ? `Editing "${editingItem.name}"` : 'Add to your grocery list'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                activeOpacity={0.7}
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <FontAwesome name="times" size={13} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View className="gap-4">
                            {/* Item name */}
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Item Name</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                    placeholder="e.g. Avocado"
                                    placeholderTextColor="#D1D5DB"
                                    value={itemName}
                                    onChangeText={setItemName}
                                    autoFocus
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Quantity</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                        placeholder="2 units"
                                        placeholderTextColor="#D1D5DB"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Category</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-800"
                                        placeholder="Produce"
                                        placeholderTextColor="#D1D5DB"
                                        value={category}
                                        onChangeText={setCategory}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                activeOpacity={0.7}
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
                                    {editingItem ? 'Save Changes' : 'Add to List'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                activeOpacity={0.7}
                                className="py-3 items-center"
                            >
                                <Text className="text-gray-400 font-medium">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
