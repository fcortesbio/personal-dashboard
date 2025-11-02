import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
