'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Zap, ChevronRight, Bell, MessageSquare, TrendingUp, Newspaper, ChevronDown, CircleDot, Sliders, Globe2, Wallet, Activity } from 'lucide-react';
import Image from 'next/image';
import { 
  SiDiscord, SiSlack, SiGithub, SiTwitter, SiTelegram, 
  SiWhatsapp, SiGmail, SiMessenger, SiZoom, SiSkype,
  SiOpenai, SiProbot, SiGoogleassistant, SiAzuredevops, 
  SiGoogleanalytics, SiMicrosoftacademic
} from 'react-icons/si';
import { 
  BsChatDotsFill, BsRobot, BsGearFill, 
  BsGraphUpArrow, BsSearch, BsCodeSlash 
} from 'react-icons/bs';

interface FlowPrice {
  amount: string;
  currency: string;
}

interface AIAgent {
  id: number;
  name: string;
  type: string;
  description: string;
  priceInFlow: number;
  rating: number;
  reviews: number;
  capabilities: string[];
  status: 'available' | 'busy' | 'stopped';
  responseTime: string;
  integrations: string[];
  features: string[];
}

const mockAgents: AIAgent[] = [
  {
    id: 1,
    name: "PersonalAI Assistant",
    type: "Personal Assistant",
    description: "Your 24/7 personal assistant that manages schedules, sends reminders, and keeps your life organized across multiple platforms.",
    priceInFlow: 8, // 8 FLOW tokens
    rating: 4.8,
    reviews: 156,
    capabilities: ["Schedule Management", "Meeting Reminders", "Task Prioritization", "Communication"],
    status: "available",
    responseTime: "Real-time",
    integrations: ["Discord", "Telegram", "Google Calendar", "Slack"],
    features: [
      "Smart meeting scheduling",
      "Multi-platform notifications",
      "Priority task management",
      "Automated follow-ups",
      "Calendar optimization"
    ]
  },
  {
    id: 2,
    name: "MarketingGPT Pro",
    type: "Marketing Expert",
    description: "Advanced AI marketing expert that analyzes trends, crafts engaging content, and provides strategic insights based on real-time social media data.",
    priceInFlow: 10, // 10 FLOW tokens
    rating: 4.9,
    reviews: 142,
    capabilities: ["Trend Analysis", "Content Creation", "Strategy Planning", "Performance Tracking"],
    status: "available",
    responseTime: "< 2min",
    integrations: ["Twitter/X", "LinkedIn", "Instagram", "TikTok"],
    features: [
      "Real-time trend monitoring",
      "Viral content prediction",
      "Competitor analysis",
      "Engagement optimization",
      "Content calendar planning"
    ]
  },
  {
    id: 3,
    name: "NewsRadar AI",
    type: "News Analyzer",
    description: "Stay ahead with real-time news analysis and summaries. Never miss important market movements or trending topics with intelligent filtering.",
    priceInFlow: 7, // 7 FLOW tokens
    rating: 4.7,
    reviews: 98,
    capabilities: ["News Monitoring", "Trend Detection", "Summary Generation", "Alert System"],
    status: "available",
    responseTime: "< 1min",
    integrations: ["Twitter/X", "Reuters", "Bloomberg", "CoinDesk"],
    features: [
      "Real-time news filtering",
      "Market movement alerts",
      "Customized news digest",
      "Sentiment analysis",
      "Investment opportunities spotting"
    ]
  }
];

const typeIcons = {
  'chatbot': BsChatDotsFill,
  'assistant': BsRobot,
  'automation': BsGearFill,
  'analytics': BsGraphUpArrow,
  'research': BsSearch,
  'development': BsCodeSlash
};

const integrationIcons = {
  'Discord': SiDiscord,
  'Slack': SiSlack,
  'Github': SiGithub,
  'Twitter': SiTwitter,
  'Telegram': SiTelegram,
  'WhatsApp': SiWhatsapp,
  'Email': SiGmail,
  'Messenger': SiMessenger,
  'Zoom': SiZoom,
  'Skype': SiSkype,
  'OpenAI': SiOpenai,
  'Azure': SiAzuredevops,
  'Google Analytics': SiGoogleanalytics,
  'Google Assistant': SiGoogleassistant,
  'Academic': SiMicrosoftacademic,
  'Probot': SiProbot
};

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20]);
  const [minRating, setMinRating] = useState<number>(0);
  type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'INR' | 'CNY';
  
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const [paymentType, setPaymentType] = useState<'FLOW' | 'USDT'>('FLOW');
  const [currencyRates, setCurrencyRates] = useState({
    FLOW_USD: 0,
    USDT_USD: 1,
    USDT_EUR: 0,
    USDT_GBP: 0,
    USDT_JPY: 0,
    USDT_AUD: 0,
    USDT_CAD: 0,
    USDT_CHF: 0,
    USDT_INR: 0,
    USDT_CNY: 0
  });

  const currencySymbols: Record<CurrencyType, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    INR: '₹',
    CNY: '¥'
  };

  const [availability, setAvailability] = useState<string | null>(null);

  const availabilityColors = {
    available: 'text-green-500',
    busy: 'text-yellow-500',
    stopped: 'text-red-500'
  };

  const getAvailabilityIcon = (status: string) => {
    return <CircleDot className={`w-4 h-4 ${availabilityColors[status as keyof typeof availabilityColors]}`} />;
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'INR', 'CNY'];
        const responses = await Promise.all([
          fetch('https://api.coinbase.com/v2/prices/FLOW-USD/spot'),
          ...currencies.map(currency => 
            fetch(`https://api.coinbase.com/v2/prices/USDT-${currency}/spot`)
          )
        ]);

        const [flowUsdData, ...currencyData] = await Promise.all(
          responses.map(res => res.json())
        );

        const newRates: any = {
          FLOW_USD: parseFloat(flowUsdData.data.amount),
          USDT_USD: 1
        };

        currencies.forEach((currency, index) => {
          newRates[`USDT_${currency}`] = parseFloat(currencyData[index].data.amount);
        });

        setCurrencyRates(newRates);
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculatePrice = (flowPrice: number) => {
    if (paymentType === 'FLOW') {
      const usdPrice = flowPrice * currencyRates.FLOW_USD;
      switch (selectedCurrency) {
        case 'USD':
          return usdPrice.toFixed(2);
        case 'GBP':
          return (usdPrice * (currencyRates.USDT_GBP / currencyRates.USDT_USD)).toFixed(2);
        case 'INR':
          return (usdPrice * (currencyRates.USDT_INR / currencyRates.USDT_USD)).toFixed(2);
        case 'EUR':
          return (usdPrice * (currencyRates.USDT_EUR / currencyRates.USDT_USD)).toFixed(2);
        case 'JPY':
          return (usdPrice * (currencyRates.USDT_JPY / currencyRates.USDT_USD)).toFixed(2);
        case 'AUD':
          return (usdPrice * (currencyRates.USDT_AUD / currencyRates.USDT_USD)).toFixed(2);
        case 'CAD':
          return (usdPrice * (currencyRates.USDT_CAD / currencyRates.USDT_USD)).toFixed(2);
        case 'CHF':
          return (usdPrice * (currencyRates.USDT_CHF / currencyRates.USDT_USD)).toFixed(2);
        case 'CNY':
          return (usdPrice * (currencyRates.USDT_CNY / currencyRates.USDT_USD)).toFixed(2);
      }
    } else {
      // USDT price calculation
      const usdtAmount = flowPrice * currencyRates.FLOW_USD / currencyRates.USDT_USD;
      switch (selectedCurrency) {
        case 'USD':
          return usdtAmount.toFixed(2);
        case 'GBP':
          return (usdtAmount * currencyRates.USDT_GBP / currencyRates.USDT_USD).toFixed(2);
        case 'INR':
          return (usdtAmount * currencyRates.USDT_INR / currencyRates.USDT_USD).toFixed(2);
        case 'EUR':
          return (usdtAmount * currencyRates.USDT_EUR / currencyRates.USDT_USD).toFixed(2);
        case 'JPY':
          return (usdtAmount * currencyRates.USDT_JPY / currencyRates.USDT_USD).toFixed(2);
        case 'AUD':
          return (usdtAmount * currencyRates.USDT_AUD / currencyRates.USDT_USD).toFixed(2);
        case 'CAD':
          return (usdtAmount * currencyRates.USDT_CAD / currencyRates.USDT_USD).toFixed(2);
        case 'CHF':
          return (usdtAmount * currencyRates.USDT_CHF / currencyRates.USDT_USD).toFixed(2);
        case 'CNY':
          return (usdtAmount * currencyRates.USDT_CNY / currencyRates.USDT_USD).toFixed(2);          
      }
    }
  };

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || agent.type === selectedType;
    const matchesIntegration = !selectedIntegration || agent.integrations.includes(selectedIntegration);
    const matchesPrice = agent.priceInFlow >= priceRange[0] && agent.priceInFlow <= priceRange[1];
    const matchesRating = agent.rating >= minRating;
    const matchesAvailability = !availability || agent.status === availability;
    return matchesSearch && matchesType && matchesIntegration && matchesPrice && matchesRating && matchesAvailability;
  });

  const agentTypes = Array.from(new Set(mockAgents.map(agent => agent.type)));
  const allIntegrations = Array.from(new Set(mockAgents.flatMap(agent => agent.integrations)));

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "Personal Assistant":
        return Bell;
      case "Marketing Expert":
        return TrendingUp;
      case "News Analyzer":
        return Newspaper;
      default:
        return MessageSquare;
    }
  };

  const renderIcon = (IconComponent: any, className = "w-4 h-4") => {
    return <IconComponent className={className} />;
  };

  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Agent Marketplace</h1>
        
        {/* Enhanced Search and Filter Layout */}
        <div className="mb-8 space-y-6">
          {/* Search Bar in Full Width */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search AI agents by name, description, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-black/5 rounded-xl">
            {/* Payment Type Switch */}
            <div className="flex items-center gap-2 p-1 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setPaymentType('FLOW')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  paymentType === 'FLOW' ? 'bg-black text-white' : 'hover:bg-black/5'
                }`}
              >
                <Image src="/assets/flow.png" alt="FLOW" width={20} height={20} className="rounded-full" />
                FLOW
              </button>
              <button
                onClick={() => setPaymentType('USDT')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  paymentType === 'USDT' ? 'bg-black text-white' : 'hover:bg-black/5'
                }`}
              >
                <Image src="/assets/usdt.png" alt="USDT" width={20} height={20} className="rounded-full" />
                USDT
              </button>
            </div>

            {/* Currency Selector with Icon */}
            <div className="relative inline-block">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyType)}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="USD">$ USD - US Dollar</option>
                <option value="EUR">€ EUR - Euro</option>
                <option value="GBP">£ GBP - British Pound</option>
                <option value="JPY">¥ JPY - Japanese Yen</option>
                <option value="AUD">A$ AUD - Australian Dollar</option>
                <option value="CAD">C$ CAD - Canadian Dollar</option>
                <option value="CHF">Fr CHF - Swiss Franc</option>
                <option value="INR">₹ INR - Indian Rupee</option>
                <option value="CNY">¥ CNY - Chinese Yuan</option>
              </select>
            </div>

            {/* Updated Type Filter with Icons */}
            <div className="relative inline-block">
              <Sliders className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="">All Types</option>
                {agentTypes.map(type => (
                  <option key={type} value={type} className="flex items-center gap-2">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Integration Filter with Icon */}
            <div className="relative inline-block">
              <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                onChange={(e) => setSelectedIntegration(e.target.value || null)}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="">All Integrations</option>
                {allIntegrations.map(integration => (
                  <option key={integration} value={integration}>{integration}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter with Icon */}
            <div className="relative inline-block">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-400 fill-current" />
              <select
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="0">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Availability Filter with Status Icons */}
            <div className="relative inline-block">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={availability || ''}
                onChange={(e) => setAvailability(e.target.value || null)}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="">All Status</option>
                <option value="available" className="text-green-500">
                  ● Available
                </option>
                <option value="busy" className="text-yellow-500">
                  ● Busy
                </option>
                <option value="stopped" className="text-red-500">
                  ● Stopped
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Updated Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAgents
            .filter(agent => !availability || agent.status === availability)
            .map(agent => {
              const AgentIcon = getAgentIcon(agent.type);
              return (
                <div
                  key={agent.id}
                  className="flex flex-col border-2 border-black/10 rounded-xl p-6 min-h-[600px] hover:border-black/30 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {renderIcon(typeIcons[agent.type.toLowerCase()], "w-5 h-5 text-black/70")}
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        agent.status === 'available' ? 'bg-green-100 text-green-800' :
                        agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      } group-hover:bg-opacity-80 transition-colors`}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span className="font-medium">{agent.rating}</span>
                      <span className="text-black/60">({agent.reviews})</span>
                    </div>
                  </div>

                  {/* Title Section */}
                  <div className="flex items-center gap-3 mb-4">
                    <AgentIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                  </div>

                  {/* Content Section - Flex Grow to Push Footer Down */}
                  <div className="flex-grow">
                    <p className="text-black/70 mb-4">{agent.description}</p>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {agent.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Integrations:</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.integrations.map((integration, index) => {
                          const IntegrationIcon = integrationIcons[integration];
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full text-sm group-hover:bg-black/10 transition-colors"
                            >
                              {IntegrationIcon && renderIcon(IntegrationIcon, "w-4 h-4")}
                              {integration}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Section - Always at Bottom */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        <Image
                          src={paymentType === 'FLOW' ? "/assets/flow.png" : "/assets/usdt.png"}
                          alt={paymentType}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        {paymentType === 'FLOW' ? 
                          `${agent.priceInFlow} FLOW` : 
                          `${(agent.priceInFlow * currencyRates.FLOW_USD / currencyRates.USDT_USD).toFixed(2)} USDT`
                        }
                      </div>
                      <div className="text-black/60">
                        {currencySymbols[selectedCurrency]}
                        {calculatePrice(agent.priceInFlow)}
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black/80 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                      <span>Pay with</span>
                      <Image
                        src={paymentType === 'FLOW' ? "/assets/flow.png" : "/assets/usdt.png"}
                        alt={paymentType}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
};

export default MarketplacePage;