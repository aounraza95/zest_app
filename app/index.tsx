import { ZestIcon } from '@/components/ZestIcon';
import { useAppStore } from '@/store/useAppStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEATURES = [
    {
        icon: 'calendar' as const,
        color: '#10B981',
        bg: 'rgba(255,255,255,0.18)',
        title: '4-Week Meal Cycles',
        desc: 'A full month of daily meals, structured and ready.',
    },
    {
        icon: 'shopping-basket' as const,
        color: '#A7F3D0',
        bg: 'rgba(255,255,255,0.12)',
        title: 'Auto-Generated Groceries',
        desc: 'Your shopping list, built straight from the plan.',
    },
    {
        icon: 'fire' as const,
        color: '#FDE68A',
        bg: 'rgba(255,255,255,0.12)',
        title: 'Batch Cook Scheduling',
        desc: 'Know exactly what to prep and when.',
    },
] as const;

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { weeks, importData } = useAppStore();
    const hasData = weeks.length > 0;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(32)).current;
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        if (hasData) {
            const timer = setTimeout(() => router.replace('/(tabs)'), 1600);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            setImporting(true);
            const fileUri = result.assets[0].uri;
            const response = await fetch(fileUri);
            const parsedData = await response.json();
            if (!parsedData.weeks && !parsedData.settings) {
                Alert.alert('Invalid File', "JSON must contain a 'weeks' or 'settings' key.");
                return;
            }
            await importData(parsedData);
            router.replace('/(tabs)');
        } catch (err: any) {
            Alert.alert('Import Failed', err?.message || 'Something went wrong while reading the file.');
        } finally {
            setImporting(false);
        }
    };

    const handleSkip = () => router.replace('/(tabs)');

    /* ── Returning user: brief emerald splash ── */
    if (hasData) {
        return (
            <View className="flex-1 bg-emerald-500 items-center justify-center">
                <StatusBar barStyle="light-content" />
                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <ZestIcon size={96} showShadow />
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 32,
                            fontWeight: '900',
                            letterSpacing: -1,
                            marginTop: 20,
                        }}
                    >
                        Zest
                    </Text>
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 13,
                            fontWeight: '600',
                            marginTop: 6,
                            letterSpacing: 0.4,
                        }}
                    >
                        Loading your plan…
                    </Text>
                    <ActivityIndicator color="rgba(255,255,255,0.6)" style={{ marginTop: 32 }} />
                </Animated.View>
            </View>
        );
    }

    /* ── New user: full onboarding ── */
    return (
        <View className="flex-1 bg-emerald-500">
            <StatusBar barStyle="light-content" />

            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    paddingTop: insets.top + 32,
                    paddingBottom: insets.bottom + 24,
                    paddingHorizontal: 28,
                }}
            >
                {/* Icon + wordmark */}
                <View style={{ alignItems: 'center', marginBottom: 36 }}>
                    <ZestIcon size={110} showShadow />
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 44,
                            fontWeight: '900',
                            letterSpacing: -2,
                            marginTop: 20,
                            lineHeight: 46,
                        }}
                    >
                        Zest
                    </Text>
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.75)',
                            fontSize: 15,
                            fontWeight: '500',
                            marginTop: 8,
                            textAlign: 'center',
                            letterSpacing: 0.2,
                        }}
                    >
                        Your personal meal planning command centre.
                    </Text>
                </View>

                {/* Feature bullets */}
                <View
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: 28,
                        padding: 24,
                        gap: 20,
                        marginBottom: 36,
                    }}
                >
                    {FEATURES.map((f, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 14,
                                    backgroundColor: f.bg,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <FontAwesome name={f.icon} size={18} color={f.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14, lineHeight: 18 }}>
                                    {f.title}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, lineHeight: 16 }}>
                                    {f.desc}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* CTA buttons */}
                <View style={{ gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleImport}
                        disabled={importing}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 20,
                            paddingVertical: 17,
                            alignItems: 'center',
                            shadowColor: 'rgba(0,0,0,0.25)',
                            shadowOpacity: 1,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 6 },
                            elevation: 6,
                        }}
                    >
                        {importing ? (
                            <ActivityIndicator color="#10B981" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <FontAwesome name="cloud-upload" size={16} color="#10B981" />
                                <Text style={{ color: '#10B981', fontWeight: '900', fontSize: 16 }}>
                                    Import My Meal Plan
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        activeOpacity={0.7}
                        style={{ paddingVertical: 14, alignItems: 'center' }}
                    >
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontWeight: '600', fontSize: 14 }}>
                            Explore the app first
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}
