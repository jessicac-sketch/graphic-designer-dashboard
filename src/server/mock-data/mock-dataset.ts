/** Local Imports */
import type { MediaFile, ProgrammaticAd } from '../types/database.types.js';
import type { BusinessHoursDay, Host } from '../types/hosts.types.js';
import {
    MOCK_CREATIVE_NAMES,
    MOCK_CREATIVE_SOURCES,
    MOCK_VENUE_SEEDS,
} from './mock-venue-seeds.constant.js';
import { SeededRandom } from './seeded-random.util.js';

/**
 * The whole dummy dataset the BFF serves in place of a real database and venue API.
 */
export interface MockDataset {
    /** Venues (what a venue directory API would return) */
    hosts: Host[];

    /** Creatives (the programmatic_media_files table) */
    mediaFiles: MediaFile[];

    /** Play records, newest first (the programmatic_ads table) */
    ads: ProgrammaticAd[];
}

/** How many days of play records to generate, ending now. */
const HISTORY_DAYS = 45;

/** Average play records per venue per open day (scaled by each venue's popularity). */
const PLAYS_PER_VENUE_DAY = 24;

/** Fixed seed, so the data is the same on every start. Change it for a different dataset. */
const SEED = 20260101;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Formats minutes after midnight as "h:mm AM" - the venue time label format.
 *
 * @param minutes - Minutes after midnight
 * @returns The label, e.g. "8:00 AM"
 */
function toTimeLabel(minutes: number): string {
    const hour24 = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${String(minute).padStart(2, '0')} ${hour24 < 12 ? 'AM' : 'PM'}`;
}

/**
 * Builds a week of business hours: open every day from `open` to `close` (minutes after
 * midnight), with Sunday's hours overridden or closed.
 *
 * @param open - Opening time, minutes after midnight
 * @param close - Closing time, minutes after midnight
 * @param sunday - Sunday's [open, close], or null when closed on Sundays
 * @returns One entry per weekday, Sunday first
 */
function buildBusinessHours(
    open: number,
    close: number,
    sunday: [number, number] | null,
): BusinessHoursDay[] {
    return WEEKDAYS.map((day, index) => {
        const hours = index === 0 ? sunday : ([open, close] as [number, number]);
        return {
            id: index,
            label: day.slice(0, 3),
            day,
            status: hours !== null,
            periods: hours
                ? [
                      {
                          id: `period-${index}`,
                          dayId: index,
                          open: toTimeLabel(hours[0]),
                          close: toTimeLabel(hours[1]),
                          openingHourData: {
                              hour: Math.floor(hours[0] / 60),
                              minute: hours[0] % 60,
                              second: 0,
                          },
                          closingHourData: {
                              hour: Math.floor(hours[1] / 60),
                              minute: hours[1] % 60,
                              second: 0,
                          },
                      },
                  ]
                : [],
        };
    });
}

/**
 * Converts a wall-clock time in a time zone to a UTC epoch.
 *
 * @param calendarDate - "YYYY-MM-DD" in that zone
 * @param minutes - Minutes after that day's midnight
 * @param timeZone - IANA time zone
 * @returns Milliseconds since the epoch
 */
function zonedToEpoch(calendarDate: string, minutes: number, timeZone: string): number {
    const [year, month, day] = calendarDate.split('-').map(Number);
    const guess = Date.UTC(year, month - 1, day, 0, minutes);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).formatToParts(new Date(guess));
    const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
    const wallClock = Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour'),
        get('minute'),
    );
    return guess - (wallClock - guess);
}

/**
 * Builds the venues.
 *
 * @param random - Seeded generator
 * @returns The hosts
 */
function buildHosts(random: SeededRandom): Host[] {
    return MOCK_VENUE_SEEDS.map(
        ([name, street, city, state, postalCode, latitude, longitude, timeZone, category], i) => {
            const venueNumber = String(i + 1).padStart(4, '0');
            const schedule = i % 3;
            const businessHours =
                schedule === 0
                    ? buildBusinessHours(8 * 60, 22 * 60, [10 * 60, 18 * 60])
                    : schedule === 1
                      ? buildBusinessHours(6 * 60, 23 * 60, [6 * 60, 23 * 60])
                      : buildBusinessHours(9 * 60, 21 * 60, null);

            return {
                hostId: random.uuid(),
                programmaticId: random.uuid(),
                dealerId: `DEALER-${String((i % 5) + 1).padStart(3, '0')}`,
                name,
                address: `${street}, ${city}, ${state} ${postalCode}`,
                street,
                city,
                postalCode,
                region: null,
                state,
                country: 'US',
                latitude: String(latitude),
                longitude: String(longitude),
                timeZone,
                venueType: category,
                category,
                vistarVenueId: `VEN-${venueNumber}`,
                contactPerson: `Sample Contact ${i + 1}`,
                contactNumber: `(555) 010-${venueNumber}`,
                status: 'A',
                businessHours,
                slotCount: random.int(4, 12),
            };
        },
    );
}

/**
 * Builds the creatives: every placeholder image under every source.
 *
 * @param random - Seeded generator
 * @param now - Generation time, epoch ms
 * @returns The media files
 */
function buildMediaFiles(random: SeededRandom, now: number): MediaFile[] {
    const files: MediaFile[] = [];
    MOCK_CREATIVE_SOURCES.forEach((source, sourceIndex) => {
        MOCK_CREATIVE_NAMES.forEach((name, nameIndex) => {
            const number = sourceIndex * MOCK_CREATIVE_NAMES.length + nameIndex + 1;
            const image = String(nameIndex + 1).padStart(2, '0');
            const createdAt = new Date(
                now - random.int(HISTORY_DAYS, 120) * 86_400_000,
            ).toISOString();
            const url = `/mock-media/creative-${image}.svg`;
            files.push({
                id: random.uuid(),
                creative_id: `CR-${String(1000 + number)}`,
                creative_source: source,
                original_url: url,
                creative_type: 'image',
                creative_name: `${name} ${sourceIndex + 1}`,
                duration: random.pick([10, 15, 30]),
                handle: `creative-${image}`,
                s3_url: url,
                converted: true,
                conversion_id: null,
                width: 1920,
                height: 1080,
                mime_type: 'image/svg+xml',
                status: 'ready',
                created_at: createdAt,
                updated_at: createdAt,
                last_processed_at: createdAt,
            });
        });
    });
    return files;
}

/**
 * Builds the play records: each venue plays creatives through its open hours, every day
 * of the history window, with a realistic spread of proof-of-play delays.
 *
 * @param random - Seeded generator
 * @param now - Generation time, epoch ms
 * @param hosts - Venues
 * @param mediaFiles - Creatives
 * @returns The play records, newest first
 */
function buildAds(
    random: SeededRandom,
    now: number,
    hosts: Host[],
    mediaFiles: MediaFile[],
): ProgrammaticAd[] {
    // A few creatives are far more popular than the rest, like real campaigns
    const creativeWeights = mediaFiles.map((_, i) => 1 / (1 + (i % 12)) + random.next() * 0.2);
    const programmaticIds = new Map(MOCK_CREATIVE_SOURCES.map((s) => [s, random.uuid()]));
    const ads: ProgrammaticAd[] = [];

    for (const host of hosts) {
        const popularity = 0.5 + random.next();
        const deviceIds = Array.from(
            { length: random.int(1, 3) },
            (_, i) => `DEV-${host.vistarVenueId.slice(4)}-${i + 1}`,
        );

        for (let back = HISTORY_DAYS; back >= 0; back--) {
            const calendarDate = new Date(now - back * 86_400_000).toISOString().slice(0, 10);
            const weekday = WEEKDAYS[new Date(`${calendarDate}T12:00:00Z`).getUTCDay()];
            const period = host.businessHours.find((d) => d.day === weekday)?.periods[0];
            if (!period) {
                continue;
            }

            const open = period.openingHourData.hour * 60 + period.openingHourData.minute;
            const close = period.closingHourData.hour * 60 + period.closingHourData.minute;
            const plays = Math.round(
                PLAYS_PER_VENUE_DAY * popularity * (0.6 + random.next() * 0.8),
            );

            for (let p = 0; p < plays; p++) {
                const fetchedAt = zonedToEpoch(
                    calendarDate,
                    random.int(open, close - 1),
                    host.timeZone,
                );
                if (fetchedAt > now) {
                    continue;
                }

                const file = random.weighted(mediaFiles, creativeWeights);
                const served = random.chance(0.97);
                const servedAt = served ? fetchedAt + random.int(1, 30) * 1000 : null;
                const playedAt =
                    servedAt !== null && random.chance(0.97)
                        ? servedAt + random.int(1, 60) * 1000
                        : null;

                // Proof-of-play delay: mostly 1-5 min, some 6-10, a few over 10, a few never
                const bucket = random.weighted(['green', 'yellow', 'red', 'none'], [70, 18, 7, 5]);
                const delayMinutes =
                    bucket === 'green'
                        ? 0.6 + random.next() * 4.8
                        : bucket === 'yellow'
                          ? 5.6 + random.next() * 4.8
                          : 11 + random.next() * 35;
                const popSentAt =
                    playedAt !== null && bucket !== 'none'
                        ? fetchedAt + delayMinutes * 60_000
                        : null;

                const slot = random.int(1, host.slotCount);
                ads.push({
                    id: random.uuid(),
                    creative_id: file.creative_id,
                    creative_group_id: `GRP-${file.creative_id.slice(3)}`,
                    creative_source: file.creative_source,
                    programmatic_id: programmaticIds.get(file.creative_source) ?? '',
                    api_url: 'https://api.example.com/programmatic',
                    vendor_key: 'sample-vendor-key',
                    venue_id: host.vistarVenueId,
                    device_id: random.pick(deviceIds),
                    fetched_at: new Date(fetchedAt).toISOString(),
                    served,
                    date_served: servedAt !== null ? new Date(servedAt).toISOString() : null,
                    proof_of_play_data: null,
                    played:
                        playedAt !== null && playedAt <= now
                            ? new Date(playedAt).toISOString()
                            : null,
                    proof_of_play_sent:
                        popSentAt !== null && popSentAt <= now
                            ? new Date(popSentAt).toISOString()
                            : null,
                    pop_screenshot: playedAt !== null ? '/mock-media/pop-screenshot.svg' : null,
                    metadata: { trackerId: `TRK-${random.int(100000, 999999)}` },
                    opensearch_saved: true,
                    slot_playlist_content_id: `slot-${host.vistarVenueId}-${slot}`,
                    slot_playlist_content_position: String(slot),
                });
            }
        }
    }

    return ads.sort((a, b) =>
        a.fetched_at < b.fetched_at ? 1 : a.fetched_at > b.fetched_at ? -1 : 0,
    );
}

/** Built on first use and kept for the life of the process. */
let dataset: MockDataset | null = null;

/**
 * Returns the dummy dataset, building it on first call. Deterministic for a given start
 * time: the same venues and creatives every run, with play records ending "now".
 *
 * @returns The dataset
 */
export function getMockDataset(): MockDataset {
    if (!dataset) {
        const random = new SeededRandom(SEED);
        const now = Date.now();
        const hosts = buildHosts(random);
        const mediaFiles = buildMediaFiles(random, now);
        const ads = buildAds(random, now, hosts, mediaFiles);
        dataset = { hosts, mediaFiles, ads };
        console.log(
            `[MockData] Generated ${hosts.length} venues, ${mediaFiles.length} creatives, ${ads.length} play records`,
        );
    }
    return dataset;
}
