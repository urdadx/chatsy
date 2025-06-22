import { ShoppingCart } from "lucide-react";
import type { CSSProperties, PropsWithChildren } from "react";

export function NoProductPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-lg px-4 py-4">
      <div className="animate-fade-in h-36 w-full max-w-64 overflow-hidden px-4 [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]">
        <div
          style={{ "--scroll": "-50%" } as CSSProperties}
          className="animate-infinite-scroll-y flex flex-col [animation-duration:10s]"
        >
          {[...Array(6)].map((_, idx) => (
            <Card key={idx}>
              <CardContent />
              <ShoppingCart className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </Card>
          ))}
        </div>
      </div>
      <div className="max-w-sm text-pretty text-center">
        <span className="text-base font-medium text-neutral-900">
          No products found
        </span>
        <p className="mt-2 text-pretty text-md text-neutral-500">
          Click on the button above to add your first product
        </p>
      </div>
    </div>
  );
}

function Card({ children }: PropsWithChildren) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_4px_12px_0_#0000000D]">
      {children}
    </div>
  );
}

function CardContent() {
  return (
    <div className="flex flex-col w-full">
      <div className="h-4 w-20 bg-gray-200 rounded-md mb-2" />
      <div className="h-3 w-full bg-gray-100 rounded-md" />
    </div>
  );
}
