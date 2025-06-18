import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { getApexDomain } from "@/lib/utils";

export const ConnectSocialCard = ({
  props,
}: {
  props: any;
}) => {
  const { name, url, description } = props;

  const apexDomain: string = getApexDomain(url);

  return (
    <div className="flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 cursor-pointer space-y-2">
      <div className="flex items-center gap-1 text-sm">
        <img
          src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
          alt="link-icon"
          className="w-5 h-5"
        />{" "}
        {name}
      </div>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
};
