import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveIcon, Edit, EllipsisVertical, Trash } from "lucide-react";
import { useState } from "react";
import { ArchiveProduct } from "./archive-product";
import { DeleteProduct } from "./delete-product";
import { EditProduct } from "./edit-product";

export const ProductCardOptions = ({ product }: any) => {
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
      <DeleteProduct
        id={product.id}
        open={deleteProduct}
        onOpenChange={setDeleteProduct}
      />
      <ArchiveProduct
        featured={product.featured}
        id={product.id}
        open={archiveProduct}
        onOpenChange={setArchiveProduct}
      />
      <EditProduct
        product={product}
        open={editProduct}
        onOpenChange={setEditProduct}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
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
            {!product.featured ? "Unarchive" : "Archive"}
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
