'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset.hydrated = 'true';
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
