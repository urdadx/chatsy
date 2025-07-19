import { useSession } from "@/lib/auth-client";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProfileDelete } from "./profile-delete";

export function AccountSettings() {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <div className="w-full mx-auto pt-4 space-y-6">
      <div className="flex items-center gap-3 ">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={user?.image || ""} alt="User avatar" />
          <AvatarFallback>
            <User className="h-5 w-5 text-gray-600" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-900">
          You are currently signed in as{" "}
          <span className="text-primary ">{user?.email}</span>
        </span>
      </div>
      <ProfileDelete />
    </div>
  );
}
