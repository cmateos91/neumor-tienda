'use client';

import { useRestaurant } from '@/lib/store-context';

export function DebugBadge() {
  const { config } = useRestaurant();
  const slug = process.env.NEXT_PUBLIC_SITIO_SLUG;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg text-xs font-mono shadow-lg">
      <div>ENV SLUG: <span className="text-green-400">{slug || 'undefined'}</span></div>
      <div>SITIO: <span className="text-blue-400">{config?.nombre || 'Loading...'}</span></div>
    </div>
  );
}
