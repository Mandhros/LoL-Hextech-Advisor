/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Shield, Swords, Zap } from 'lucide-react';

interface LoLImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackIcon?: 'rune' | 'item' | 'champion';
}

export const LoLImage: React.FC<LoLImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  fallbackIcon = 'item',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div 
        className={`bg-[#0d1626] border border-slate-700/60 rounded flex flex-col items-center justify-center p-1 text-center select-none ${className}`}
        title={alt || fallbackText}
      >
        {fallbackIcon === 'rune' ? (
          <Sparkles className="w-4 h-4 text-[#C8AA6E] opacity-75" />
        ) : fallbackIcon === 'champion' ? (
          <Shield className="w-5 h-5 text-[#0AC8B9] opacity-75" />
        ) : (
          <Swords className="w-4 h-4 text-amber-400 opacity-75" />
        )}
        {fallbackText && (
          <span className="text-[8px] font-mono font-bold text-slate-300 truncate max-w-full px-0.5 mt-0.5">
            {fallbackText.slice(0, 4)}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      loading="lazy"
      {...rest}
    />
  );
};
