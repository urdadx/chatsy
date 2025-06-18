import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArchiveIcon,
  Edit,
  EllipsisVertical,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useState } from "react";

type ProductCardProps = {
  id: string;
  featured: boolean;
  name: string;
  image: string;
  url: string;
};

export const ProductCardOptions = ({
  id,
  featured,
  name,
  image,
  url,
}: ProductCardProps) => {
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [archiveProduct, setArchiveProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(false);

  const handleDeleteProduct = () => {
    setDeleteProduct(true);
  };

  const handleArchiveProduct = () => {
    setArchiveProduct(true);
  };

  const handleEditProduct = () => {
    setEditProduct(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 p-1"
          >
            <EllipsisVertical size={20} className="text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditProduct}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchiveProduct}>
            <ArchiveIcon className="mr-2 h-4 w-4" />
            {featured ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteProduct}
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
