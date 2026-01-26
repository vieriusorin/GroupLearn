/**
 * Knowledge Gap Entity
 *
 * Represents an identified learning gap within a group, where multiple users
 * are struggling with a specific topic or concept. Used by the AI Coach to
 * generate targeted "bridge decks" that address prerequisite knowledge.
 */

export interface KnowledgeGapProps {
  id?: number;
  groupId: number;
  topic: string;
  categoryId?: number;
  successRate: number;
  affectedUserCount: number;
  totalUsers?: number;
  prerequisiteConcepts: string[];
  recommendedActions: string[];
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "addressed" | "resolved";
  bridgeDeckGenerated: boolean;
  detectedAt: Date;
}

export class KnowledgeGap {
  private readonly props: KnowledgeGapProps;

  constructor(props: KnowledgeGapProps) {
    this.props = { ...props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get groupId(): number {
    return this.props.groupId;
  }

  get topic(): string {
    return this.props.topic;
  }

  get categoryId(): number | undefined {
    return this.props.categoryId;
  }

  get successRate(): number {
    return this.props.successRate;
  }

  get affectedUserCount(): number {
    return this.props.affectedUserCount;
  }

  get totalUsers(): number | undefined {
    return this.props.totalUsers;
  }

  get prerequisiteConcepts(): string[] {
    return [...this.props.prerequisiteConcepts];
  }

  get recommendedActions(): string[] {
    return [...this.props.recommendedActions];
  }

  get severity(): "low" | "medium" | "high" | "critical" {
    return this.props.severity;
  }

  get status(): "detected" | "addressed" | "resolved" {
    return this.props.status;
  }

  get bridgeDeckGenerated(): boolean {
    return this.props.bridgeDeckGenerated;
  }

  get detectedAt(): Date {
    return this.props.detectedAt;
  }

  /**
   * Calculate severity based on success rate and affected user percentage
   */
  static calculateSeverity(
    successRate: number,
    affectedUserCount: number,
    totalUsers: number
  ): "low" | "medium" | "high" | "critical" {
    const affectedPercentage = (affectedUserCount / totalUsers) * 100;

    if (successRate < 30 && affectedPercentage > 75) {
      return "critical";
    } else if (successRate < 40 && affectedPercentage > 50) {
      return "high";
    } else if (successRate < 50 && affectedPercentage > 30) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Check if this gap needs a bridge deck
   */
  needsBridgeDeck(): boolean {
    return (
      !this.props.bridgeDeckGenerated &&
      this.props.status === "detected" &&
      (this.props.severity === "high" || this.props.severity === "critical")
    );
  }

  /**
   * Mark gap as addressed with bridge deck
   */
  markAsAddressed(): KnowledgeGap {
    return new KnowledgeGap({
      ...this.props,
      status: "addressed",
      bridgeDeckGenerated: true,
    });
  }

  /**
   * Mark gap as resolved
   */
  markAsResolved(): KnowledgeGap {
    return new KnowledgeGap({
      ...this.props,
      status: "resolved",
    });
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): KnowledgeGapProps {
    return { ...this.props };
  }
}
