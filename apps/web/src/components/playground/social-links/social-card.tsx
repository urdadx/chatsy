import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { getApexDomain, getBaseUrl } from "@/lib/utils";
import { BarChart } from "lucide-react";
import { SocialCardOptions } from "./social-card-options";

export const SocialCard = ({
  props,
}: {
  props: any;
}) => {
  const { id, platform, url, isConnected } = props;

  const apexDomain: string = getApexDomain(url);

  return (
    <>
      <div className="flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <img
              src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
              alt="link-icon"
              className="w-5 h-5"
            />{" "}
            {platform}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1 cursor-pointer rounded-sm bg-gray-100 px-2 py-0.5 transition-all duration-75 active:scale-100 border">
              <BarChart color="grey" size={15} className="w-4 h-4" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                2
              </span>
              <span className="hidden md:inline-block text-xs sm:text-sm text-muted-foreground">
                clicks
              </span>
            </div>
            <SocialCardOptions
              platform={platform}
              url={url}
              isConnected={isConnected}
              id={id}
            />
          </div>
        </div>
        <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
          {getBaseUrl(url)}
        </span>
      </div>
    </>
  );
};
