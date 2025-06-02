export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatLastActivity = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Active now';
  if (minutes < 60) return `Active ${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return `Active ${days} days ago`;
};
