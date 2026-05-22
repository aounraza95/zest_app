import { MealDefinition } from '@/types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Lazy loading helper to avoid fatal crashes in Expo Go (Android SDK 53+).
 * This prevents the expo-notifications module from being imported at startup.
 */
const getNotificationsModule = () => {
    const isExpoGo = Constants.appOwnership === 'expo';
    const isAndroid = Platform.OS === 'android';

    // Guard: expo-notifications (remote/native init) crashes Expo Go on Android SDK 53+
    if (isExpoGo && isAndroid) {
        return null;
    }

    try {
        // Use require for synchronous lazy loading within the utility
        return require('expo-notifications');
    } catch (error) {
        console.warn("Could not load expo-notifications:", error);
        return null;
    }
};

/**
 * Specifically handles local notification permissions.
 */
export async function requestNotificationPermissionsAsync() {
    const Notifications = getNotificationsModule();

    if (!Notifications) {
        if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
            console.warn("Notifications are restricted in Expo Go (Android). Use a Development Build.");
        }
        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    } catch (error) {
        console.warn("Notification permissions error:", error);
        return false;
    }
}

export async function scheduleAllReminders(
    mealDefinitions: MealDefinition[],
    groceryReminderEnabled: boolean,
    groceryDay: number = 7, // Default Saturday (7 in Expo/JS)
    groceryTime: string = "13:00"
) {
    const Notifications = getNotificationsModule();
    if (!Notifications) return;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();

        // 1. Grocery Reminder
        if (groceryReminderEnabled) {
            const [gHourStr, gMinStr] = groceryTime.split(':');
            const gHour = parseInt(gHourStr, 10);
            const gMinute = parseInt(gMinStr, 10);

            if (!isNaN(gHour) && !isNaN(gMinute)) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Grocery Shopping Time! 🛒",
                        body: "Don't forget to check your plan for the upcoming week.",
                    },
                    trigger: {
                        type: 'calendar',
                        weekday: groceryDay,
                        hour: gHour,
                        minute: gMinute,
                        repeats: true,
                    } as any,
                });
            }
        }

        // 2. Meal Reminders
        for (const def of mealDefinitions) {
            if (def.notify && def.defaultTime) {
                const [hourStr, minStr] = def.defaultTime.split(':');
                const hour = parseInt(hourStr, 10);
                const minute = parseInt(minStr, 10);

                if (!isNaN(hour) && !isNaN(minute)) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `Time for ${def.name}! 🍽️`,
                            body: `Check your meal plan.`,
                        },
                        trigger: {
                            type: 'calendar',
                            hour,
                            minute,
                            repeats: true,
                        } as any,
                    });
                }
            }
        }
    } catch (error) {
        console.warn("Failed to schedule notifications:", error);
    }
}
