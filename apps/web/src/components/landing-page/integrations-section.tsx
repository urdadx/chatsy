import { GooglePaLM, MagicUI, Replit, WhatsappIcon } from "@/components/logos";
import { UserImage } from "../logo-image";

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="px-4 py-6 sm:py-14">
      <div className="bg-white dark:bg-background ">
        <div className="mx-auto flex flex-col md:flex-row px-4 md:px-6 md:grid md:max-w-6xl gap-6 md:gap-12">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-balance instrument-serif-regular-italic text-3xl md:text-3xl lg:text-4xl leading-normal font-semibold">
                Integrates with your{" "}
                <span className="text-purple-600 bg-purple-100 px-1 rounded relative inline-block z-1">
                  favorite platforms
                </span>{" "}
              </h2>
              <p className="text-muted-foreground text-lg">
                Connect seamlessly with popular platforms and services to
                enhance your workflow.
              </p>
            </div>
          </div>

          <div className="flex p-0 max-w-full md:max-w-lg mx-auto justify-center w-full">
            <div className="[mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] sm:mx-auto sm:max-w-md md:-mx-6 md:ml-auto md:mr-0">
              <div className="bg-background dark:bg-muted/50 rounded-2xl border p-3 shadow-lg ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Integration
                    icon={<WhatsappIcon />}
                    name="WhatsApp"
                    description="Automate support via WhatsApp"
                  />
                  <Integration
                    icon={<Replit />}
                    name="Messenger"
                    description="Integrate with messenger to automate and optimize your support."
                  />
                  <Integration
                    icon={<GooglePaLM />}
                    name="Telegram"
                    description="Enhance Telegram chats with intelligent AI-powered responses."
                  />
                  <Integration
                    icon={<MagicUI />}
                    name="Google Calendar"
                    description="Streamline scheduling and meetings with smart automation."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className="text-yellow-400 w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.75l-6.172 3.245 1.179-6.88L2 9.755l6.914-1.005L12 2.25l3.086 6.5L22 9.755l-5.007 4.36 1.179 6.88z" />
                </svg>
              ))}
            </div>

            <div className="grid grid-rows-[auto_1fr] gap-3 w-full max-w-lg justify-items-center text-center">
              <blockquote className="w-full">
                <p>
                  We use Padyna to power our customer support, and it has
                  transformed how we interact with our clients.
                </p>
              </blockquote>
              <div className="bg-background flex w-[50px] h-[50px] items-center justify-center rounded-full overflow-hidden border border-primary">
                <UserImage
                  width={50}
                  height={50}
                  alt="Alfred Kissiedu"
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 flex flex-col md:flex-row gap-2 text-sm justify-center items-center">
                <cite>Alfred Kissiedu,</cite>
                <p className="text-muted-foreground">RedPear Communications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Integration = ({
  icon,
  name,
  description,
}: { icon: React.ReactNode; name: string; description: string }) => {
  return (
    <div className="hover:bg-muted dark:hover:bg-muted/50 space-y-4 rounded-lg border p-4 transition-colors">
      <div className="flex size-fit items-center justify-center">{icon}</div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-muted-foreground line-clamp-1 text-sm md:line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
