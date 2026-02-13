
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-plane-departure text-blue-400 text-2xl"></i>
            <span className="text-xl font-bold tracking-tight">SkyWay <span className="text-blue-400">Explorer</span></span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#" className="hover:text-blue-400 transition-colors">Find Airport</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Services</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Flight Tools</a>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-100 border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 SkyWay Explorer. Powered by Gemini AI Intelligence.</p>
      </footer>
    </div>
  );
};

export default Layout;
