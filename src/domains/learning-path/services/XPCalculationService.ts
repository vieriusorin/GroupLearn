import type { Streak } from "@/domains/gamification/value-objects/Streak";
import { XP } from "@/domains/gamification/value-objects/XP";
import type { Accuracy } from "../value-objects/Accuracy";

/**
 * XP Calculation Service
 *
 * Domain service responsible for calculating XP rewards based on various factors.
 * Encapsulates the business logic for XP calculation across the application.
 */
export class XPCalculationService {
  /**
   * Calculate XP earned from completing a lesson
   *
   * @param baseReward Base XP reward for the lesson
   * @param accuracy Accuracy achieved in the lesson
   * @param isPerfect Whether all answers were correct (100% accuracy)
   * @returns Total XP earned
   */
  calculateLessonXP(
    baseReward: number,
    accuracy: Accuracy,
    isPerfect: boolean,
  ): XP {
    let total = baseReward;

    // Accuracy bonus (tiered rewards)
    if (accuracy.isPerfect()) {
      total += 15; // Perfect bonus
    } else if (accuracy.isAbove(90)) {
      total += 10; // High accuracy bonus
    } else if (accuracy.isAbove(80)) {
      total += 5; // Good accuracy bonus
    }

    // Additional perfect bonus (no mistakes at all)
    if (isPerfect && accuracy.isPerfect()) {
      total += 10; // Extra bonus for flawless completion
    }

    return XP.fromAmount(total);
  }

  /**
   * Calculate bonus XP for maintaining a streak
   *
   * @param streak Current streak count
   * @returns Bonus XP for the streak
   */
  calculateStreakBonus(streak: Streak): XP {
    const count = streak.getCount();

    // Streak milestone bonuses
    if (count >= 100) return XP.fromAmount(100);
    if (count >= 30) return XP.fromAmount(30);
    if (count >= 14) return XP.fromAmount(20);
    if (count >= 7) return XP.fromAmount(15);
    if (count >= 3) return XP.fromAmount(10);

    return XP.zero();
  }

  /**
   * Calculate XP earned from completing a unit
   *
   * @param unitBaseReward Base XP reward for the unit
   * @param lessonsCompleted Number of lessons completed in the unit
   * @param averageAccuracy Average accuracy across all lessons
   * @returns Total XP earned for unit completion
   */
  calculateUnitCompletionXP(
    unitBaseReward: number,
    lessonsCompleted: number,
    averageAccuracy: Accuracy,
  ): XP {
    let total = unitBaseReward;

    // Bonus for completing all lessons
    if (lessonsCompleted >= 5) {
      total += 25; // Unit completion bonus
    }

    // Average accuracy bonus
    if (averageAccuracy.isAbove(90)) {
      total += 20;
    } else if (averageAccuracy.isAbove(80)) {
      total += 10;
    }

    return XP.fromAmount(total);
  }

  /**
   * Calculate daily goal XP bonus
   *
   * @param goalsCompleted Number of daily goals completed
   * @returns Bonus XP for daily goals
   */
  calculateDailyGoalBonus(goalsCompleted: number): XP {
    if (goalsCompleted >= 5) return XP.fromAmount(50);
    if (goalsCompleted >= 3) return XP.fromAmount(30);
    if (goalsCompleted >= 1) return XP.fromAmount(10);

    return XP.zero();
  }

  /**
   * Calculate combo multiplier for consecutive correct answers
   *
   * @param consecutiveCorrect Number of consecutive correct answers
   * @returns Multiplier to apply to XP (1.0 = no multiplier)
   */
  calculateComboMultiplier(consecutiveCorrect: number): number {
    if (consecutiveCorrect >= 10) return 2.0; // 2x multiplier
    if (consecutiveCorrect >= 5) return 1.5; // 1.5x multiplier
    if (consecutiveCorrect >= 3) return 1.2; // 1.2x multiplier

    return 1.0; // No multiplier
  }

  /**
   * Calculate total XP with all bonuses applied
   *
   * @param baseXP Base XP earned
   * @param streak Current streak
   * @param isPerfect Whether the lesson was perfect
   * @param consecutiveCorrect Number of consecutive correct answers
   * @returns Total XP with all bonuses
   */
  calculateTotalXP(
    baseXP: XP,
    streak?: Streak,
    isPerfect: boolean = false,
    consecutiveCorrect: number = 0,
  ): XP {
    let total = baseXP;

    // Add streak bonus
    if (streak) {
      const streakBonus = this.calculateStreakBonus(streak);
      total = total.add(streakBonus);
    }

    // Apply combo multiplier
    if (consecutiveCorrect > 0) {
      const multiplier = this.calculateComboMultiplier(consecutiveCorrect);
      if (multiplier > 1.0) {
        total = total.multiply(multiplier);
      }
    }

    // Perfect lesson bonus
    if (isPerfect) {
      total = total.add(XP.fromAmount(25));
    }

    return total;
  }
}
