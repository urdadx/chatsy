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
import { Users } from "lucide-react";
import { NoDataPlaceholder } from "../no-data-placeholder";
import { Spinner } from "../ui/spinner";
import { MemberActions } from "./member-actions";

export function MembersTable() {
  const { data: organization, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => authClient.organization.getFullOrganization(),
  });

  const members = organization?.data?.members;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <NoDataPlaceholder
        icon={Users}
        title="No members found"
        description="Invite members to your workspace to get started."
      />
    );
  }

  return (
    <div>
      <Table>
        <TableHeader className="">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members?.map((member: any) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    size={40}
                    name={member.user.email}
                    colors={[
                      "#92A1C6",
                      "#146A7C",
                      "#F0AB3D",
                      "#C271B4",
                      "#C20D90",
                    ]}
                  />
                  <div>
                    <div className="font-medium">{member.user.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>
                <MemberActions member={member} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
