import React from 'react';

interface StatusIndicatorProps {
  status: string;
  statusMap: Record<string, { text: string; color: string }>;
  className?: string;
}

export function StatusIndicator({ status, statusMap, className = '' }: StatusIndicatorProps) {
  const statusInfo = statusMap[status];

  if (!statusInfo) return null;

  // Map color classes to DaisyUI badge colors
  const getBadgeColor = (color: string) => {
    switch (color.toLowerCase()) {
      case 'green':
        return 'badge-success';
      case 'red':
        return 'badge-error';
      case 'yellow':
        return 'badge-warning';
      case 'blue':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">Status:</span>
      <span className={`badge ${getBadgeColor(statusInfo.color)}`}>{statusInfo.text}</span>
    </div>
  );
}
