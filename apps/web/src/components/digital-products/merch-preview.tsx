import { motion } from "framer-motion";

interface MerchPreviewProps {
  url: string;
  title: string;
  imagePreview: string | null;
  price: string;
}

export const MerchPreview = ({
  url,
  title,
  imagePreview,
  price,
}: MerchPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border shadow-sm p-4 h-fit"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>

      <div className="space-y-3">
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xl">📷</span>
                </div>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">
            {title || "Product Name"}
          </h4>

          {price && (
            <p className="text-lg font-bold text-purple-600">${price}</p>
          )}

          {url && <p className="text-xs text-gray-500 truncate">{url}</p>}
        </div>
      </div>
    </motion.div>
  );
};
