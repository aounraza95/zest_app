import { useAppStore } from '@/store/useAppStore';
import { useActiveWeek } from '@/hooks/useActiveWeek';
import { CookItem, CookingSession } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SESSION_CFG: Record<string, { accent: string; bg: string; text: string }> = {
    primary: { accent: '#10B981', bg: '#ECFDF5', text: '#065F46' },
    topup:   { accent: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
};
const DEFAULT_CFG = { accent: '#6366F1', bg: '#EEF2FF', text: '#3730A3' };
const cfg = (type: string) => SESSION_CFG[type] ?? DEFAULT_CFG;

// ─── Cook item row — compact with expandable detail ───────────────────────────
function CookItemRow({
    item,
    onToggle,
    isLast,
}: {
    item: CookItem;
    onToggle: () => void;
    isLast: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <View
            style={{ opacity: item.isCompleted ? 0.5 : 1 }}
            className={isLast ? '' : 'border-b border-gray-100'}
        >
            <View className="flex-row items-center py-3 gap-3">
                <Pressable
                    onPress={onToggle}
                    hitSlop={8}
                    className={`w-5 h-5 rounded-md border-2 items-center justify-center flex-shrink-0 ${
                        item.isCompleted
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 bg-white'
                    }`}
                >
                    {item.isCompleted && <FontAwesome name="check" size={9} color="white" />}
                </Pressable>

                <Pressable onPress={() => setOpen(o => !o)} className="flex-1">
                    <Text className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                        {item.category}
                    </Text>
                    <View className="flex-row items-center justify-between gap-2">
                        <Text
                            className={`text-sm font-bold flex-1 leading-snug ${
                                item.isCompleted ? 'text-gray-300 line-through' : 'text-gray-900'
                            }`}
                            numberOfLines={open ? undefined : 1}
                        >
                            {item.name}
                        </Text>
                        <View className="flex-row items-center gap-1.5 flex-shrink-0">
                            <Text className="text-[10px] text-gray-400">{item.quantity}</Text>
                            <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                                <Text className="text-[8px] font-black text-gray-500 uppercase">
                                    {item.cookMethod}
                                </Text>
                            </View>
                            <FontAwesome
                                name={open ? 'chevron-up' : 'chevron-down'}
                                size={8}
                                color="#9CA3AF"
                            />
                        </View>
                    </View>
                </Pressable>
            </View>

            {open && (
                <View className="ml-8 pb-3">
                    <View className="bg-gray-50 rounded-xl px-3 py-2.5 mb-2">
                        <Text className="text-xs text-gray-500 leading-relaxed">{item.instructions}</Text>
                    </View>

                    {(!!item.portionInto || !!item.storageType) && (
                        <View className="flex-row flex-wrap gap-1.5 mb-1.5">
                            {!!item.portionInto && (
                                <View className="flex-row items-center bg-indigo-50 px-2 py-1 rounded-lg gap-1">
                                    <FontAwesome name="th-large" size={8} color="#4F46E5" />
                                    <Text className="text-[9px] font-bold text-indigo-700">
                                        {item.portionInto} portions · {item.portionSize}
                                    </Text>
                                </View>
                            )}
                            {!!item.storageType && (
                                <View className="flex-row items-center bg-sky-50 px-2 py-1 rounded-lg gap-1">
                                    <FontAwesome name="archive" size={8} color="#0284C7" />
                                    <Text className="text-[9px] font-bold text-sky-700">
                                        {item.storageType} · {item.storageDays}d
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {!!item.storageNote && (
                        <Text className="text-[10px] text-gray-400 italic mb-1.5 leading-relaxed">
                            {item.storageNote}
                        </Text>
                    )}

                    {(item.usage ?? []).length > 0 && (
                        <View className="flex-row flex-wrap gap-1">
                            {(item.usage ?? []).map((u, i) => (
                                <View key={i} className="bg-gray-100 px-2 py-0.5 rounded-full">
                                    <Text className="text-[8px] text-gray-500 font-bold">
                                        {u.day.substring(0, 3)} · {u.mealSlot}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

// ─── Session card — collapsible with left accent bar ──────────────────────────
function SessionCard({
    session,
    onToggleSession,
    onToggleItem,
    initiallyExpanded,
}: {
    session: CookingSession;
    onToggleSession: () => void;
    onToggleItem: (itemId: string) => void;
    initiallyExpanded: boolean;
}) {
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const accent = cfg(session.sessionType);
    const doneItems = session.cookItems.filter(i => i.isCompleted).length;
    const totalItems = session.cookItems.length;
    const itemPct = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

    return (
        <View
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3 flex-row"
            style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            {/* Left accent bar — 4px vertical strip per branding guide */}
            <View style={{ width: 4, backgroundColor: accent.accent }} />

            {/* Card content */}
            <View className="flex-1">
                {/* Header — tap to expand/collapse */}
                <Pressable onPress={() => setExpanded(e => !e)} className="px-4 pt-3.5 pb-3">
                    {/* Top row: session type badge + items counter + chevron */}
                    <View className="flex-row items-center justify-between mb-2">
                        <View
                            style={{
                                backgroundColor: accent.bg,
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                                borderRadius: 6,
                            }}
                        >
                            <Text
                                style={{ color: accent.text }}
                                className="text-[9px] font-black uppercase tracking-wider"
                            >
                                {session.sessionType}
                            </Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            {/* Items badge — tap to mark session done/undone */}
                            <Pressable
                                onPress={e => {
                                    e.stopPropagation?.();
                                    onToggleSession();
                                }}
                                className={`flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl ${
                                    session.isCompleted ? 'bg-emerald-500' : 'bg-gray-100'
                                }`}
                            >
                                {session.isCompleted && (
                                    <FontAwesome name="check" size={9} color="white" />
                                )}
                                <Text
                                    className={`text-xs font-black ${
                                        session.isCompleted ? 'text-white' : 'text-gray-700'
                                    }`}
                                >
                                    {doneItems}/{totalItems}
                                </Text>
                                <Text
                                    className={`text-[9px] font-bold ${
                                        session.isCompleted ? 'text-emerald-100' : 'text-gray-400'
                                    }`}
                                >
                                    items
                                </Text>
                            </Pressable>

                            <FontAwesome
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={10}
                                color="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Session label */}
                    <Text
                        className={`text-base font-black tracking-tight mb-1 ${
                            session.isCompleted ? 'text-gray-300 line-through' : 'text-gray-900'
                        }`}
                    >
                        {session.label}
                    </Text>

                    {/* Time + duration */}
                    <View className="flex-row items-center gap-1.5 mb-2.5">
                        <FontAwesome name="clock-o" size={10} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs">
                            {session.bestTime}
                            {session.estimatedDuration ? ` · ${session.estimatedDuration}` : ''}
                        </Text>
                    </View>

                    {/* Item progress bar */}
                    {totalItems > 0 && (
                        <View className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{ width: `${itemPct}%`, backgroundColor: accent.accent }}
                            />
                        </View>
                    )}
                </Pressable>

                {/* Expanded body */}
                {expanded && (
                    <View className="border-t border-gray-50 px-4 pb-4 pt-3">
                        {/* Equipment chips */}
                        {(session.equipmentNeeded ?? []).length > 0 && (
                            <View className="flex-row flex-wrap gap-1.5 mb-3">
                                {session.equipmentNeeded.map((eq, i) => (
                                    <View
                                        key={i}
                                        className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg gap-1"
                                    >
                                        <FontAwesome name="wrench" size={8} color="#9CA3AF" />
                                        <Text className="text-[9px] font-semibold text-gray-500">{eq}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Kitchen note */}
                        {!!session.kitchenNote && (
                            <View className="flex-row bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3 gap-2">
                                <FontAwesome
                                    name="lightbulb-o"
                                    size={12}
                                    color="#D97706"
                                    style={{ marginTop: 1 }}
                                />
                                <Text className="text-amber-800 text-xs leading-relaxed flex-1 font-medium">
                                    {session.kitchenNote}
                                </Text>
                            </View>
                        )}

                        {/* Prep-ahead steps */}
                        {(session.prepAhead ?? []).length > 0 && (
                            <View className="mb-3">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Before you start
                                </Text>
                                {session.prepAhead.map((step, i) => (
                                    <View key={i} className="flex-row items-start gap-2 mb-1.5">
                                        <View className="w-4 h-4 rounded bg-gray-100 items-center justify-center mt-0.5 flex-shrink-0">
                                            <Text className="text-[8px] font-black text-gray-500">{i + 1}</Text>
                                        </View>
                                        <Text className="text-xs text-gray-500 flex-1 leading-relaxed">{step}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Cook items */}
                        {session.cookItems.length > 0 && (
                            <View>
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                    Items to cook
                                </Text>
                                {session.cookItems.map((item, i) => (
                                    <CookItemRow
                                        key={item.id}
                                        item={item}
                                        onToggle={() => onToggleItem(item.id)}
                                        isLast={i === session.cookItems.length - 1}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CookScreen() {
    const { weeks, toggleCookingSession, toggleCookItem } = useAppStore();
    const activeWeek = useActiveWeek();
    const [selectedWeekId, setSelectedWeekId] = useState<string>(activeWeek.id);

    // 0 = Monday … 6 = Sunday (same convention as DayPlan.dayIndex)
    const todayDayIdx = useMemo(() => (new Date().getDay() + 6) % 7, []);

    const selectedWeek = weeks.find(w => w.id === selectedWeekId) ?? activeWeek;
    const isCurrentWeek = selectedWeek.id === activeWeek.id;

    // Group sessions by day, preserving Mon→Sun order
    const dayGroups = useMemo(() => {
        const sessions = selectedWeek.cookingPlan ?? [];
        return DAY_NAMES.reduce<Array<{ dayIndex: number; day: string; sessions: CookingSession[] }>>(
            (acc, day, idx) => {
                const daySessions = sessions
                    .filter(s => s.dayIndex === idx)
                    .sort((a, b) => a.label.localeCompare(b.label));
                if (daySessions.length > 0) acc.push({ dayIndex: idx, day, sessions: daySessions });
                return acc;
            },
            [],
        );
    }, [selectedWeek.cookingPlan]);

    const allSessions = useMemo(() => dayGroups.flatMap(g => g.sessions), [dayGroups]);
    const completedSessions = allSessions.filter(s => s.isCompleted).length;
    const totalSessions = allSessions.length;
    const sessionPct = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const totalItems = allSessions.reduce((sum, s) => sum + s.cookItems.length, 0);
    const doneItems = allSessions.reduce(
        (sum, s) => sum + s.cookItems.filter(i => i.isCompleted).length,
        0,
    );
    const itemPct = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

    return (
        <View className="flex-1 bg-gray-50">

            {/* ══ Header — Type C dark ══════════════════════════════════════════ */}
            <View className="bg-gray-900 pt-16 px-6 pb-5">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white text-3xl font-black tracking-tight">Batch Cook</Text>
                    {isCurrentWeek && (
                        <View className="bg-emerald-500 px-2.5 py-1 rounded-full">
                            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                                Current
                            </Text>
                        </View>
                    )}
                </View>

                <Text className="text-gray-500 text-sm font-medium mb-5" numberOfLines={1}>
                    {selectedWeek.label}
                    {selectedWeek.theme ? `  ·  ${selectedWeek.theme}` : ''}
                </Text>

                {/* Week progress cards */}
                {totalSessions > 0 && (
                    <View className="flex-row gap-3 mb-5">
                        <View className="flex-1 bg-gray-800 rounded-2xl px-4 py-3">
                            <Text className="text-white text-xl font-black leading-none">
                                {completedSessions}
                                <Text className="text-gray-500 text-sm font-bold">/{totalSessions}</Text>
                            </Text>
                            <Text className="text-gray-500 text-[9px] font-bold uppercase tracking-wider mt-1">
                                Sessions
                            </Text>
                            <View className="h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
                                <View
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${sessionPct}%` }}
                                />
                            </View>
                        </View>

                        <View className="flex-1 bg-gray-800 rounded-2xl px-4 py-3">
                            <Text className="text-white text-xl font-black leading-none">
                                {doneItems}
                                <Text className="text-gray-500 text-sm font-bold">/{totalItems}</Text>
                            </Text>
                            <Text className="text-gray-500 text-[9px] font-bold uppercase tracking-wider mt-1">
                                Items prepped
                            </Text>
                            <View className="h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
                                <View
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${itemPct}%` }}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Week tabs */}
                <View className="flex-row gap-2">
                    {weeks.map(week => {
                        const isSelected = week.id === selectedWeekId;
                        const isCurrent = week.id === activeWeek.id;
                        return (
                            <Pressable
                                key={week.id}
                                onPress={() => setSelectedWeekId(week.id)}
                                className={`flex-1 items-center py-2.5 rounded-xl border ${
                                    isSelected
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-gray-800 border-gray-700'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-black ${
                                        isSelected ? 'text-white' : 'text-gray-400'
                                    }`}
                                >
                                    Wk {week.label.split(' ')[1]}
                                </Text>
                                {isCurrent && !isSelected && (
                                    <View className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* ══ Day-grouped session list ══════════════════════════════════════ */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {dayGroups.length > 0 ? (
                    dayGroups.map((group, groupIdx) => {
                        const isToday = isCurrentWeek && group.dayIndex === todayDayIdx;
                        return (
                            <View key={group.dayIndex} className={groupIdx > 0 ? 'mt-2' : ''}>
                                {/* Day header */}
                                <View className="flex-row items-center gap-2 mb-2.5">
                                    <View
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            isToday ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                    />
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {group.day}
                                    </Text>
                                    {isToday && (
                                        <View className="bg-emerald-500 px-2 py-0.5 rounded-full">
                                            <Text className="text-white text-[8px] font-black uppercase tracking-wider">
                                                Today
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Sessions for this day */}
                                {group.sessions.map(session => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        initiallyExpanded={isToday && !session.isCompleted}
                                        onToggleSession={() =>
                                            toggleCookingSession(selectedWeek.id, session.id)
                                        }
                                        onToggleItem={itemId =>
                                            toggleCookItem(selectedWeek.id, session.id, itemId)
                                        }
                                    />
                                ))}
                            </View>
                        );
                    })
                ) : (
                    <View className="items-center justify-center mt-24 opacity-50">
                        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-5">
                            <FontAwesome name="fire" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg mb-2">No cook plan yet</Text>
                        <Text className="text-gray-400 text-sm text-center px-10 leading-relaxed">
                            Import a meal plan with a cooking schedule to see your batch sessions here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
