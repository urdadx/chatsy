import EmptySpace from "@/assets/svgs/empty-state-light.svg";

export const NoDataPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <img alt="Empty Thread" width="150" height="150" src={EmptySpace}></img>
      <div className="mt-5">
        <p className="text-lg">It's empty here</p>
        <p className="text-md text-muted-foreground dark:text-white/50">
          Click on the button above to add a new Q&A
        </p>
      </div>
    </div>
  );
};
