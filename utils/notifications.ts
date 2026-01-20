import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
    // In Expo Go SDK 53+, remote notifications are restricted.
    // For local notifications, we mainly just need to request permissions.

    // We intentionally skip channel creation/token fetching to avoid "Android Push" errors in Expo Go.
    // Ideally, for a production app, you would configure channels for Android.

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
        return true;
    } catch (error) {
        console.warn("Notification permissions error:", error);
        return false;
    }
}

import { MealDefinition } from '@/types';

// ... existing code ...

export async function scheduleAllReminders(mealDefinitions: MealDefinition[], groceryReminderEnabled: boolean) {
    // efficient way: cancel all and re-schedule.
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 1. Grocery Reminder (Fixed slot for MVP or passed in? AppSettings has it. Assuming default for now or passed args)
    if (groceryReminderEnabled) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Grocery Shopping Time! 🛒",
                body: "Don't forget to check your plan for the upcoming week.",
            },
            trigger: {
                weekday: 6, // Saturday? 
                hour: 9,
                minute: 0,
                repeats: true,
            } as any,
        });
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
                        hour,
                        minute,
                        repeats: true,
                    } as any,
                });
            }
        }
    }
}
