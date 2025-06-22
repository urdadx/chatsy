import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveIcon, Edit, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { ArchiveLink } from "./archive-link";
import { DeleteLink } from "./delete-link";
import { EditSocialLink } from "./edit-link";

type SocialCardOptionsProps = {
  id: string;
  isConnected: boolean;
  platform: string;
  url: string;
};

export const SocialCardOptions = ({
  id,
  isConnected,
  platform,
  url,
}: SocialCardOptionsProps) => {
  const [deleteLink, setDeleteLink] = useState(false);
  const [archiveLink, setArchiveLink] = useState(false);
  const [editLink, setEditLink] = useState(false);

  const handleDeleteLink = () => {
    setDeleteLink(true);
  };

  const handleArchiveLink = () => {
    setArchiveLink(true);
  };

  const handleEditLink = () => {
    setEditLink(true);
  };

  return (
    <>
      <DeleteLink id={id} open={deleteLink} onOpenChange={setDeleteLink} />
      <ArchiveLink
        isConnected={isConnected}
        id={id}
        open={archiveLink}
        onOpenChange={setArchiveLink}
      />
      <EditSocialLink
        id={id}
        platform={platform}
        url={url}
        open={editLink}
        onOpenChange={setEditLink}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditLink}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchiveLink}>
            <ArchiveIcon className="mr-2 h-4 w-4" />
            {isConnected ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteLink}
            className="text-destructive hover:text-red-400"
          >
            <Trash className="mr-2 h-4 w-4 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
