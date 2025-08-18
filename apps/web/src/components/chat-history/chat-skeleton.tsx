import React from "react";
import { Skeleton } from "../ui/skeleton";

export const ChatSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <React.Fragment key={i}>
          {/* Human message - left aligned */}
          <div className="flex justify-start">
            <div className="max-w-[60%] space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-10 w-[280px]" />
                </div>
              </div>
            </div>
          </div>
          {/* AI message - right aligned */}
          <div className="flex justify-end">
            <div className="max-w-[60%] space-y-3">
              <div className="flex items-start space-x-3 flex-row-reverse">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-[280px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
