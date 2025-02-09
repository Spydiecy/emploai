'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Power } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

interface MenuItems {
  name: string;
  href: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, isWrongNetwork, connectWallet, disconnectWallet, switchToFlowNetwork } = useWeb3();

  const menuItems: MenuItems[] = [
    { name: 'Hire', href: '/marketplace' },
    { name: 'EmploAies', href: '/agents' },
    { name: 'Feed', href: '/feed' },
    { name: 'Create', href: '/create' },
    { name: 'Request', href: '/request' },
  ];

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm border-b border-black/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Emplo<span className="text-black">AI</span>
          </Link>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-black/80 hover:text-black transition-colors duration-300 group"
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-black transform scale-x-0 origin-left 
                               transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          {account ? (
            <div className="flex items-center gap-4">
              {isWrongNetwork ? (
                <button
                  onClick={switchToFlowNetwork}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Switch to Flow Network
                </button>
              ) : (
                <button
                  onClick={disconnectWallet}
                  className="relative px-6 py-2 border-2 border-black text-black font-medium 
                           transition-all duration-500 group overflow-hidden flex items-center gap-2"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    {formatAddress(account)}
                  </span>
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                    <Power className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-black transform -translate-x-full 
                              transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="relative px-6 py-2 border-2 border-black text-black font-medium 
                       transition-all duration-500 group overflow-hidden flex items-center gap-2"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                Connect Wallet
              </span>
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                <ChevronRight className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 bg-black transform -translate-x-full 
                          transition-transform duration-500 ease-out group-hover:translate-x-0" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-black/80 hover:text-black"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;