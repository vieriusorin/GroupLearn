"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

type CelebrationType = "lesson" | "unit" | "perfect" | "streak";

interface CelebrationAnimationProps {
  type: CelebrationType;
  trigger: boolean;
}

export function CelebrationAnimation({
  type,
  trigger,
}: CelebrationAnimationProps) {
  useEffect(() => {
    if (!trigger) return;

    switch (type) {
      case "lesson":
        // Small confetti for lesson completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        break;

      case "unit":
        // Big confetti for unit completion
        confetti({
          particleCount: 200,
          spread: 160,
          startVelocity: 45,
          origin: { y: 0.6 },
        });
        break;

      case "perfect": {
        // Fireworks for perfect score
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval);
            return;
          }

          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
          });
        }, 250);

        return () => clearInterval(interval);
      }

      case "streak":
        // Special streak celebration
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ["#ff6b6b", "#ffa500", "#ffd700"],
        });
        break;
    }
  }, [type, trigger]);

  return null;
}

// Utility function to trigger confetti manually
export function triggerCelebration(type: CelebrationType) {
  switch (type) {
    case "lesson":
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      break;

    case "unit":
      confetti({
        particleCount: 200,
        spread: 160,
        startVelocity: 45,
        origin: { y: 0.6 },
      });
      break;

    case "perfect": {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
        });
      }, 250);
      break;
    }

    case "streak":
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ["#ff6b6b", "#ffa500", "#ffd700"],
      });
      break;
  }
}
