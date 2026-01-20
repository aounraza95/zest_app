import { addDays, getISOWeek, startOfWeek } from 'date-fns';

// We assume a simple 1-4 cycle based on the ISO week number.
// Week 1, Week 2, Week 3, Week 4, then back to Week 1.
// This ensures synchronization with the real calendar.
export const getCurrentWeekIndex = (): number => {
    const currentWeekNumber = getISOWeek(new Date());
    // ISO week 1 -> Index 0
    // ISO week 2 -> Index 1
    // ...
    // ISO week 5 -> Index 0 (cycled)
    return (currentWeekNumber - 1) % 4;
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
