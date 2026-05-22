import { addDays, startOfWeek } from 'date-fns';

// We use a monthly 4-week cycle based on the day of the month.
// This ensures the app is intuitive (e.g., May 12 is in the 2nd week block).
// Days 1-7   -> Week 1 (Index 0)
// Days 8-14  -> Week 2 (Index 1)
// Days 15-21 -> Week 3 (Index 2)
// Days 22-28 -> Week 4 (Index 3)
// Days 29+   -> Cycle back to Week 1 (Index 0)
export const getCurrentWeekIndex = (): number => {
    const dayOfMonth = new Date().getDate();
    // (1-1)/7 = 0
    // (8-1)/7 = 1
    // (29-1)/7 = 4 -> 4 % 4 = 0
    return Math.floor((dayOfMonth - 1) / 7) % 4;
};

export const getWeekLabel = (index: number): string => {
    return `Week ${index + 1}`;
};

export const getDayIndexStart = (date: Date = new Date()): number => {
    // 0 = Monday, 6 = Sunday for our app logic (European standard usually for meal planning)
    // date-fns getDay returns 0 for Sunday, 1 for Monday.
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
};

export const getStartOfCurrentWeek = (): Date => {
    return startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
};

export const getDaysForWeek = (weekStartDate: Date): Date[] => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));
};
