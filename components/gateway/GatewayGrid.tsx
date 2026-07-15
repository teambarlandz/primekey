import { ReactNode } from 'react';

interface GatewayGridProps {
  children: ReactNode;
}

export function GatewayGrid({ children }: GatewayGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto w-full">
      {children}
    </div>
  );
}