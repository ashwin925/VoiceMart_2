'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
  ];

  return (
    <nav className="navbar border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex-shrink-0 group">
              <h1 className="text-2xl font-bold text-white">
                Voice<span className="text-blue-400 group-hover:text-blue-300 transition-colors">Mart</span> 
                <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg margin-left-sm">Admin</span>
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="hidden sm:flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
            >
              <span>🏪</span>
              <span>View Store</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden margin-top border-t border-gray-700 pt-4 animate-slideDown">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <span>🏪</span>
                <span>View Store</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}