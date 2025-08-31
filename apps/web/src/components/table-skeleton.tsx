import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
  return (
    <div className="w-full overflow-hidden border rounded-lg">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] md:w-[100px]">
              <Skeleton className="h-4 w-[60px] sm:w-[80px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-[60px] sm:w-[80px]" />
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <Skeleton className="h-4 w-[80px]" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Skeleton className="h-4 w-[80px]" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Skeleton className="h-4 w-[80px]" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Skeleton className="h-4 w-[80px]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Skeleton className="h-4 w-16 sm:w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16 sm:w-24" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
