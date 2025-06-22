import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { NoProductPlaceholder } from "../no-product-placeholder";
import { SearchQuestions } from "../playground/search-questions";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { AddDigitalProduct } from "./add-digital-product";
import { ProductCard } from "./product-card";

export const DigitalProducts = () => {
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ["my-products"],
    queryFn: async () => {
      const res = await api.get("/my-products");
      return res.data;
    },
  });

  return (
    <div className="w-full flex flex-col mt-5 gap-5">
      <div className="flex justify-between items-center w-full gap-3">
        <SearchQuestions />
        <AddDigitalProduct />
      </div>
      <div className="w-full py-6 grid grid-rows-1 sm:grid-rows-2 gap-4">
        {isError && (
          <div className="flex justify-center items-center h-24">
            <span className="text-red-500">Failed to load questions</span>
            <Button onClick={() => refetch()} className="ml-4">
              Retry
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="col-span-2 flex justify-center">
            <Spinner className="text-primary" />
          </div>
        ) : (
          data?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
        {data?.length === 0 && <NoProductPlaceholder />}
      </div>
    </div>
  );
};
