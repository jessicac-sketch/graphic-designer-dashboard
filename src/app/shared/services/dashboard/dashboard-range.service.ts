/** Angular Imports */
import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';

/** Local Imports */
import type { DashboardRange, DashboardRangeOption } from '@shared/interfaces/dashboard';
import {
    DASHBOARD_ALL_TIME_OPTION,
    DASHBOARD_MAX_RANGE_DAYS,
    DASHBOARD_RANGE_PRESETS,
    type DashboardDatedPreset,
    type DashboardRangePreset,
} from '@shared/models/dashboard';
import { TimeDisplayService } from '@shared/services/time-display';
import {
    addUtcDays,
    formatCalendarDate,
    formatCalendarRange,
    pickedCalendarDate,
    toUtcCalendarDate,
} from '@shared/utils/utc-calendar-date.util';
import { addCalendarDays, zonedCalendarDate } from '@shared/utils/zoned-calendar-date.util';

/**
 * The date range of the Dashboard's totals (UTC days), shared app-wide: the Dashboard
 * page and the totals in the top bar read and change the same range, and it is kept
 * while moving between pages.
 *
 * @remarks
 * Starts at yesterday (always complete). Quick ranges come from DASHBOARD_RANGE_PRESETS;
 * a range picked in a date picker is clamped to DASHBOARD_MAX_RANGE_DAYS. Setting the
 * same range again is ignored, so nothing reloads for an accidental re-pick.
 */
@Injectable({ providedIn: 'root' })
export class DashboardRangeService {
    /**
     * Global "Eastern Time / UTC" display preference - changes what calendar
     * day "today"/"yesterday"/a quick range mean (see presetRange()).
     * @type {TimeDisplayService}
     */
    private readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * The selected range
     * @type {WritableSignal<DashboardRange>}
     */
    private readonly current = signal<DashboardRange>(this.presetRange('yesterday'));

    /**
     * The selected range (calendar dates in the active display timezone)
     * @type {Signal<DashboardRange>}
     */
    public readonly range = this.current.asReadonly();

    /**
     * Re-applies the active quick range when the display timezone toggles,
     * so "Yesterday" immediately becomes Eastern yesterday (or UTC yesterday
     * again) instead of silently keeping whatever days were selected under
     * the old zone. A custom picked range is left alone - the user picked
     * those exact days on purpose, in whichever zone they were in at the
     * time, so re-interpreting them isn't obviously "more correct" - only a
     * preset's dates are defined purely in terms of "today" in a zone.
     */
    private readonly reapplyPresetOnZoneChange = effect(() => {
        this.timeDisplayService.mode();
        untracked(() => {
            const preset = this.activePreset();
            if (preset !== 'custom' && preset !== 'allTime') {
                this.set(this.presetRange(preset));
            }
        });
    });

    /**
     * Whether "All time" is selected (pages that support it then load every record)
     * @type {WritableSignal<boolean>}
     */
    private readonly allTime = signal(false);

    /**
     * Whether "All time" is selected
     * @type {Signal<boolean>}
     */
    public readonly isAllTime = this.allTime.asReadonly();

    /**
     * The range for pages that support "All time" (Ranking Data, Map View, Venue
     * Profile): null when it's selected, otherwise the selected range. The Dashboard and
     * the top bar's totals always use `range` (never unbounded).
     * @type {Signal<DashboardRange | null>}
     */
    public readonly pageRange = computed((): DashboardRange | null =>
        this.allTime() ? null : this.current(),
    );

    /**
     * Shown when a picked range was shortened to DASHBOARD_MAX_RANGE_DAYS, or null
     * @type {WritableSignal<string | null>}
     */
    public readonly notice = signal<string | null>(null);

    /**
     * The quick range the selected range matches, or `custom` for a picked range
     * @type {Signal<DashboardRangePreset>}
     */
    public readonly activePreset = computed((): DashboardRangePreset => {
        if (this.allTime()) {
            return 'allTime';
        }
        const { start, end } = this.current();
        const match = DASHBOARD_RANGE_PRESETS.find((preset) => {
            const range = this.presetRange(preset.value);
            return range.start === start && range.end === end;
        });
        return match?.value ?? 'custom';
    });

    /**
     * Range menu entries: each quick range with its dates (worked out when the range
     * changes), "All time" (shown only by menus that allow it), and "Custom" for a
     * picked range
     * @type {Signal<DashboardRangeOption[]>}
     */
    public readonly options = computed((): DashboardRangeOption[] => {
        const range = this.current();
        const options: DashboardRangeOption[] = [DASHBOARD_ALL_TIME_OPTION];
        options.push(
            ...DASHBOARD_RANGE_PRESETS.map((preset) => ({
                value: preset.value,
                label: preset.label,
                dates: formatCalendarRange(this.presetRange(preset.value)),
            })),
        );
        if (this.activePreset() === 'custom') {
            options.push({ value: 'custom', label: 'Custom', dates: formatCalendarRange(range) });
        }
        return options;
    });

    /**
     * The selected entry, shown on the range menu's button
     * @type {Signal<DashboardRangeOption>}
     */
    public readonly activeOption = computed(
        (): DashboardRangeOption =>
            this.options().find((option) => option.value === this.activePreset()) ?? {
                value: 'custom',
                label: 'Custom',
                dates: formatCalendarRange(this.current()),
            },
    );

    /**
     * Switches to a quick range, worked out from today's date (UTC).
     *
     * @param preset - The quick range
     * @returns {void}
     */
    public applyPreset(preset: DashboardDatedPreset): void {
        this.notice.set(null);
        this.allTime.set(false);
        this.set(this.presetRange(preset));
    }

    /**
     * Selects "All time" (every record) - for pages that support it. The dated range is
     * kept underneath for the Dashboard and the top bar's totals.
     *
     * @returns {void}
     */
    public applyAllTime(): void {
        this.notice.set(null);
        this.allTime.set(true);
    }

    /**
     * Leaves "All time" for the dated range kept underneath (the Dashboard can't show
     * every record, so it calls this when it opens).
     *
     * @returns {void}
     */
    public leaveAllTime(): void {
        this.allTime.set(false);
    }

    /**
     * Applies a range picked in a date picker - clamped to today (in the active zone) if
     * it reaches into the future, then shortened to DASHBOARD_MAX_RANGE_DAYS (keeping the
     * most recent days) if it's still wider than that - with a notice saying so. If the
     * picked range is entirely in the future (its start is already past today), there's no
     * valid day to clamp down to - the current range is left untouched (no reload, no API
     * call) and only the warning is shown.
     *
     * @remarks
     * component-pantry's date pickers have no max-date/future-date input at all (checked
     * the library - `canSelectPrevDates` only ever governs the past), so a future pick
     * can't be blocked at the calendar level; this clamps it after the fact instead, same
     * as the existing width clamp below.
     *
     * @param dates - Picked range (local dates, read as calendar dates)
     * @returns {void}
     */
    public applyPicked(dates: { start: Date; end: Date }): void {
        const start = pickedCalendarDate(dates.start);
        let end = pickedCalendarDate(dates.end);

        const today = zonedCalendarDate(new Date(), this.timeDisplayService.zoneId());
        if (start > today) {
            // Entirely future - no valid day in the pick to fall back to, so there's
            // nothing to query. Leave the active range (and any in-flight data) as-is.
            this.notice.set(
                `Future dates aren't available yet - pick a day on or before today, ${formatCalendarDate(today)}.`,
            );
            return;
        }

        const notices: string[] = [];
        if (end > today) {
            end = today;
            notices.push(`Future dates aren't available yet - showing up to today, ${formatCalendarDate(today)}.`);
        }

        let clampedStart = start;
        const earliest = toUtcCalendarDate(
            addUtcDays(new Date(`${end}T00:00:00.000Z`), -(DASHBOARD_MAX_RANGE_DAYS - 1)),
        );
        if (clampedStart < earliest) {
            clampedStart = earliest;
            notices.push(
                `Ranges are limited to ${DASHBOARD_MAX_RANGE_DAYS} days - showing ${formatCalendarDate(clampedStart, false)} – ${formatCalendarDate(end)}.`,
            );
        }

        this.notice.set(notices.length > 0 ? notices.join(' ') : null);
        this.allTime.set(false);
        this.set({ start: clampedStart, end });
    }

    /**
     * Sets the range only if it differs from the current one - re-picking the same dates
     * must not start a reload, and a new signal object would.
     *
     * @param next - Range to apply
     * @returns {void}
     */
    private set(next: DashboardRange): void {
        const current = this.current();
        if (current.start !== next.start || current.end !== next.end) {
            this.current.set(next);
        }
    }

    /**
     * The dates a quick range covers right now, as calendar days in the
     * active display timezone (UTC, or Eastern Time - see
     * TimeDisplayService). "Today"/"yesterday" are worked out from the
     * current instant's calendar date IN THAT ZONE, so e.g. "Yesterday" in
     * Eastern Time mode means the previous Eastern calendar day, which can
     * differ from the previous UTC calendar day for several hours around
     * each day's boundary.
     *
     * @param preset - The quick range
     * @returns {DashboardRange} Its first and last day
     */
    private presetRange(preset: DashboardDatedPreset): DashboardRange {
        const zoneId = this.timeDisplayService.zoneId();
        const today = zonedCalendarDate(new Date(), zoneId);
        const yesterday = addCalendarDays(today, -1);

        // The `days` full days ending yesterday
        const lastDays = (days: number): DashboardRange => ({
            start: addCalendarDays(yesterday, -(days - 1)),
            end: yesterday,
        });

        const [year, month] = today.split('-');

        switch (preset) {
            case 'yesterday':
                return lastDays(1);
            case 'today':
                return { start: today, end: today };
            case 'last7':
                return lastDays(7);
            case 'last14':
                return lastDays(14);
            case 'last21':
                return lastDays(21);
            case 'thisMonth':
                return { start: `${year}-${month}-01`, end: today };
            case 'lastMonth': {
                // The day before the 1st of this month = the last day of the previous one
                const lastDayOfPrevMonth = addCalendarDays(`${year}-${month}-01`, -1);
                const [prevYear, prevMonth] = lastDayOfPrevMonth.split('-');
                return { start: `${prevYear}-${prevMonth}-01`, end: lastDayOfPrevMonth };
            }
        }
    }
}
