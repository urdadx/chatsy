import WhatsappLogo from "@/assets/whatsapp.png"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const WhatsappIntegrationCard = () => {

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-md mx-auto h-full">
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img className="size-9" src={WhatsappLogo} alt="integration-icon" />
            </div>
            {/* show this when connected */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">

                Coming soon
              </Badge>
            </div>
            {/* <Button className="w-fit rounded-sm" variant="outline">
              Connect
            </Button> */}
          </div>
          <h3 className="font-medium text-sm sm:text-md">WhatsApp</h3>
          <p className="text-gray-600 text-xs sm:text-sm flex-grow">
            Connect your bot to WhatsApp to engage with your customers directly.
          </p>
          <Button className="w-fit rounded-sm" variant="outline" disabled>
            Connect
          </Button>

        </div>


      </div>
    </>
  )
}