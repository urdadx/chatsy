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
import Avatar from "boring-avatars";
import { Mail } from "lucide-react";
import { NoDataPlaceholder } from "../no-data-placeholder";
import { Spinner } from "../ui/spinner";
import { InvitationActions } from "./invitation-actions";

export function InvitationsTable() {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => authClient.organization.listInvitations(),
  });

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
        icon={Mail}
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
                  <Avatar
                    size={40}
                    name={invitation.email}
                    colors={[
                      "#92A1C6",
                      "#146A7C",
                      "#F0AB3D",
                      "#C271B4",
                      "#C20D90",
                    ]}
                  />
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{invitation.role}</TableCell>
              <TableCell>{invitation.status}</TableCell>
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
