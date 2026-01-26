"use client";

/**
 * Online Members Component
 *
 * Displays a list of currently online members in a group with real-time updates.
 * Uses Socket.io for presence tracking and automatic heartbeat mechanism.
 */

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface OnlineUser {
  userId: string;
  userName: string;
  userImage?: string | null;
  status: "online" | "away" | "offline";
}

interface OnlineMembersProps {
  groupId: number;
  maxDisplay?: number;
}

export function OnlineMembers({ groupId, maxDisplay = 5 }: OnlineMembersProps) {
  const { socket, connected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket || !connected) {
      setIsLoading(true);
      return;
    }

    // Join group room for presence updates
    socket.emit("presence:join_group", groupId);

    // Update own presence status
    socket.emit("presence:update", {
      groupId,
      status: document.hasFocus() ? "online" : "away",
    });

    // Listen for initial group presence state
    const handleGroupState = (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((u) => u.status !== "offline"));
      setIsLoading(false);
    };

    // Listen for real-time presence updates
    const handleUserUpdated = (user: OnlineUser) => {
      setOnlineUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== user.userId);
        return user.status === "offline" ? filtered : [...filtered, user];
      });
    };

    socket.on("presence:group_state", handleGroupState);
    socket.on("presence:user_updated", handleUserUpdated);

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:update", {
          groupId,
          status: document.hasFocus() ? "online" : "away",
        });
      }
    }, 30000);

    // Update status when tab focus changes
    const handleVisibilityChange = () => {
      if (socket.connected) {
        socket.emit("presence:update", {
          groupId,
          status: document.hidden ? "away" : "online",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (socket.connected) {
        socket.emit("presence:update", { groupId, status: "offline" });
        socket.off("presence:group_state", handleGroupState);
        socket.off("presence:user_updated", handleUserUpdated);
      }
    };
  }, [socket, connected, groupId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, onlineUsers.length - maxDisplay);

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <div className="flex items-center">
          {/* Avatar Stack */}
          <div className="flex -space-x-2">
            {displayUsers.map((user) => (
              <Tooltip key={user.userId}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2 border-background hover:z-10 transition-transform hover:scale-110">
                      <AvatarImage src={user.userImage || undefined} alt={user.userName} />
                      <AvatarFallback className="text-xs">
                        {user.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                        user.status === "online"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{user.userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.status}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Remaining count */}
          {remainingCount > 0 && (
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              +{remainingCount}
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Online count badge */}
      <Badge variant="secondary" className="gap-1.5">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-medium">{onlineUsers.length}</span>
        <span className="text-muted-foreground">online</span>
      </Badge>
    </div>
  );
}

/**
 * Compact variant showing only count
 */
export function OnlineMembersCompact({ groupId }: { groupId: number }) {
  const { socket, connected } = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("presence:join_group", groupId);

    socket.on("presence:group_state", (users: OnlineUser[]) => {
      setCount(users.filter((u) => u.status !== "offline").length);
    });

    socket.on("presence:user_updated", () => {
      // Refresh count (simplified - in production you'd track this more efficiently)
      socket.emit("presence:join_group", groupId);
    });

    return () => {
      socket.off("presence:group_state");
      socket.off("presence:user_updated");
    };
  }, [socket, connected, groupId]);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="font-medium">{count}</span>
      <Users className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
