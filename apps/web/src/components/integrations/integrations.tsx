import { IntegrationCard } from "./integration-card";
import { IntegrationIcon } from "./integration-icon";

const Integrations = () => {
  return (
    <div className="max-w-5xl mx-auto ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
        <IntegrationCard
          icon={
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/color/48/whatsapp--v1.png"
                alt="Whatsapp"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>
          }
          name="WhatsApp"
          description="Connect your whatsapp account to your chatbot"
        />

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
