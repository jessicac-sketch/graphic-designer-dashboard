/**
 * Two-letter USPS state code -> full state name, as used by the
 * `us-atlas` TopoJSON's feature `properties.name` (e.g. "California") -
 * `StateRankingEntry.state` carries the two-letter code instead, so map
 * rendering needs to translate between the two.
 *
 * @remarks
 * Includes the District of Columbia (DC), which `us-atlas` ships as a
 * state-level feature.
 */
export const STATE_CODE_TO_NAME: Readonly<Record<string, string>> = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District of Columbia',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
};

/**
 * Reverse of STATE_CODE_TO_NAME, built once - full state name -> two-letter code.
 */
export const STATE_NAME_TO_CODE: Readonly<Record<string, string>> = Object.fromEntries(
    Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name, code]),
);
