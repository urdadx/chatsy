import { SearchQuestions } from "../search-questions";
import { AddIntegrations } from "./add-sources";

export const BotIntegrations = () => {
  return (
    <>
      <div className="w-full flex flex-col mt-5 gap-5">
        <div className="flex justify-between items-center w-full gap-3">
          <SearchQuestions />
          <AddIntegrations />
        </div>
      </div>
    </>
  );
};
