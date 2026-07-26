import React, { useState, useEffect } from 'react';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const totalScrollableDistance = documentHeight - windowHeight;
      if (totalScrollableDistance <= 0) {
        setProgress(0);
        return;
      }
      
      const currentProgress = (scrollPosition / totalScrollableDistance) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
      <div 
        className="h-full bg-primary-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
