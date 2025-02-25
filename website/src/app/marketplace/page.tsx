'use client';

import { useState, useEffect } from 'react';
import { Search, Star, ChevronRight, Bell, MessageSquare, TrendingUp, Newspaper, CircleDot, Sliders, Globe2, Wallet, Activity } from 'lucide-react';
import Image from 'next/image';
import * as SimpleIcons from 'simple-icons';
import { ethers } from 'ethers';
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import Toast from '@/components/Toast';
import CoinbasePaymentModal from '@/components/CoinbasePaymentModal';
import { generateOnrampURL } from '@/utils/coinbase';

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
  isActive: boolean;
  isSubscribed?: boolean;
}

interface IntegrationIconProps {
  name: string;
  size?: number;
  className?: string;
}

interface IconMap {
  [key: string]: {
    path: string;
    hex: string;
  };
}

const IntegrationIcon: React.FC<IntegrationIconProps> = ({ name, size = 16, className = "" }) => {
  const iconMap: IconMap = {
    "Discord": SimpleIcons.siDiscord,
    "Telegram": SimpleIcons.siTelegram,
    "Google Calendar": SimpleIcons.siGooglecalendar,
    "Slack": SimpleIcons.siSlack,
    "Twitter/X": SimpleIcons.siX,
    "Instagram": SimpleIcons.siInstagram,
    "TikTok": SimpleIcons.siTiktok,
    "Reuters": SimpleIcons.siRss,
    "CoinDesk": SimpleIcons.siCoinbase
  };

  const icon = iconMap[name];
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ color: `#${icon.hex}` }}
    >
      <path d={icon.path} />
    </svg>
  );
};

const IntegrationBadge: React.FC<{ integration: string }> = ({ integration }) => {
  return (
    <span className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full text-sm 
                     group-hover:bg-black/10 transition-colors">
      <IntegrationIcon name={integration} size={14} />
      {integration}
    </span>
  );
};

const MarketplacePage = () => {
  const { account, contract } = useWeb3();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20]);
  const [minRating, setMinRating] = useState<number>(0);
  type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'INR' | 'CNY';
  
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const [paymentType, setPaymentType] = useState<'FLOW' | 'FIAT'>('FLOW');
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
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const availabilityColors = {
    available: 'text-green-500',
    busy: 'text-yellow-500',
    stopped: 'text-red-500'
  };

  const getAvailabilityIcon = (status: string) => {
    return <CircleDot className={`w-4 h-4 ${availabilityColors[status as keyof typeof availabilityColors]}`} />;
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const [isOnrampLoading, setIsOnrampLoading] = useState(false);
  const [purchasingAgentId, setPurchasingAgentId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const fetchAgents = async () => {
    try {
      const agentsData: AIAgent[] = [];
      const agentIds = [1, 2, 3];

      for (const id of agentIds) {
        try {
          if (!contract) continue;
          const [name, description, pricePerMonth, integrations, features, isActive] = await contract.getAgent(id);
          const isSubscribed = account ? await contract.hasActiveSubscription(account, id) : false;

          if (isActive) {
            agentsData.push({
              id,
              name,
              type: name.split('(')[1]?.replace(')', '').trim() || 'AI Agent',
              description,
              priceInFlow: Number(ethers.utils.formatEther(pricePerMonth)),
              rating: 4.8,
              reviews: 100,
              capabilities: features,
              status: 'available',
              responseTime: '< 2min',
              integrations,
              features,
              isActive,
              isSubscribed
            });
          }
        } catch (error) {
          console.error(`Error fetching agent ${id}:`, error);
        }
      }

      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      showToast('Failed to fetch agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchAgents();
    }
  }, [contract, account]);

  const handleSubscription = async (agentId: number, price: number) => {
    if (!contract || !account) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    try {
      const tx = await contract.purchaseSubscription(agentId, {
        value: ethers.utils.parseEther(price.toString())
      });
      
      showToast('Processing subscription...', 'success');
      
      await tx.wait();
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId ? { ...agent, isSubscribed: true } : agent
        )
      );

      showToast('Subscription purchased successfully!', 'success');
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      showToast(
        error.code === 4001 
          ? 'Transaction cancelled' 
          : 'Failed to purchase subscription',
        'error'
      );
    }
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

  const filteredAgents = agents.filter(agent => {
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

  const agentTypes = Array.from(new Set(agents.map(agent => agent.type)));
  const allIntegrations = Array.from(new Set(agents.flatMap(agent => agent.integrations)));

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

  const handleFiatPurchase = async (agent: AIAgent) => {
    if (!account) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    try {
      setPurchasingAgentId(agent.id);
      setIsOnrampLoading(true);

      // Generate the onramp URL
      const onrampUrl = generateOnrampURL({
        address: account,
        // Don't set presetCryptoAmount to allow user selection
        redirectUrl: encodeURIComponent(`${window.location.origin}/marketplace?success=true&agentId=${agent.id}`)
      });

      console.log('Opening Coinbase URL:', onrampUrl);
      
      // Open in new window
      const newWindow = window.open(onrampUrl, '_blank');
      
      if (newWindow) {
        showToast('Coinbase payment window opened', 'success');
      } else {
        showToast('Please allow popups to continue with payment', 'error');
      }

    } catch (error: any) {
      console.error('Error initiating fiat purchase:', error);
      showToast(error.message || 'Failed to initiate purchase', 'error');
    } finally {
      setIsOnrampLoading(false);
      setPurchasingAgentId(null);
    }
  };

  // Add this effect to handle redirect back from Coinbase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const agentId = params.get('agentId');

    if (success === 'true' && agentId) {
      // Clean up URL
      window.history.replaceState({}, '', '/marketplace');
      
      // Update agent subscription status
      setAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.id === Number(agentId) ? { ...agent, isSubscribed: true } : agent
        )
      );
      
      showToast('Successfully purchased subscription!', 'success');
    }
  }, []);

  const handlePaymentSuccess = () => {
    showToast('Demo: Purchase successful! (Mocked for hackathon)', 'success');
    if (selectedAgent) {
      setAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.id === selectedAgent.id ? { ...agent, isSubscribed: true } : agent
        )
      );
    }
  };

  const renderPaymentSwitch = () => (
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
        onClick={() => setPaymentType('FIAT')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
          paymentType === 'FIAT' ? 'bg-black text-white' : 'hover:bg-black/5'
        }`}
      >
        <Image src="/assets/coinbase.png" alt="Coinbase" width={20} height={20} className="rounded-full" />
        Buy with Fiat
      </button>
    </div>
  );

  const renderSubscriptionButton = (agent: AIAgent) => {
    if (agent.isSubscribed) {
      return (
        <button 
          className="px-6 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 cursor-default"
          disabled
        >
          <span>Subscribed</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }

    if (paymentType === 'FIAT') {
      const isCurrentlyPurchasing = purchasingAgentId === agent.id;
      return (
        <button
          onClick={() => handleFiatPurchase(agent)}
          disabled={isOnrampLoading}
          className={`
            px-6 py-2 bg-black text-white rounded-lg 
            hover:bg-black/80 hover:scale-105 
            transition-all duration-300 
            flex items-center gap-2
            ${isOnrampLoading && isCurrentlyPurchasing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isOnrampLoading && isCurrentlyPurchasing ? (
            <>
              <span>Opening Coinbase...</span>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <>
              <span>Buy with Fiat</span>
              <Image
                src="/assets/coinbase.png"
                alt="Coinbase"
                width={20}
                height={20}
                className="rounded-full"
              />
            </>
          )}
        </button>
      );
    }

    // FLOW payment button
    return (
      <button
        onClick={() => handleSubscription(agent.id, agent.priceInFlow)}
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black/80 hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <span>Subscribe with</span>
        <Image
          src="/assets/flow.png"
          alt="FLOW"
          width={20}
          height={20}
          className="rounded-full"
        />
      </button>
    );
  };

  const renderAgentCard = (agent: AIAgent) => {
    return (
      <div
        key={agent.id}
        className="flex flex-col border-2 border-black/10 rounded-xl p-6 min-h-[600px] hover:border-black/30 hover:shadow-lg transition-all duration-300 group"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors">
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span className="font-medium">{agent.rating}</span>
            <span className="text-black/60">({agent.reviews})</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-3 mb-4">
          {React.createElement(getAgentIcon(agent.type), {
            className: "w-8 h-8 group-hover:scale-110 transition-transform"
          })}
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

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Integrations:</h4>
            <div className="flex flex-wrap gap-2">
              {agent.integrations.map((integration, index) => (
                <IntegrationBadge key={index} integration={integration} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section - Always at Bottom */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Image
                src="/assets/flow.png"
                alt="FLOW"
                width={24}
                height={24}
                className="rounded-full"
              />
              {agent.priceInFlow} FLOW
            </div>
            <div className="text-black/60">
              {currencySymbols[selectedCurrency]}
              {calculatePrice(agent.priceInFlow)}
            </div>
          </div>
          
          {renderSubscriptionButton(agent)}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      {/* Add Toast component at the top level */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
      
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Agent Employment Space</h1>
        
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
            {renderPaymentSwitch()}

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

            {/* Type Filter with Icon */}
            <div className="relative inline-block">
              <Sliders className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm appearance-none"
              >
                <option value="">All Types</option>
                {agentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-black/60">Loading employees...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black/60">No employees found</p>
          </div>
        ) : (
          /* Agents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAgents.map(agent => renderAgentCard(agent))}
          </div>
        )}
      </div>

      {/* Add the modal */}
      {showPaymentModal && selectedAgent && (
        <CoinbasePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedAgent(null);
          }}
          amount={selectedAgent.priceInFlow}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  );
};

export default MarketplacePage;