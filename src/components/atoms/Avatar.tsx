import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  color?: string; // Optional - will generate random color if not provided
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string; // Custom initials to display when no image
  onClick?: () => void; // Click handler for editing
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, color, size = 'md', initials, onClick }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  // Generate random color based on alt field if no color provided
  const getRandomColor = (text: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-fuchsia-500',
      'bg-sky-500',
    ];

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = color || getRandomColor(alt);

  const getDisplayText = () => {
    if (initials) return initials;
    // Fallback to generating initials from alt text
    const words = alt.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return alt.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${avatarColor} relative ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{getDisplayText()}</span>
      )}
    </div>
  );
};

export default Avatar;
