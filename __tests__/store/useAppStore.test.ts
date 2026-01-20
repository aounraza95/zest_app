import { useAppStore } from '@/store/useAppStore';

// Mock AsyncStorage because we are in a test environment
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock get-random-values if needed (sometimes needed for uuid)

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('useAppStore', () => {
    beforeEach(() => {
        useAppStore.getState().resetData();
    });

    it('initializes with 4 weeks', () => {
        const weeks = useAppStore.getState().weeks;
        expect(weeks).toHaveLength(4);
        expect(weeks[0].id).toBe('week-0');
    });

    it('updates a meal', () => {
        const weekId = 'week-0';
        // Find the first day and meal ID from the initial state
        const firstDay = useAppStore.getState().weeks[0].days[0];
        const firstMeal = firstDay.meals[0];

        useAppStore.getState().updateMeal(weekId, firstDay.id, firstMeal.id, { name: 'Pancakes' });

        const updatedWeeks = useAppStore.getState().weeks;
        const updatedMeal = updatedWeeks[0].days[0].meals[0];
        expect(updatedMeal.name).toBe('Pancakes');
    });

    it('adds a grocery item', () => {
        const weekId = 'week-1';
        useAppStore.getState().addGroceryItem(weekId, { name: 'Apples', quantity: '5' });

        const updatedWeeks = useAppStore.getState().weeks;
        const groceryList = updatedWeeks[1].groceryList;
        expect(groceryList).toHaveLength(1);
        expect(groceryList[0].name).toBe('Apples');
        expect(groceryList[0].quantity).toBe('5');
    });
});
