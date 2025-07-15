interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  badgeText?: string;
}

export const ActionCard = ({
  icon,
  name,
  description,
  badgeText,
}: IntegrationCardProps) => {
  return (
    <div className="bg-white rounded-md p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-xs mx-auto h-full">
      <div className="flex flex-col gap-3 sm:gap-4 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-sm sm:text-md">{name}</h3>
          </div>
          {badgeText && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 sm:py-1 rounded-lg font-medium">
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-xs sm:text-sm flex-grow">
          {description}
        </p>
      </div>
    </div>
  );
};
