import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { cn, getApexDomain } from "@/lib/utils";
import type { CSSProperties } from "react";

const NAMES = [
  {
    name: "WhatsApp",
    status: "Connected",
    website: "https://whatsapp.com",
  },
  {
    name: "Telegram",
    status: "Connected",
    website: "https://web.telegram.org",
  },
  {
    name: " Cal",
    status: "Connected",
    website: "https://cal.com",
  },
];

export function IntegrationLinks() {
  return (
    <div className="flex size-full flex-col justify-center" aria-hidden>
      <div className="flex flex-col gap-2.5 [mask-image:linear-gradient(90deg,black_70%,transparent)]">
        {NAMES.map(({ name, status, website }, idx) => (
          <div
            key={name}
            className="transition-transform duration-300 hover:translate-x-[-2%]"
          >
            <div
              className={cn(
                "flex cursor-default items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
                "ml-[calc((var(--idx)+1)*5%)]",
              )}
              style={{ "--idx": idx } as CSSProperties}
            >
              <div className="flex-none rounded-full border border-neutral-200 bg-gradient-to-t from-neutral-100 p-2">
                <img
                  src={`${GOOGLE_FAVICON_URL}${getApexDomain(website)}`}
                  alt="link-icon"
                  width={24}
                  height={24}
                  className="w-[30px] h-full rounded-full"
                />
              </div>

              <span className="text-base font-medium text-neutral-900">
                {name}
              </span>

              <div className="ml-2 flex items-center gap-x-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-[0.2rem]">
                <div className="h-2 rounded-full w-2 bg-green-400" />
                <div className="flex items-center whitespace-nowrap text-sm text-neutral-500">
                  {status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
