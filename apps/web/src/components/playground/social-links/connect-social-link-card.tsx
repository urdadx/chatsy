import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { getApexDomain } from "@/lib/utils";
import { motion } from "framer-motion";

export const ConnectSocialCard = ({
  props,
}: {
  props: any;
}) => {
  const { name, url } = props;

  const apexDomain: string = getApexDomain(url);

  return (
    <motion.div className="flex flex-row w-[100px] h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 cursor-pointer space-y-2">
      <div className="flex flex-col items-center justify-center gap-1 text-sm w-full">
        <img
          src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
          alt="link-icon"
          className="w-8 h-8"
        />
        {name}
      </div>
    </motion.div>
  );
};
