'use client';

import React, { forwardRef } from 'react';
import { Device, deviceWidths } from '../../hooks/useAdminUI';

interface DevicePreviewProps {
  device: Device;
  currentPage: string;
}

export const DevicePreview = forwardRef<HTMLIFrameElement, DevicePreviewProps>(
  function DevicePreview({ device, currentPage }, ref) {
    // Usar el src inicial solo una vez; la navegación posterior va por postMessage (SPA) para evitar recargas dobles
    const [initialSrc] = React.useState(() => currentPage);

    return (
      <div className="flex-1 neuro-card p-4 flex flex-col">
        <div className="flex-1 iframe-container p-2 flex items-center justify-center">
          <div
            className="h-full bg-white rounded-lg overflow-hidden transition-all duration-300"
            style={{ width: deviceWidths[device] }}
          >
            <iframe
              ref={ref}
              src={initialSrc}
              className="w-full h-full border-0"
              title="Preview"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default DevicePreview;
