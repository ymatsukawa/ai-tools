import React from 'react';

interface BackgroundProps {
  currentBackgroundImage?: string;
}

export function Background({ currentBackgroundImage }: BackgroundProps) {
  if (!currentBackgroundImage) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-white/75 dark:bg-black/50 z-10" />
    </>
  );
}