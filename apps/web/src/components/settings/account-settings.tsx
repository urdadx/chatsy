import { Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function AccountSettings() {
  return (
    <div className="w-full mx-auto pt-1 space-y-6">
      {/* Current Plan */}
      <div className="flex items-center gap-3 ">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage
            src="https://avatars.githubusercontent.com/u/70736338?v=4"
            alt="User avatar"
          />
          <AvatarFallback>
            <User className="h-5 w-5 text-gray-600" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-900">
          You are currently signed in as{" "}
          <span className="text-primary ">jackmaaye@gmail.com</span>
        </span>
      </div>
      <Separator className="my-3" />

      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-md font-semibold text-gray-900">
            Deactivate account
          </h2>
          <p className="text-sm text-gray-600">
            Deactivating your account will remove all your data
          </p>
        </div>
        <Button className="text-white bg-red-300 hover:bg-red-500 focus:ring-red-500 focus:ring-offset-red-200">
          <Trash2 className="h-4 w-4 " />
          Deactivate account
        </Button>
      </div>
    </div>
  );
}
