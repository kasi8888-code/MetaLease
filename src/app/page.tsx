'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Clock, Sparkles, TrendingUp, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
const features = [
  {
    icon: Shield,
    title: 'Secure & Trustless',
    description: 'Smart contracts ensure NFT owners never lose custody while enabling safe rentals.',
    gradient: 'from-emerald-400 to-cyan-400',
  },
  {
    icon: Clock,
    title: 'Flexible Duration',
    description: 'Rent NFTs hourly or daily based on your needs - perfect for events, gaming, or exhibitions.',
    gradient: 'from-blue-400 to-purple-400',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Automatic smart contract execution means instant NFT access upon payment.',
    gradient: 'from-orange-400 to-rose-400',
  },
];

const stats = [
  { label: 'Total NFTs Listed', value: '10K+', icon: Sparkles },
  { label: 'Active Renters', value: '2.5K+', icon: Users },
  { label: 'Revenue Generated', value: '$50K+', icon: TrendingUp },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Rent NFTs
              </span>
              <br />
              <span className="text-gray-900">Like Never Before</span>
            </motion.h1>
            
            <motion.p
              className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The first decentralized marketplace for NFT rentals. Lend your digital assets safely or borrow them for events, gaming, and exhibitions. All powered by smart contracts on Ethereum.
            </motion.p>

            <motion.div
              className="mt-10 flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/marketplace"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl hover:scale-105"
              >
                Explore Marketplace
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-105"
              >
                Create NFT
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating NFT Cards Animation */}
          <motion.div
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg opacity-20"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg opacity-30"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -10, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-20 h-20 bg-gradient-to-r from-orange-400 to-rose-400 rounded-lg opacity-15"
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 15, 0],
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/50 backdrop-blur-sm border-y border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-lg text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MetaLease
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of NFT utility with our innovative rental platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl border border-gray-100"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to revolutionize your NFT experience?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of creators and collectors already using MetaLease
            </p>
            
            <motion.div
              className="mt-8"
              whileHover={{ scale: 1.05 }}
            >
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">MetaLease</span>
            </div>
            <p className="text-gray-400">
              Decentralized NFT rental marketplace powered by Ethereum
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Built with ❤️ for the Web3 community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
