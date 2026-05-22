import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

interface ZestIconProps {
    size?: number;
    style?: StyleProp<ViewStyle>;
    showShadow?: boolean;
}

/**
 * Zest app icon — bold Z monogram on emerald with a leaf accent.
 * Use this component everywhere the app icon appears in-app.
 * For the actual PNG asset files (app icon, splash) use assets/images/zest-icon.svg as the source.
 */
export function ZestIcon({ size = 60, style, showShadow = false }: ZestIconProps) {
    const radius         = Math.round(size * 0.24);
    const innerSize      = Math.round(size * 0.78);
    const innerRadius    = Math.round(size * 0.18);
    const fontSize       = Math.round(size * 0.48);
    const leafCircle     = Math.round(size * 0.30);
    const leafIconSize   = Math.round(size * 0.155);

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    backgroundColor: '#10B981',
                    borderRadius: radius,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(showShadow
                        ? {
                            shadowColor: '#10B981',
                            shadowOpacity: 0.42,
                            shadowRadius: size * 0.2,
                            shadowOffset: { width: 0, height: size * 0.08 },
                            elevation: 8,
                        }
                        : {}),
                },
                style,
            ]}
        >
            {/* Frosted inner square */}
            <View
                style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerRadius,
                    backgroundColor: 'rgba(255,255,255,0.13)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize,
                        fontWeight: '900',
                        lineHeight: fontSize * 1.12,
                        letterSpacing: -(fontSize * 0.04),
                        includeFontPadding: false,
                    }}
                >
                    Z
                </Text>
            </View>

            {/* Leaf accent — top-right corner */}
            <View
                style={{
                    position: 'absolute',
                    top: size * 0.04,
                    right: size * 0.04,
                    width: leafCircle,
                    height: leafCircle,
                    borderRadius: leafCircle / 2,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <FontAwesome name="leaf" size={leafIconSize} color="rgba(255,255,255,0.95)" />
            </View>
        </View>
    );
}
