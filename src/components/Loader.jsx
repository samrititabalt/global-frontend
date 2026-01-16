import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

const Loader = ({ size = 'md', text, fullScreen = false, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const loader = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LoaderIcon className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;

