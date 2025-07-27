export const truncateUrl = (url: string, maxLength = 50): string => {
  if (url.length <= maxLength) return url;

  const cleanUrl = url.replace(/^https?:\/\//, "");

  if (cleanUrl.length <= maxLength) return cleanUrl;

  return `${cleanUrl.substring(0, maxLength - 3)}...`;
};

export const filterSources = (sources: any[], searchTerm: string) => {
  return sources.filter((source) =>
    source.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};
