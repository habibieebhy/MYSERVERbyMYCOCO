// src/utils/pointsCalcLogic.ts

/**
 * --- POLICY CONSTANTS ---
 * Based on "Mason and PC scheme policy_v5.pdf"
 */
export const LOYALTY_CONSTANTS = {
    // 3. Joining Bonus: "250 bonus points"
    JOINING_BONUS_POINTS: 250,

    // 1. Base Points: "1 point for every bag lifted"
    BASE_POINTS_PER_BAG: 1,

    // 2. Bonanza Points: "Additional 3 points per bag"
    BONANZA_POINTS_PER_BAG: 3,
    BONANZA_START_DATE: new Date('2025-11-15T00:00:00.000Z'),
    BONANZA_END_DATE: new Date('2026-01-15T23:59:59.999Z'),

    // 4. Extra Bonus: "Every 250 bags = +500 extra points"
    EXTRA_BONUS_BAG_SLAB: 250,
    EXTRA_BONUS_POINTS: 500,

    // 5. Referral Bonus: "100 Points for referring new participants"
    REFERRAL_BONUS_POINTS: 100,
    // "Referee eligible once the referred person lifts 200 bags"
    REFERRAL_BAG_THRESHOLD: 200,
};

// --- CORE CALCULATION FUNCTIONS ---

/**
 * Calculates the flat, one-time Joining Bonus points.
 * This is triggered upon verified registration.
 */
export function calculateJoiningBonusPoints(): number {
    return LOYALTY_CONSTANTS.JOINING_BONUS_POINTS;
}

/**
 * Calculates Base Points and Bonanza Points for a single bag lift transaction.
 * @param bagCount The number of bags lifted.
 * @param purchaseDate The date of purchase (used to check for Bonanza period).
 * @returns The total points (Base + Bonanza) for this lift, excluding cumulative bonuses.
 */
export function calculateBaseAndBonanzaPoints(bagCount: number, purchaseDate: Date): number {
    let points = bagCount * LOYALTY_CONSTANTS.BASE_POINTS_PER_BAG;

    const isBonanzaPeriod = 
        purchaseDate >= LOYALTY_CONSTANTS.BONANZA_START_DATE && 
        purchaseDate <= LOYALTY_CONSTANTS.BONANZA_END_DATE;
        
    if (isBonanzaPeriod) {
        points += bagCount * LOYALTY_CONSTANTS.BONANZA_POINTS_PER_BAG;
    }
    
    return points;
}

/**
 * Calculates the cumulative "Extra Bonus Points" earned by this new lift.
 * This function should be called during TSO approval (PATCH) after retrieving the Mason's
 * total bags lifted prior to the current transaction.
 * * @param oldTotalBags The total number of bags lifted BEFORE the current transaction.
 * @param newBagCount The bags lifted in the current transaction.
 * @returns The total extra bonus points to be credited (0, 500, 1000, etc.).
 */
export function calculateExtraBonusPoints(oldTotalBags: number, newBagCount: number): number {
    const newTotalBags = oldTotalBags + newBagCount;
    
    // Calculate how many 250-bag slabs were completed BEFORE the new lift
    const oldSlabCount = Math.floor(oldTotalBags / LOYALTY_CONSTANTS.EXTRA_BONUS_BAG_SLAB);
    
    // Calculate how many 250-bag slabs are completed AFTER the new lift
    const newSlabCount = Math.floor(newTotalBags / LOYALTY_CONSTANTS.EXTRA_BONUS_BAG_SLAB);
    
    // The number of new slabs crossed is the difference
    const slabsCrossed = newSlabCount - oldSlabCount;

    if (slabsCrossed <= 0) {
        return 0;
    }

    // Each crossed slab awards 500 points
    return slabsCrossed * LOYALTY_CONSTANTS.EXTRA_BONUS_POINTS;
}

/**
 * Checks if the Referral Bonus should be triggered for the REFERRER.
 * This function should be called during TSO approval (PATCH) for the REFERRED Mason's lift.
 * * @param oldTotalBags The referred Mason's total bags BEFORE the current transaction.
 * @param newBagCount The referred Mason's current bags lifted.
 * @returns The Referral Bonus points (100) if the 200-bag threshold was just crossed, otherwise 0.
 */
export function checkReferralBonusTrigger(oldTotalBags: number, newBagCount: number): number {
    const threshold = LOYALTY_CONSTANTS.REFERRAL_BAG_THRESHOLD; // 200 bags
    const newTotalBags = oldTotalBags + newBagCount;

    // Trigger only if the OLD total was below 200 AND the NEW total is >= 200
    const trigger = oldTotalBags < threshold && newTotalBags >= threshold;

    return trigger ? LOYALTY_CONSTANTS.REFERRAL_BONUS_POINTS : 0;
}