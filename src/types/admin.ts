export interface AdminStats {
  domains: number;
  categories: number;
  flashcards: number;
  paths: number;
  groups: number;
  users: number;
}

export interface RecentGroup {
  id: number;
  name: string;
  createdAt: string;
  adminName: string | null;
  memberCount: number;
}

export interface RecentDomain {
  id: number;
  name: string;
  createdAt: string;
  creatorName: string | null;
  categoryCount: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentGroups: RecentGroup[];
  recentDomains: RecentDomain[];
}

export type StatCardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "indigo";

export interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  href: string;
  color: StatCardColor;
}

export interface QuickActionProps {
  href: string;
  icon: string;
  label: string;
}

export interface RecentActivityCardProps {
  title: string;
  items: RecentGroup[] | RecentDomain[];
  emptyMessage: string;
  renderItem: (item: any) => React.ReactNode;
}
