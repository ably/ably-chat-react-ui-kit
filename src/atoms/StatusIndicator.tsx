import React from 'react';

interface StatusIndicatorProps {
  status: string;
  statusMap: Record<string, { text: string; color: string }>;
  className?: string;
}

export function StatusIndicator({ status, statusMap, className = '' }: StatusIndicatorProps) {
  const statusInfo = statusMap[status];

  if (!statusInfo) return null;

  return (
    <div className={`status-container ${className}`}>
      <span className="status-label">Status:</span>
      <span className={statusInfo.color}>{statusInfo.text}</span>
    </div>
  );
}
