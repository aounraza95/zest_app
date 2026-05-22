import { useAppStore } from '@/store/useAppStore';
import { getCurrentWeekIndex } from '@/utils/dateHelpers';
import { WeekPlan } from '@/types';

/**
 * Returns the currently active WeekPlan based on the user's override
 * setting or the automatic day-of-month cycle (days 1-7 → Week 1, etc.).
 * Centralises the logic that was previously duplicated in every tab screen.
 */
export const useActiveWeek = (): WeekPlan => {
    const weeks = useAppStore(state => state.weeks);
    const activeWeekOverride = useAppStore(state => state.settings.activeWeekOverride);

    const activeWeekId = activeWeekOverride ?? `week-${getCurrentWeekIndex()}`;
    return weeks.find(w => w.id === activeWeekId) ?? weeks[0];
};
