/** Angular Imports */
import {
    Component,
    DestroyRef,
    ElementRef,
    afterNextRender,
    effect,
    inject,
    input,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import * as echarts from 'echarts';

/** Local Imports */
import { CHART_COLORS, CHART_FONT } from '@shared/models/chart';
import { truncateMiddle } from '@shared/utils';

/**
 * Grouped bar chart: per-day total programmatic_ads rows vs. distinct venues
 * that received at least one that day.
 *
 * @remarks
 * Wraps the plain `echarts` package directly (not `ngx-echarts`), same
 * rationale and init pattern as UsStatesMapComponent - see that component's
 * docs for why (zoneless Angular, `ResizeObserver`-gated init to avoid
 * initializing against a still-0x0 container).
 */
@Component({
    selector: 'app-daily-ads-bar-chart',
    standalone: true,
    template: `<div
        #chartEl
        class="daily-ads-bar-chart"
        [class.daily-ads-bar-chart--loading]="loading()"></div>`,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }

            .daily-ads-bar-chart {
                width: 100%;
                height: 100%;
                // Fills the parent's height when it stretches this
                // component (e.g. Venue Profile matching the chart card's
                // height to the profile card next to it); falls back to a
                // sensible fixed height otherwise (e.g. Map View, whose
                // parent doesn't stretch this).
                min-height: 320px;
                transition: opacity 0.15s ease;

                &--loading {
                    opacity: 0.5;
                }
            }
        `,
    ],
})
export class DailyAdsBarChartComponent {
    private readonly destroyRef = inject(DestroyRef);

    private readonly chartEl = viewChild.required<ElementRef<HTMLDivElement>>('chartEl');

    /** One entry per day, ascending by date. */
    data = input.required<{ date: string; totalAds: number; uniqueVenues: number }[]>();

    /** Dims the chart while a new range is loading, without unmounting it. */
    loading = input(false);

    /**
     * Name of the main series and its axis (e.g. "Received" on the Dashboard) - defaults
     * to "Total Ads" (Map View, Venue Profile).
     */
    totalLabel = input('Total Ads');

    /**
     * Whether to show the "Unique Venues" bar/axis alongside "Total Ads" -
     * on. Turn off for a single-venue view (e.g. the Venue Profile page),
     * where that count is always 0 or 1 and isn't meaningful.
     */
    showUniqueVenues = input(true);

    /**
     * Per-device daily ad counts, one line per device, index-aligned with
     * `data` (same dates, same order). When given a non-empty array, this
     * replaces the plain "Total Ads" bar with one line per device instead -
     * the Venue Profile page's device breakdown. Leave unset/empty for the
     * default single "Total Ads" bar (Map View's own usage).
     */
    deviceSeries = input<{ deviceId: string; data: number[] }[] | null>(null);

    private chart: echarts.ECharts | null = null;
    private mapReady = false;
    private resizeObserver: ResizeObserver | null = null;

    constructor() {
        afterNextRender(() => {
            this.observeContainerSize();

            this.destroyRef.onDestroy(() => {
                this.resizeObserver?.disconnect();
                this.chart?.dispose();
            });
        });

        effect(() => {
            const rows = this.data();
            const isLoading = this.loading();
            const showUniqueVenues = this.showUniqueVenues();
            const deviceSeries = this.deviceSeries();

            if (this.chart && this.mapReady) {
                this.renderOption(rows, isLoading, showUniqueVenues, deviceSeries);
            }
        });
    }

    /**
     * Watches the chart container's size and initializes ECharts only once
     * it actually has non-zero dimensions - see UsStatesMapComponent's own
     * observeContainerSize() for the full rationale (layout timing).
     *
     * @returns void
     */
    private observeContainerSize(): void {
        const el = this.chartEl().nativeElement;

        this.resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width === 0 || height === 0) {
                return;
            }

            if (!this.chart) {
                this.chart = echarts.init(el);
                this.mapReady = true;
                this.renderOption(
                    this.data(),
                    this.loading(),
                    this.showUniqueVenues(),
                    this.deviceSeries(),
                );
            } else {
                this.chart.resize();
            }
        });
        this.resizeObserver.observe(el);
    }

    /**
     * Builds and applies the ECharts option for the current data/loading state.
     *
     * @param rows - Per-day totals to plot
     * @param isLoading - Whether to show the loading overlay
     * @param showUniqueVenues - Whether to include the "Unique Venues" series/axis
     * @param deviceSeries - Per-device daily counts, index-aligned with rows; replaces the "Total Ads" bar with one line per device when non-empty
     * @returns void
     */
    private renderOption(
        rows: { date: string; totalAds: number; uniqueVenues: number }[],
        isLoading: boolean,
        showUniqueVenues: boolean,
        deviceSeries: { deviceId: string; data: number[] }[] | null,
    ): void {
        if (!this.chart) {
            return;
        }

        const hasDeviceBreakdown = !!deviceSeries?.length;

        const series: echarts.SeriesOption[] = hasDeviceBreakdown
            ? [
                  // A bold "Total" line alongside the per-device ones - the
                  // sum of every device's line, so the overall trend reads
                  // at a glance without having to mentally add up each
                  // device's own line.
                  {
                      name: 'Total',
                      type: 'line',
                      yAxisIndex: 0,
                      data: rows.map((row) => row.totalAds),
                      // Brand orange is reserved for the Total line, so it's
                      // never confused with a device (CHART_COLORS.series).
                      itemStyle: { color: CHART_COLORS.brand },
                      lineStyle: { width: 3 },
                      symbol: 'rect',
                      symbolSize: 6,
                      z: 10,
                  },
                  ...deviceSeries.map((device, index) => ({
                      name: device.deviceId,
                      type: 'line' as const,
                      yAxisIndex: 0,
                      data: device.data,
                      itemStyle: {
                          color: CHART_COLORS.series[index % CHART_COLORS.series.length],
                      },
                      lineStyle: { width: 1.5, type: 'dashed' as const },
                      symbol: 'rect',
                      symbolSize: 4,
                  })),
              ]
            : [
                  {
                      name: this.totalLabel(),
                      type: 'bar',
                      yAxisIndex: 0,
                      data: rows.map((row) => row.totalAds),
                      itemStyle: { color: CHART_COLORS.brand },
                  },
              ];
        // Two Y-axes when both series show, not one shared scale: total ad
        // counts run in the thousands while unique venue counts are
        // typically double digits, so a shared axis made the venue bars
        // visually disappear next to the ad-count bars.
        const yAxis: echarts.YAXisComponentOption[] = [
            this.valueAxis(hasDeviceBreakdown ? 'Ads' : this.totalLabel()),
        ];

        if (showUniqueVenues && !hasDeviceBreakdown) {
            series.push({
                name: 'Unique Venues',
                type: 'bar',
                yAxisIndex: 1,
                data: rows.map((row) => row.uniqueVenues),
                itemStyle: { color: CHART_COLORS.series[0] },
            });
            yAxis.push(this.valueAxis('Unique Venues'));
        }

        this.chart.setOption({
            textStyle: { fontFamily: CHART_FONT, color: CHART_COLORS.secondary },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: { color: CHART_COLORS.hover },
                },
                backgroundColor: CHART_COLORS.surfaceRaised,
                borderColor: CHART_COLORS.border,
                textStyle: { color: CHART_COLORS.primary, fontFamily: CHART_FONT },
            },
            legend: {
                data: series.map((s) => s.name as string),
                bottom: 0,
                textStyle: { color: CHART_COLORS.secondary },
                inactiveColor: CHART_COLORS.border,
                icon: 'rect',
                // Device IDs are full UUIDs - showing them in full would
                // blow out the legend's width with just a handful of
                // devices. Truncated to first/last 5 chars for display
                // only; tooltips still key off the untruncated series name.
                formatter: (name: string) => truncateMiddle(name),
            },
            grid: { left: 56, right: 56, top: 24, bottom: 48 },
            xAxis: {
                type: 'category',
                data: rows.map((row) => row.date),
                // A month of daily labels crammed into this width either
                // overlapped (shown every day) or still felt busy at every
                // 5th, and needed rotation to fit at all - so the daily
                // view only anchors start/middle/end. Calendar-date labels
                // ("2026-09-03") are much wider than hour labels ("00:00"),
                // so a short daily range (e.g. under 24 days) still needs
                // the sparse start/middle/end treatment - only the hourly
                // view's actual "HH:00" labels are short enough to space
                // out more densely (~8 evenly-picked hours).
                axisLine: { lineStyle: { color: CHART_COLORS.border } },
                axisTick: { lineStyle: { color: CHART_COLORS.border } },
                axisLabel: {
                    color: CHART_COLORS.secondary,
                    rotate: 0,
                    interval: (index: number) => {
                        const isHourly = /^\d{2}:00$/.test(rows[0]?.date ?? '');
                        if (isHourly) {
                            const step = Math.max(1, Math.round(rows.length / 8));
                            return index % step === 0 || index === rows.length - 1;
                        }
                        return (
                            index === 0 ||
                            index === rows.length - 1 ||
                            index === Math.floor((rows.length - 1) / 2)
                        );
                    },
                },
            },
            yAxis,
            series,
        });

        if (isLoading) {
            this.chart.showLoading(this.loadingTheme());
        } else {
            this.chart.hideLoading();
        }
    }

    /**
     * Builds a value (Y) axis with the dark-theme name, label and grid-line colors.
     *
     * @param name - Axis title
     * @returns {echarts.YAXisComponentOption} The axis option
     */
    private valueAxis(name: string): echarts.YAXisComponentOption {
        return {
            type: 'value',
            name,
            nameTextStyle: { color: CHART_COLORS.muted },
            axisLabel: { color: CHART_COLORS.secondary },
            splitLine: { lineStyle: { color: CHART_COLORS.border } },
        };
    }

    /**
     * Dark loading overlay for `showLoading()` (the default is a white mask).
     *
     * @returns {object} ECharts loading options
     */
    private loadingTheme(): object {
        return {
            text: '',
            color: CHART_COLORS.brand,
            maskColor: CHART_COLORS.mask,
        };
    }
}
