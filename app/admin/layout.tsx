import React from 'react';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#e0e0e0]">
      {children}
    </div>
  );
}
