/**
 * Invitation Types
 * Types for invitation-related pages and components
 */

export interface InvitationData {
  valid: boolean;
  invitation?: InvitationDetails;
  group?: GroupDetails;
  error?: string;
  message?: string;
}

export interface InvitationDetails {
  id: number;
  groupId: number;
  email: string;
  invitedBy: string;
  invitedByName?: string;
  expiresAt: string;
}

export interface GroupDetails {
  id: number;
  name: string;
  description: string | null;
  admin_name: string;
  member_count: number;
}

export interface InviteModalProps {
  groupId: number;
  onClose: () => void;
  onSent: () => void;
  isSending: boolean;
  onSend: (
    email: string,
    role: "member" | "admin",
    pathIds: number[],
  ) => Promise<void>;
}
