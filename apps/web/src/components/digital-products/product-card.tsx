import { ProductCardOptions } from "./product-card-options";

export const ProductCard = ({ product }: any) => {
  const { name, price, image, url } = product;

  return (
    <div className="p-2 group flex gap-4 w-full overflow-hidden rounded-xl border border-gray-200">
      <div className="h-24 w-28 relative overflow-hidden flex-shrink-0">
        <img
          src={image || "https://via.placeholder.com/150"}
          alt="Product thumbnail"
          className="h-full w-full object-cover rounded-md"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground truncate">
                {url ? new URL(url).hostname : "No URL"}
              </p>
              <h3 className="text-base leading-snug line-clamp-2">{name}</h3>

              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-600">${price}</span>
              </div>
            </div>
            <ProductCardOptions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};
