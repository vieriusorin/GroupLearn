type Props = {
  hasError?: boolean;
};

export const MyGroupsHeader = ({ hasError }: Props) => {
  return (
    <div>
      <h1 className="text-3xl font-bold">My Learning Groups</h1>
      <p className="text-muted-foreground mt-1">
        Access learning paths shared with your groups
      </p>
      {hasError && (
        <p className="mt-2 text-sm text-destructive">
          Failed to load your groups. Please refresh and try again.
        </p>
      )}
    </div>
  );
};
