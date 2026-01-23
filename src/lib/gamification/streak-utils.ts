export function getCurrentUTCDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getUTCDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayUTCDate(): string {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getUTCDateString(yesterday);
}

export function isTodayUTC(dateString: string | null): boolean {
  if (!dateString) return false;
  return dateString === getCurrentUTCDate();
}

export function isYesterdayUTC(dateString: string | null): boolean {
  if (!dateString) return false;
  return dateString === getYesterdayUTCDate();
}

export function calculateStreak(
  _userId: string,
  lastActivityDate: string | null,
  currentStreak: number,
): { newStreak: number; maintainedToday: boolean } {
  const _today = getCurrentUTCDate();

  if (!lastActivityDate) {
    return { newStreak: 1, maintainedToday: true };
  }

  if (isTodayUTC(lastActivityDate)) {
    return { newStreak: currentStreak, maintainedToday: true };
  }

  if (isYesterdayUTC(lastActivityDate)) {
    return { newStreak: currentStreak + 1, maintainedToday: true };
  }

  return { newStreak: 0, maintainedToday: false };
}
