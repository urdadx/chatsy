import { Badge } from "@/components/ui/badge";
import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { getApexDomain } from "@/lib/utils";
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
            {isConnected ? (
              <Badge variant="outline" className="gap-1.5">
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                ></span>
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5">
                <span
                  className="size-1.5 rounded-full bg-gray-400"
                  aria-hidden="true"
                ></span>
                Inactive
              </Badge>
            )}
            <SocialCardOptions
              platform={platform}
              url={url}
              isConnected={isConnected}
              id={id}
            />
          </div>
        </div>
        <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
          {url}
        </span>
      </div>
    </>
  );
};
