import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const LoadingAnnouncer = ({ children }: Props) => {
  return (
    <div aria-live="polite" className="sr-only">
      {children}
    </div>
  );
};
