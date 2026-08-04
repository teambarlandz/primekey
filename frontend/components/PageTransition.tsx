'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    setTransitionStage('exit');
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionStage === 'enter'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-1'
      }`}
    >
      {displayChildren}
    </div>
  );
}
