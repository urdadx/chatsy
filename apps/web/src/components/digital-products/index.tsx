import { SearchQuestions } from "../playground/search-questions";
import { AddDigitalProduct } from "./add-digital-product";
import { ProductCard } from "./product-card";

export const DigitalProducts = () => {
  return (
    <div className="w-full flex flex-col mt-5 gap-5">
      <div className="flex justify-between items-center w-full gap-3">
        <SearchQuestions />
        <AddDigitalProduct />
      </div>
      <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCard key={index} />
        ))}
      </div>
    </div>
  );
};
