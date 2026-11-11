/**
 * A small deterministic pseudo-random number generator (mulberry32), so the dummy
 * dataset comes out the same on every server start.
 */
export class SeededRandom {
    private state: number;

    /**
     * @param seed - Any 32-bit integer; the same seed always yields the same sequence
     */
    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    /**
     * Next float in [0, 1).
     *
     * @returns A pseudo-random float
     */
    next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Next integer in [min, max], both inclusive.
     *
     * @param min - Lowest value
     * @param max - Highest value
     * @returns A pseudo-random integer
     */
    int(min: number, max: number): number {
        return min + Math.floor(this.next() * (max - min + 1));
    }

    /**
     * True with the given probability.
     *
     * @param probability - Chance of true, 0 to 1
     * @returns A pseudo-random boolean
     */
    chance(probability: number): boolean {
        return this.next() < probability;
    }

    /**
     * A random item of a list.
     *
     * @param items - Non-empty list to pick from
     * @returns One of the items
     */
    pick<T>(items: readonly T[]): T {
        return items[Math.floor(this.next() * items.length)];
    }

    /**
     * A random item of a list, weighted.
     *
     * @param items - Non-empty list to pick from
     * @param weights - One non-negative weight per item
     * @returns One of the items
     */
    weighted<T>(items: readonly T[], weights: readonly number[]): T {
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        let roll = this.next() * total;
        for (let i = 0; i < items.length; i++) {
            roll -= weights[i];
            if (roll < 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }

    /**
     * A UUID-shaped string (version 4 layout), from this generator.
     *
     * @returns A pseudo-random UUID
     */
    uuid(): string {
        const hex = Array.from({ length: 32 }, () => this.int(0, 15).toString(16)).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    }
}
