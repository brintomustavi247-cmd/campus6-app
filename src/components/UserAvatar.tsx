import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface AvatarCrop { zoom: number; x: number; y: number; }
export const DEFAULT_CROP: AvatarCrop = { zoom: 100, x: 0, y: 0 };

interface UserAvatarProps {
  src?: string;
  size?: number;
  crop?: AvatarCrop;
  rounded?: 'full' | 'xl';
  ring?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src, size = 64, crop = DEFAULT_CROP, rounded = 'xl', ring, className = '',
}) => {
  const [err, setErr] = useState(false);

  return (
    <div
      className={`relative overflow-hidden shrink-0 ${className}`}
      style={{
        width: size, height: size,
        borderRadius: rounded === 'full' ? '9999px' : '0.75rem',
        border: ring ? `2px solid ${ring}` : 'none',
        background: 'linear-gradient(135deg,#1E202B,#151721)',
      }}
    >
      {err || !src ? (
        <div className="w-full h-full flex items-center justify-center">
          <User className="w-1/2 h-1/2" style={{ color: '#475569' }} />
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          onError={() => setErr(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `translate(${crop.x}%, ${crop.y}%) scale(${(crop.zoom || 100) / 100})`,
          }}
        />
      )}
    </div>
  );
};