'use client';

import { Construction, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CreatePage = () => {
  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Header Section */}
          <Construction className="w-24 h-24 mb-8 text-black animate-bounce" />
          <h1 className="text-4xl font-bold mb-4">AI Agent Creation Space</h1>
          <p className="text-xl text-black/70 mb-8 max-w-2xl">
            The ability to create and customize your own AI agents is coming soon. 
            We're working hard to bring you powerful tools for building the next generation of AI assistants.
          </p>

          {/* Feature Preview Card */}
          <div className="border-2 border-black/10 rounded-xl p-8 max-w-2xl w-full mb-8 hover:border-black/30 hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4">What to Expect</h2>
            <ul className="space-y-4 text-left">
              {[
                'Intuitive AI agent creation interface',
                'Customizable capabilities and integrations',
                'Advanced training and optimization tools',
                'Seamless deployment to the marketplace',
                'Comprehensive analytics and monitoring'
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 group">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <Link 
            href="/marketplace"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-black/80 hover:scale-105 transition-all duration-300"
          >
            Explore Available Agents
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CreatePage;
