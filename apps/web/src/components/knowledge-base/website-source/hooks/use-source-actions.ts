import { useState } from "react";

export const useSourceActions = () => {
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeletingSourceId(id);
    setIsDeleteDialogOpen(true);
  };

  return {
    deletingSourceId,
    isDeleteDialogOpen,
    handleDeleteClick,
    setIsDeleteDialogOpen,
  };
};
