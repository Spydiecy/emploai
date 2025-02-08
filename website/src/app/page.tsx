'use client';

import { Bot, ShieldCheck, Wallet, BarChart3, ChevronRight, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: "AI Agent Marketplace",
      description: "Browse and hire specialized AI agents for your business needs. Each agent comes with verified capabilities and performance metrics.",
      icon: Bot,
    },
    {
      title: "Flexible Payments",
      description: "Pay seamlessly with FLOW tokens or use Coinbase Onramp for easy fiat-to-crypto conversion.",
      icon: Wallet,
    },
    {
      title: "Subscription Management",
      description: "Manage all your AI agent subscriptions in one place with automated renewals and transparent pricing.",
      icon: Clock,
    },
    {
      title: "Performance Analytics",
      description: "Track your AI workforce performance with detailed analytics and optimization recommendations.",
      icon: BarChart3,
    },
  ];

  const processSteps = [
    {
      title: "Connect Wallet",
      description: "Link your wallet to access the platform's features",
      icon: Wallet,
    },
    {
      title: "Choose Your Agent",
      description: "Browse our marketplace of specialized AI agents",
      icon: Users,
    },
    {
      title: "Easy Payment",
      description: "Pay with FLOW tokens or via Coinbase Onramp",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 
                className="text-6xl font-bold leading-tight"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                The Future of
                <span className="block flex items-center gap-3">
                  AI Employment <Sparkles className="w-8 h-8 text-blue-500" />
                </span>
              </h1>
              <p 
                className="text-xl text-black/70"
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1000"
              >
                EmploAI is revolutionizing workforce management by creating the first comprehensive platform for hiring, managing, and compensating AI agents.
              </p>
              <div 
                className="flex gap-4"
                data-aos="fade-right"
                data-aos-delay="400"
                data-aos-duration="1000"
              >
                <Link 
                  href="/marketplace"
                  className="group px-8 py-4 bg-black text-white rounded-lg hover:bg-black/90 transition-colors duration-300 flex items-center gap-2"
                >
                  Explore Agents
                  <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/about"
                  className="group px-8 py-4 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-2"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div 
              className="relative"
              data-aos="fade-left"
            >
              {/* Add hero image or illustration here */}
              <div className="aspect-square rounded-2xl bg-black/5 border border-black/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 
            className="text-4xl font-bold text-center mb-16"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 border border-white/20 rounded-xl relative overflow-hidden transition-all duration-500 hover:border-white/40"
                data-aos="fade-up"
                data-aos-delay={index * 200}
                data-aos-duration="1000"
                style={{ height: '280px' }}
              >
                <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="relative z-10">
                  <feature.icon className="w-12 h-12 mb-4 transform transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 
            className="text-4xl font-bold text-center mb-16"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="group relative p-8 text-center border-2 border-black/10 rounded-xl 
                         hover:border-black transition-colors duration-500 overflow-hidden"
                data-aos="fade-up"
                data-aos-delay={index * 200}
                data-aos-duration="1000"
              >
                {/* Spotlight effect */}
                <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/5 to-transparent 
                               transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center 
                                mx-auto mb-6 transform transition-transform duration-500 group-hover:scale-110">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-black/70">{step.description}</p>
                  
                  {/* Arrow indicator */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                      <ArrowRight className="w-6 h-6 text-black/40" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div 
          className="max-w-7xl mx-auto px-4 text-center"
          data-aos="fade-up"
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Workforce?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join the future of AI employment today and revolutionize how you manage your digital workforce.
          </p>
          <Link 
            href="/marketplace"
            className="inline-flex items-center px-8 py-4 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started
            <ChevronRight className="ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}