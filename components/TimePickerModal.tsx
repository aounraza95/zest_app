import React, { useEffect, useState, useRef } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    Platform,
    StyleSheet,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface TimePickerModalProps {
    visible: boolean;
    initialTime: string; // "HH:MM"
    onClose: () => void;
    onConfirm: (formattedTime: string) => void;
    title?: string;
}

export function TimePickerModal({
    visible,
    initialTime,
    onClose,
    onConfirm,
    title = 'Select Time',
}: TimePickerModalProps) {
    // Parse initial time
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');

    const hoursScrollRef = useRef<ScrollView>(null);
    const minutesScrollRef = useRef<ScrollView>(null);

    // Available hours (24h format)
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    
    // Available minutes (every 5 minutes to avoid a super long list, but covering most real-world uses)
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

    useEffect(() => {
        if (visible && initialTime) {
            const parts = initialTime.split(':');
            const h = parts[0] || '09';
            const m = parts[1] || '00';
            
            // Adjust minute to the nearest 5-minute interval for selection
            const minVal = parseInt(m, 10);
            const roundedMin = Math.round(minVal / 5) * 5;
            const finalMin = String(roundedMin >= 60 ? 55 : roundedMin).padStart(2, '0');

            setSelectedHour(h);
            setSelectedMinute(finalMin);

            // Auto-scroll to selected items after a small delay to allow list mounting
            setTimeout(() => {
                const hourIdx = hours.indexOf(h);
                const minIdx = minutes.indexOf(finalMin);

                if (hourIdx >= 0 && hoursScrollRef.current) {
                    hoursScrollRef.current.scrollTo({ y: hourIdx * 45, animated: true });
                }
                if (minIdx >= 0 && minutesScrollRef.current) {
                    minutesScrollRef.current.scrollTo({ y: minIdx * 45, animated: true });
                }
            }, 100);
        }
    }, [visible, initialTime]);

    const handleConfirm = () => {
        onConfirm(`${selectedHour}:${selectedMinute}`);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    {/* Drag handle */}
                    <View style={styles.dragHandle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <FontAwesome name="clock-o" size={18} color="#10B981" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>{title}</Text>
                            <Text style={styles.headerSubtitle}>Pick an hour and minute</Text>
                        </View>
                    </View>

                    {/* Selected Time Display Preview */}
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewText}>
                            {selectedHour}
                            <Text style={styles.previewSeparator}> : </Text>
                            {selectedMinute}
                        </Text>
                    </View>

                    {/* Columns Selector */}
                    <View style={styles.columnsContainer}>
                        {/* Hours Column */}
                        <View style={styles.columnWrapper}>
                            <Text style={styles.columnLabel}>Hour</Text>
                            <View style={styles.scrollContainer}>
                                <ScrollView
                                    ref={hoursScrollRef}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={45}
                                    decelerationRate="fast"
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {hours.map((h) => {
                                        const isSelected = h === selectedHour;
                                        return (
                                            <Pressable
                                                key={h}
                                                onPress={() => setSelectedHour(h)}
                                                style={[
                                                    styles.itemPressable,
                                                    isSelected && styles.itemSelected,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.itemText,
                                                        isSelected && styles.itemTextSelected,
                                                    ]}
                                                >
                                                    {h}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Minutes Column */}
                        <View style={styles.columnWrapper}>
                            <Text style={styles.columnLabel}>Minute</Text>
                            <View style={styles.scrollContainer}>
                                <ScrollView
                                    ref={minutesScrollRef}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={45}
                                    decelerationRate="fast"
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {minutes.map((m) => {
                                        const isSelected = m === selectedMinute;
                                        return (
                                            <Pressable
                                                key={m}
                                                onPress={() => setSelectedMinute(m)}
                                                style={[
                                                    styles.itemPressable,
                                                    isSelected && styles.itemSelected,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.itemText,
                                                        isSelected && styles.itemTextSelected,
                                                    ]}
                                                >
                                                    {m}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </View>

                    {/* CTAs */}
                    <View style={styles.ctaContainer}>
                        <Pressable
                            onPress={handleConfirm}
                            style={styles.confirmButton}
                        >
                            <Text style={styles.confirmButtonText}>Confirm Time</Text>
                        </Pressable>

                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -8 },
        elevation: 10,
    },
    dragHandle: {
        width: 48,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 99,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
        marginTop: 2,
    },
    previewContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    previewText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#10B981',
        letterSpacing: 2,
    },
    previewSeparator: {
        color: '#D1D5DB',
        fontWeight: '400',
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 180,
        marginBottom: 28,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    columnWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    columnLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    scrollContainer: {
        height: 135,
        width: '100%',
        overflow: 'hidden',
    },
    scrollContent: {
        paddingVertical: 45, // Gives padding to allow scrolling top/bottom items into view easily
    },
    divider: {
        width: 1,
        height: 120,
        backgroundColor: '#E5E7EB',
    },
    itemPressable: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        marginHorizontal: 8,
    },
    itemSelected: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    itemText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4B5563',
    },
    itemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    ctaContainer: {
        gap: 12,
    },
    confirmButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
});
