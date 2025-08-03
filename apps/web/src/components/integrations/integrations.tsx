import { Button } from "@/components/ui/button";
import { IntegrationCard } from "./integration-card";
import { IntegrationIcon } from "./integration-icon";
import { WhatsAppDialog } from "./whatsapp-dialog";

const Integrations = () => {
  return (
    <div className="max-w-5xl mx-auto ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
        <WhatsAppDialog>
          <div className="bg-white rounded-md p-3 sm:p-4 border border-gray-200 shadow-sm w-full max-w-xs mx-auto h-full cursor-pointer ">
            <div className="flex flex-col gap-3 sm:gap-4 h-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <IntegrationIcon>
                    <img
                      src="https://img.icons8.com/color/48/whatsapp--v1.png"
                      alt="Whatsapp"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                  </IntegrationIcon>
                  <h3 className="font-medium text-sm sm:text-md">WhatsApp</h3>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm flex-grow">
                Connect your whatsapp account to your chatbot
              </p>
              <Button
                variant="outline"
                className="mt-1 sm:mt-2 w-fit rounded-lg text-sm"
              >
                Connect
              </Button>
            </div>
          </div>
        </WhatsAppDialog>

        <IntegrationCard
          icon={
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/fluency/48/instagram-new.png"
                alt="Instagram"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>
          }
          name="Instagram"
          description="Connect your Instagram account to your chatbot"
        />
        <IntegrationCard
          icon={
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/color/48/slack-new.png"
                alt="Slack"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>
          }
          name="Slack"
          description="Connect your slack account to your chabot"
        />

        <IntegrationCard
          icon={
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/color/48/facebook-messenger--v1.png"
                alt="Facebook Messenger"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>
          }
          name="Facebook Messenger"
          description="Connect your facebook messenger account to your chabot"
        />
        <IntegrationCard
          icon={
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/color/48/telegram-app--v1.png"
                alt="Telegram"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>
          }
          name="Telegram"
          description="Connect your telegram account to your chabot"
        />
      </div>
    </div>
  );
};

export default Integrations;
