import { Stack } from 'expo-router';

export default function PlanLayout() {
    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ title: 'Plan Overview' }} />
            <Stack.Screen name="[weekId]" options={{ title: 'Edit Week' }} />
        </Stack>
    );
}
