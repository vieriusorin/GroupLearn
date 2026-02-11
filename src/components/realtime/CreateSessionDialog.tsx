"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createLiveSession } from "@/presentation/actions/realtime/liveSession.actions";
import { Zap, Users, FileCheck } from "lucide-react";

interface CreateSessionDialogProps {
  groupId: number;
  categories?: Array<{ id: number; name: string }>;
  trigger?: React.ReactNode;
}

export function CreateSessionDialog({
  groupId,
  categories = [],
  trigger,
}: CreateSessionDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [sessionType, setSessionType] = useState<
    "blitz_quiz" | "study_room" | "peer_review"
  >("blitz_quiz");
  const [cardCount, setCardCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [allowHints, setAllowHints] = useState(false);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await createLiveSession(
          groupId,
          sessionType,
          {
            cardCount,
            timeLimit,
            allowHints,
          },
          categoryId,
        );

        if (result.success && result.data) {
          setIsOpen(false);
          // Navigate to session lobby
          router.push(`/groups/${groupId}/sessions/${result.data.id}`);
        } else {
          setError(result.error || "Failed to create session");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Failed to create session:", err);
      }
    });
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "blitz_quiz":
        return <Zap className="h-4 w-4" />;
      case "study_room":
        return <Users className="h-4 w-4" />;
      case "peer_review":
        return <FileCheck className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSessionTypeDescription = (type: string) => {
    switch (type) {
      case "blitz_quiz":
        return "Fast-paced competitive quiz with live leaderboard and XP rewards";
      case "study_room":
        return "Collaborative study session with shared progress tracking";
      case "peer_review":
        return "Review each other's answers and provide feedback";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Create Live Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Live Session</DialogTitle>
          <DialogDescription>
            Set up a new live learning session for your group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select
              value={sessionType}
              onValueChange={(value: any) => setSessionType(value)}
            >
              <SelectTrigger id="session-type">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blitz_quiz">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Blitz Quiz</span>
                  </div>
                </SelectItem>
                <SelectItem value="study_room">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Study Room</span>
                  </div>
                </SelectItem>
                <SelectItem value="peer_review">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span>Peer Review</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getSessionTypeDescription(sessionType)}
            </p>
          </div>

          {/* Card Count */}
          <div className="space-y-2">
            <Label htmlFor="card-count">Number of Cards</Label>
            <Select
              value={cardCount.toString()}
              onValueChange={(value) => setCardCount(parseInt(value))}
            >
              <SelectTrigger id="card-count">
                <SelectValue placeholder="Select number of cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 cards</SelectItem>
                <SelectItem value="10">10 cards</SelectItem>
                <SelectItem value="15">15 cards</SelectItem>
                <SelectItem value="20">20 cards</SelectItem>
                <SelectItem value="30">30 cards (Pro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <Label htmlFor="time-limit">Time per Card (seconds)</Label>
            <Select
              value={timeLimit.toString()}
              onValueChange={(value) => setTimeLimit(parseInt(value))}
            >
              <SelectTrigger id="time-limit">
                <SelectValue placeholder="Select time limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="20">20 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="45">45 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                value={categoryId?.toString() || "all"}
                onValueChange={(value) =>
                  setCategoryId(value === "all" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Allow Hints */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="allow-hints">Allow AI Hints</Label>
              <p className="text-sm text-muted-foreground">
                Let participants request hints during the quiz
              </p>
            </div>
            <Switch
              id="allow-hints"
              checked={allowHints}
              onCheckedChange={setAllowHints}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
