'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Play,
  Star,
  ArrowUpRight,
  Activity,
  Award,
  Plus
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: Shield,
    title: 'Secure & Trustless',
    description: 'Smart contracts ensure NFT owners never lose custody while enabling safe rentals.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Clock,
    title: 'Flexible Duration',
    description: 'Rent NFTs hourly or daily based on your needs - perfect for events, gaming, or exhibitions.',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Automatic smart contract execution means instant NFT access upon payment.',
    gradient: 'from-orange-500 to-pink-500',
  },
];

const stats = [
  { label: 'Total NFTs Listed', value: '10K+', icon: Sparkles },
  { label: 'Active Renters', value: '2.5K+', icon: Users },
  { label: 'Revenue Generated', value: '$50K+', icon: TrendingUp },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "NFT Creator",
    content: "MetaLease transformed my NFTs into passive income streams. The platform is incredibly secure and user-friendly."
  },
  {
    name: "Sarah Kim",
    role: "Digital Artist", 
    content: "I've earned over 5 ETH from rentals in just 2 months. The smart contract security gives me complete peace of mind."
  },
  {
    name: "Marcus Rivera",
    role: "GameFi Collector",
    content: "Perfect for accessing gaming NFTs without buying them. I can rent what I need for tournaments and events."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center rounded-full bg-white/80 px-6 py-2 text-sm font-semibold text-blue-600 shadow-lg backdrop-blur mb-8"
            >
              <Award className="mr-2 h-4 w-4" />
              🎉 #1 NFT Rental Platform on Ethereum
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block text-gray-900">Unlock the Power of</span>
              <span className="block text-gradient">NFT Rentals</span>
            </motion.h1>
            
            <motion.p
              className="mt-6 text-xl sm:text-2xl leading-8 text-gray-600 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The first fully decentralized marketplace where NFT owners earn passive income and renters access premium digital assets for gaming, events, and metaverse experiences.
            </motion.p>

            <motion.div
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/marketplace"
                className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-primary px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 min-w-[200px]"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/create"
                className="group relative inline-flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 min-w-[200px]"
              >
                <Plus className="mr-2 h-5 w-5" />
                <span>Create NFT</span>
              </Link>

              <motion.button
                className="group inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg mr-3 group-hover:shadow-xl transition-all">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-lg mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-lg text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Why Choose{' '}
              <span className="text-gradient">MetaLease</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of NFT utility with our innovative rental platform built for creators, collectors, and gamers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50" />
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="mt-6 inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      <span>Learn more</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Trusted by <span className="text-gradient">Thousands</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join creators and collectors who are already earning passive income and accessing premium NFTs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-primary rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the revolution of NFT utility. Start earning passive income from your digital assets or access premium NFTs for your next adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <span>Start Renting</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105"
              >
                <span>List Your NFTs</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold">MetaLease</span>
            </div>
            <p className="text-gray-400 text-lg mb-2">
              The future of NFT utility - Secured by Ethereum
            </p>
            <p className="text-gray-500">
              Built with ❤️ for the Web3 community
            </p>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span>Network: Ethereum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>Audited Smart Contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Instant Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}