export type Role = "admin" | "member" | "guest";

export type SubscriptionStatus = "free" | "paid" | "trial";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: Role;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
};

export type AuthSession = {
  user: AuthUser;
};
