import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWalletList, useWallet } from '@meshsdk/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Wallet, 
  GraduationCap, 
  Heart, 
  Home, 
  FolderOpen, 
  BarChart3, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, connectWallet, disconnectWallet, isLoading } = useAuth();
  const { connected } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, protected: true },
    { name: 'Profile', href: '/profile', icon: User, protected: true },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleWalletAction = async () => {
    if (connected && isAuthenticated) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const getWalletButtonText = () => {
    if (isLoading) return 'Connecting...';
    if (connected && isAuthenticated) return 'Disconnect';
    return 'Connect Wallet';
  };

  const getWalletButtonIcon = () => {
    if (connected && isAuthenticated) return <LogOut className="h-4 w-4" />;
    return <Wallet className="h-4 w-4" />;
  };

  function WalletConnect() {
    const wallets = useWalletList();
    const { connect, connected, wallet, disconnect } = useWallet();

    if (!connected) {
      return (
        <div className="flex gap-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => {
                console.log('Connect button clicked for', w.name);
                connect(w.name);
              }}
              className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
            >
              Connect {w.name}
            </button>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-600 text-sm">Connected: {wallet?.name}</span>
        <button
          onClick={disconnect}
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EduFund</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    {user.role === 'student' ? (
                      <GraduationCap className="h-4 w-4 text-green-600" />
                    ) : (
                      <Heart className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{user.displayName}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="capitalize">{user.role}</span>
                </div>
              )}
              <div className="hidden md:flex">
                <WalletConnect />
              </div>
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile wallet section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated && user && (
                  <div className="px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      {user.role === 'student' ? (
                        <GraduationCap className="h-4 w-4 text-green-600" />
                      ) : (
                        <Heart className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{user.displayName}</span>
                    </div>
                    <span className="capitalize text-gray-500">{user.role}</span>
                  </div>
                )}
                <div className="w-full mt-2">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EduFund</span>
              </div>
              <p className="text-gray-600 max-w-md">
                Empowering Sri Lankan students through global donations on the Cardano blockchain. 
                Connect your wallet to start making a difference.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Platform
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/projects" className="text-gray-600 hover:text-blue-600 text-sm">
                    Browse Projects
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-blue-600 text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 EduFund. Built on Cardano blockchain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 