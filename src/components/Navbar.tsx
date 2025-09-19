'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Home, 
  Plus, 
  User, 
  Grid3x3, 
  Menu, 
  X, 
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: Grid3x3 },
  { name: 'Create NFT', href: '/create', icon: Plus },
  { name: 'Dashboard', href: '/dashboard', icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-primary opacity-20 blur-sm rounded-2xl group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold text-gradient">MetaLease</span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>Secured by Ethereum</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 group
                        ${isActive
                          ? 'text-white bg-gradient-primary shadow-md'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-primary -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Stats Indicator */}
            <motion.div 
              className="hidden lg:flex items-center space-x-4 text-xs text-gray-500 bg-white/30 rounded-full px-4 py-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>$50K+ Volume</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="flex items-center space-x-1">
                <Grid3x3 className="h-3 w-3 text-blue-500" />
                <span>10K+ NFTs</span>
              </div>
            </motion.div>

            {/* Connect Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ConnectButton 
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div 
        className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0, 
          height: mobileMenuOpen ? 'auto' : 0 
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass border-t border-white/20 px-4 pt-4 pb-6 space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center space-x-3
                    ${isActive
                      ? 'text-white bg-gradient-primary shadow-md'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
          
          {/* Mobile Stats */}
          <motion.div 
            className="pt-4 border-t border-white/20 flex justify-center space-x-6 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>$50K+ Volume</span>
            </div>
            <div className="flex items-center space-x-1">
              <Grid3x3 className="h-3 w-3 text-blue-500" />
              <span>10K+ NFTs</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
}