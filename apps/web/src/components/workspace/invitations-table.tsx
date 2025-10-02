import { SolarLetterBoldDuotone } from "@/assets/icons/letter";
import { Badge } from "@/components/ui/badge";
import { SafeBoringAvatar } from "@/components/ui/safe-boring-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { NoDataPlaceholder } from "../no-data-placeholder";
import Spinner from "../ui/spinner";
import { InvitationActions } from "./invitation-actions";

export function InvitationsTable() {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => authClient.organization.listInvitations(),
  });

  const getStatusBadgeClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-300";
      case "expired":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!invitations?.data || invitations.data.length === 0) {
    return (
      <NoDataPlaceholder
        icon={SolarLetterBoldDuotone}
        title="No Invitations found"
        description="You have not sent any invitations yet."
      />
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations?.data?.map((invitation: any) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <SafeBoringAvatar size={40} name={invitation.email} />
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{invitation.role}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClassName(invitation.status)}
                >
                  {invitation.status}
                </Badge>
              </TableCell>
              <TableCell>
                <InvitationActions invitation={invitation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
