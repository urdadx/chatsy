import { NoLinksPlaceholder } from "@/components/no-links-placeholder";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SearchQuestions } from "../search-questions";
import { AddSocialLink } from "./add-social-link";
import { SocialCard } from "./social-card";

export const SocialLinks = () => {
  const {
    data: links,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await api.get("/my-links");
      return res.data.links;
    },
  });

  return (
    <>
      <div className="w-full flex flex-col mt-5 gap-5">
        <div className="flex justify-between items-center w-full gap-3">
          <SearchQuestions />
          <AddSocialLink />
        </div>
        <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isError && (
            <div className="flex flex-row justify-center items-center h-24">
              <span className="text-red-500">Failed to load questions</span>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="col-span-2 flex justify-center">
              <Spinner className="text-primary" />
            </div>
          )}
          {links?.map((platform: any) => (
            <SocialCard key={platform.id} props={platform} />
          ))}
        </div>
        {links?.length === 0 && <NoLinksPlaceholder />}
      </div>
    </>
  );
};
