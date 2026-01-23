"use client";

import { Check, ChevronDown } from "lucide-react";
import type { PathWithProgress } from "@/application/dtos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PathSelectorProps {
  paths: PathWithProgress[];
  selectedPathId: number;
  onSelectPath: (pathId: number) => void;
}

export function PathSelector({
  paths,
  selectedPathId,
  onSelectPath,
}: PathSelectorProps) {
  const selectedPath = paths.find((p) => p.id === selectedPathId);

  return (
    <div className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-between min-w-[300px]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedPath?.icon || "📚"}</span>
                <div className="text-left">
                  <div className="font-bold">
                    {selectedPath?.name || "Select Path"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPath?.completionPercent}% complete •{" "}
                    {selectedPath?.totalXp} XP
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px]">
            {paths.map((path) => (
              <DropdownMenuItem
                key={path.id}
                onClick={() => onSelectPath(path.id)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start gap-3 w-full">
                  <span className="text-3xl">{path.icon || "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">
                        {path.name}
                      </span>
                      {path.id === selectedPathId && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    {path.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {path.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="secondary" className="text-xs">
                        {path.completionPercent}% complete
                      </Badge>
                      <span className="text-muted-foreground">
                        ⚡ {path.totalXp} XP
                      </span>
                      <span className="text-muted-foreground">
                        📝 {path.completedLessons}/{path.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
