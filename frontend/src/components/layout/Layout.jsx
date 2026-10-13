import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 overflow-x-hidden w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
