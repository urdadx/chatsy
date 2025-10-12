import { SolarFilterBoldDuotone } from "@/assets/icons/filter-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface ChatFilterDialogProps {
  currentFilter: "24h" | "7d" | "30d" | "90d" | "all";
  currentStatus: "all" | "unresolved" | "resolved" | "escalated";
  onApplyFilters: (filter: "24h" | "7d" | "30d" | "90d" | "all", status: "all" | "unresolved" | "resolved" | "escalated") => void;
}

export function ChatFilterDialog({
  currentFilter,
  currentStatus,
  onApplyFilters,
}: ChatFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState(currentFilter);
  const [tempStatus, setTempStatus] = useState(currentStatus);

  useEffect(() => {
    setTempFilter(currentFilter);
    setTempStatus(currentStatus);
  }, [currentFilter, currentStatus]);

  const handleTempFilterChange = (value: string) => {
    setTempFilter(value as "24h" | "7d" | "30d" | "90d" | "all");
  };

  const handleTempStatusChange = (value: string) => {
    setTempStatus(value as "all" | "unresolved" | "resolved" | "escalated");
  };

  const handleApply = () => {
    onApplyFilters(tempFilter, tempStatus);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-gray-600">
          <SolarFilterBoldDuotone width={24} className="h-6 w-6" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Filter chats</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="time-filter" className="text-sm font-medium">
              Time Period
            </label>
            <Select value={tempFilter} onValueChange={handleTempFilterChange}>
              <SelectTrigger className="w-full" id="time-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last month</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium">
              Status
            </label>
            <Select value={tempStatus} onValueChange={handleTempStatusChange}>
              <SelectTrigger className="w-full" id="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
