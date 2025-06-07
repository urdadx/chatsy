export const ChatLogItem = ({ title, description, timeAgo }: any) => {
  return (
    <div className="flex items-start w-full  space-x-3 p-4 hover:bg-gray-50 border-b border-gray-100 group">
      <div className="flex-shrink-0 border-2 rounded-full border-primary">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${title}`}
          alt="Avatar"
          className="w-8 h-8 rounded-full "
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{description}</p>
      </div>

      <div className="flex items-center space-x-3 text-xs text-gray-400">
        <span>{timeAgo}</span>
      </div>
    </div>
  );
};
