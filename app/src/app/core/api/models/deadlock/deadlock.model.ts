// Contracts of Voidwell.Deadlock. Rates are fractions from 0 to 1.

export type DeadlockMode = 'ranked' | 'unranked' | 'all';
export type ItemSlot = 'weapon' | 'spirit' | 'vitality';

/** The days, mode and rank tiers a response covers. */
export interface RangeInfo {
    from: string;
    to: string;
    mode: string;
    minTier: number | null;
    maxTier: number | null;
}

/** Reference data. */
export interface DeadlockHero {
    id: number;
    name: string | null;
    className: string | null;
    heroType: string | null;
    developmentState: string | null;
    isPlayable: boolean;
    imageUrl: string | null;
    iconUrl: string | null;
}

export interface DeadlockRank {
    tier: number;
    name: string | null;
    color: string | null;
    imageUrl: string | null;
}

export interface DeadlockPatch {
    date: string;
    publishedAt: string;
    title: string | null;
    source: string | null;
    link: string | null;
    isBigDay: boolean;
}

/** Heroes. */
export interface HeroSummary {
    heroId: number;
    name: string | null;
    imageUrl: string | null;
    iconUrl: string | null;
    games: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    pickRate: number;
    banRate: number | null;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
    kda: number;
    avgMatchMinutes: number;
    soulsPerMinute: number;
    lastHitsPerMinute: number;
    damagePerMinute: number | null;
    damageTakenPerMinute: number | null;
    bossDamagePerMinute: number | null;
    healingPerMinute: number | null;
    accuracy: number | null;
}

export interface HeroStatsResponse {
    query: RangeInfo;
    matches: number;
    heroes: HeroSummary[];
}

export interface TierListEntry {
    tier: string;
    hero: HeroSummary;
}

export interface TierListResponse {
    query: RangeInfo;
    matches: number;
    method: string;
    heroes: TierListEntry[];
}

export interface HeroTrend {
    heroId: number;
    name: string | null;
    iconUrl: string | null;
    games: number;
    baselineGames: number;
    winRate: number;
    baselineWinRate: number;
    winRateChange: number;
    pickRate: number;
    baselinePickRate: number;
    pickRateChange: number;
    banRate: number | null;
    baselineBanRate: number | null;
    banRateChange: number | null;
    zScore: number;
    significant: boolean;
}

export interface HeroTrendsResponse {
    query: RangeInfo;
    baseline: RangeInfo;
    heroes: HeroTrend[];
}

export interface HeroDailyPoint {
    day: string;
    games: number;
    wins: number;
    winRate: number;
    pickRate: number;
}

export interface HeroTierPoint {
    tier: number;
    tierName: string;
    games: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    pickRate: number;
}

export interface HeroDetailResponse {
    query: RangeInfo;
    hero: HeroSummary;
    daily: HeroDailyPoint[];
    byTier: HeroTierPoint[];
}

export interface HeroContext {
    heroId: number;
    name: string | null;
    iconUrl: string | null;
    games: number;
    winRate: number;
}

/** Items. */
export interface ItemTimingPoint {
    bucket: 'early' | 'mid' | 'late' | 'endgame';
    games: number;
    share: number;
    winRate: number;
}

export interface ItemSummary {
    itemId: number;
    name: string | null;
    imageUrl: string | null;
    slotType: string | null;
    tier: number | null;
    cost: number | null;
    games: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    buyRate: number;
    keptRate: number;
    keptWinRate: number | null;
    avgFirstBuyMinutes: number;
    winRateLift: number;
    timing: ItemTimingPoint[];
}

export interface ItemStatsResponse {
    query: RangeInfo;
    matches: number;
    items: ItemSummary[];
}

export interface HeroItemsResponse {
    query: RangeInfo;
    hero: HeroContext;
    items: ItemSummary[];
}

export interface BuildShapePoint {
    weaponItems: number;
    spiritItems: number;
    vitalityItems: number;
    label: string;
    games: number;
    share: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
}

export interface HeroBuildShapesResponse {
    query: RangeInfo;
    hero: HeroContext;
    shapes: BuildShapePoint[];
}

export interface AbilitySummary {
    abilityId: number;
    name: string | null;
    imageUrl: string | null;
    games: number;
    learnRate: number;
    winRate: number;
    maxedRate: number;
    maxedWinRate: number | null;
    maxFirstRate: number;
    maxFirstWinRate: number | null;
    avgFirstPointMinutes: number;
}

export interface AbilityPickOption {
    abilityId: number;
    name: string | null;
    games: number;
    share: number;
    winRate: number;
}

export interface AbilityPickPoint {
    pick: number;
    options: AbilityPickOption[];
}

export interface HeroAbilityOrderResponse {
    query: RangeInfo;
    hero: HeroContext;
    abilities: AbilitySummary[];
    picks: AbilityPickPoint[];
    suggestedOrder: number[];
}

/** One item of a suggested build, in buying order. */
export interface ItemBuildStep {
    order: number;
    itemId: number;
    name: string | null;
    imageUrl: string | null;
    slot: string | null;
    tier: number | null;
    cost: number | null;
    buyTimeMinutes: number;
    core: boolean;
    pick: number;
    cohortGames: number;
    games: number;
    pickRate: number;
    winRate: number;
    gamesWithout: number;
    winRateWithout: number;
    lift: number | null;
    liftLow: number | null;
    standaloneLift: number | null;
    synergy: number | null;
}

export interface HeroItemBuildResponse {
    query: RangeInfo;
    hero: HeroContext;
    games: number;
    winRate: number;
    items: ItemBuildStep[];
    fullBuildGames: number;
    fullBuildWinRate: number | null;
    fullBuildWinRateLow: number | null;
    fullBuildWinRateHigh: number | null;
    stopReason: string;
}

export interface CommunityBuildPoint {
    buildId: number;
    games: number;
    share: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    winRateLift: number;
}

export interface HeroCommunityBuildsResponse {
    query: RangeInfo;
    hero: HeroContext;
    buildUseRate: number;
    builds: CommunityBuildPoint[];
}

/** Matchups. */
export interface PairSummary {
    heroId: number;
    name: string | null;
    iconUrl: string | null;
    games: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    expectedWinRate: number;
    advantage: number;
    avgLeadAtNineMinutes: number | null;
}

export interface HeroPairsResponse {
    query: RangeInfo;
    hero: HeroContext;
    heroes: PairSummary[];
}

export interface CompositionPoint {
    brawlers: number;
    assassins: number;
    marksmen: number;
    mystics: number;
    supports: number;
    label: string;
    games: number;
    share: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
}

export interface CompositionsResponse {
    query: RangeInfo;
    teams: number;
    compositions: CompositionPoint[];
}

/** Curves. */
export interface CurveStats {
    samples: number;
    netWorth: number;
    level: number;
    kills: number;
    deaths: number;
    assists: number;
    playerDamage: number;
    playerDamageTaken: number;
    playerHealing: number;
    weaponPower: number;
    techPower: number;
    maxHealth: number;
}

export interface CurvePoint {
    minute: number;
    all: CurveStats | null;
    winners: CurveStats | null;
    losers: CurveStats | null;
}

export interface HeroCurvesResponse {
    query: RangeInfo;
    hero: HeroContext;
    points: CurvePoint[];
}

export interface SoulsSource {
    source: string;
    souls: number;
    share: number;
}

export interface SoulsSourcePoint {
    minute: number;
    samples: number;
    netWorth: number;
    sources: SoulsSource[];
}

export interface HeroSoulsSourcesResponse {
    query: RangeInfo;
    hero: HeroContext;
    points: SoulsSourcePoint[];
}

export interface LeadBucketPoint {
    leadFrom: number;
    leadTo: number | null;
    games: number;
    leaderWins: number;
    leaderWinRate: number;
    leaderWinRateLow: number;
    leaderWinRateHigh: number;
    comebackRate: number;
}

export interface LeadMinutePoint {
    minute: number;
    games: number;
    leaderWinRate: number;
    leaderWinRateLow: number;
    leaderWinRateHigh: number;
    comebackRate: number;
    buckets: LeadBucketPoint[];
}

export interface LeadResponse {
    query: RangeInfo;
    minutes: LeadMinutePoint[];
}

/** Matches as a whole. */
export interface OverviewTotals {
    matches: number;
    avgMatchMinutes: number;
    team0WinRate: number;
    team0WinRateLow: number;
    team0WinRateHigh: number;
    banCoverage: number;
}

export interface DailyMatchPoint {
    day: string;
    matches: number;
    avgMatchMinutes: number;
}

export interface ModeShare {
    mode: string;
    matches: number;
    share: number;
}

export interface DurationBucket {
    fromMinute: number;
    toMinute: number | null;
    matches: number;
    share: number;
}

export interface DurationSummary {
    avgMinutes: number;
    p10Minutes: number;
    p25Minutes: number;
    p50Minutes: number;
    p75Minutes: number;
    p90Minutes: number;
    histogram: DurationBucket[];
}

export interface HourPoint {
    hour: number;
    matches: number;
    share: number;
    matchesPerDay: number;
}

export interface OverviewResponse {
    query: RangeInfo;
    totals: OverviewTotals;
    modes: ModeShare[];
    daily: DailyMatchPoint[];
    duration: DurationSummary;
    hours: HourPoint[];
}

export interface RankPoint {
    tier: number;
    tierName: string;
    matches: number;
    share: number;
}

export interface RanksResponse {
    query: RangeInfo;
    matches: number;
    ranks: RankPoint[];
}

export interface ObjectivePoint {
    objective: number;
    name: string;
    type: string;
    lane: number | null;
    lostGames: number;
    lostRate: number;
    winRateWhenLost: number;
    winRateWhenLostLow: number;
    winRateWhenLostHigh: number;
    heldGames: number;
    winRateWhenHeld: number;
    winRateWhenHeldLow: number;
    winRateWhenHeldHigh: number;
}

export interface ObjectivesResponse {
    query: RangeInfo;
    teams: number;
    objectives: ObjectivePoint[];
}

export interface LeaverScenario {
    ownLeavers: number;
    enemyLeavers: number;
    label: string;
    games: number;
    wins: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
}

export interface LeaversResponse {
    query: RangeInfo;
    players: number;
    leavers: number;
    leaverRate: number;
    matchesWithLeaverRate: number;
    winRateWithLeaver: number | null;
    winRateAgainstLeaver: number | null;
    scenarios: LeaverScenario[];
}
