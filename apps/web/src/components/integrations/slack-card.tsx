import SlackIcon from "@/assets/slack.png"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const SlackCard = () => {

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-md mx-auto h-full">
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img className="size-9" src={SlackIcon} alt="integration-icon" />
            </div>
            {/* show this when connected */}
            {/* <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <span
                  className="size-2 rounded-full bg-green-500"
                ></span>
                Not connected
              </Badge>
            </div> */}

          </div>
          <h3 className="font-medium text-sm sm:text-md">Slack</h3>
          <p className="text-gray-600 text-xs sm:text-sm flex-grow">
            Send notifications to your Slack channel about important events and updates.
          </p>
          <Button className="w-fit rounded-sm" variant="outline">
            Connect
          </Button>

        </div>


      </div>
    </>
  )
}