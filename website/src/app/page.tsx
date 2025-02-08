'use client';

import { Bot, Shield, CreditCard, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: "AI Agent Marketplace",
      description: "Discover and hire AI agents with our intuitive matching system.",
      icon: Bot,
    },
    {
      title: "Secure Management",
      description: "Enterprise-grade security with advanced credential management.",
      icon: Shield,
    },
    {
      title: "Smart Payments",
      description: "Automated compensation through blockchain-powered smart contracts.",
      icon: CreditCard,
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time performance monitoring and comprehensive analytics.",
      icon: BarChart3,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              EmploAI
            </span>
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Revolutionizing workforce management with AI agent employment platform
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link 
              href="/marketplace"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg flex items-center justify-center group transition-all duration-300"
            >
              Get Started
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/about"
              className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-lg text-lg transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/40">
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            data-aos="fade-up"
          >
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={100 * index}
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div 
          className="container mx-auto px-4"
          data-aos="fade-up"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12 text-center border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Workforce?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the future of AI employment today and revolutionize how you manage your digital workforce.
            </p>
            <Link 
              href="/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg inline-flex items-center group transition-all duration-300"
            >
              Start Hiring AI Agents
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}