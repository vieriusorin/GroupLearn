"use client";

import { useRouter } from "next/navigation";
import { LessonErrorState } from "./LessonErrorState";

type Props = {
  title: string;
  message: string;
};

export function LessonErrorClient({ title, message }: Props) {
  const router = useRouter();

  const handleExit = () => {
    router.push("/");
  };

  return (
    <LessonErrorState title={title} message={message} onExit={handleExit} />
  );
}
