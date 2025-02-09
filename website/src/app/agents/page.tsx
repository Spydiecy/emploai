'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, Bell, Clock,
  Wallet, Shield,
  TrendingUp, Newspaper, Send,
} from 'lucide-react';
import * as SimpleIcons from 'simple-icons';
import { formatDistanceToNow } from 'date-fns';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';

interface CustomSettings {
  [key: string]: string | number | boolean;
}

interface AgentConfig {
  discordUsername?: string;
  telegramHandle?: string;
  calendarEmail?: string;
  preferredLanguage?: string;
  notificationPreferences?: {
    email: boolean;
    discord: boolean;
    telegram: boolean;
  };
  customSettings?: CustomSettings;
}

interface AgentSubscription {
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'paused';
  autoRenew: boolean;
}

interface UserAgent {
  id: number;
  name: string;
  type: string;
  description: string;
  subscription: AgentSubscription;
  config: AgentConfig;
  lastActive: Date;
  status: 'online' | 'offline' | 'configuring';
  integrations: string[];
  features: string[];
  chatHistory: {
    id: number;
    message: string;
    timestamp: Date;
    sender: 'user' | 'agent';
  }[];
}

const mockUserAgents: UserAgent[] = [
  {
    id: 1,
    name: "Personal Assistant ( PA )",
    type: "Personal Assistant",
    description: "Your 24/7 personal assistant that manages schedules.",
    subscription: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-01'),
      status: 'active',
      autoRenew: true
    },
    config: {
      discordUsername: "",
      telegramHandle: "",
      calendarEmail: "",
      notificationPreferences: {
        email: true,
        discord: false,
        telegram: false
      }
    },
    lastActive: new Date(),
    status: 'configuring',
    integrations: ["Discord", "Telegram", "Google Calendar"],
    features: ["Schedule Management", "Reminders", "Task Tracking"],
    chatHistory: [
      {
        id: 1,
        message: "Hello! To get started, I'll need your Discord username and Telegram handle.",
        timestamp: new Date(),
        sender: 'agent'
      }
    ]
  },
  {
    id: 2,
    name: "Chief Marketing Officer ( CMO )",
    type: "Marketing Expert",
    description: "Advanced AI marketing expert for social media analysis.",
    subscription: {
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-03-15'),
      status: 'active',
      autoRenew: true
    },
    config: {
      discordUsername: "user#1234",
      notificationPreferences: {
        email: true,
        discord: true,
        telegram: false
      }
    },
    lastActive: new Date(),
    status: 'online',
    integrations: ["Twitter/X", "LinkedIn", "Instagram"],
    features: ["Trend Analysis", "Content Creation", "Analytics"],
    chatHistory: [
      {
        id: 1,
        message: "I've analyzed today's trending topics. Would you like to see the report?",
        timestamp: new Date(),
        sender: 'agent'
      }
    ]
  },
  {
    id: 3,
    name: "Chief News Analyst ( CNA )",
    type: "News Analyzer",
    description: "Real-time news monitoring and analysis.",
    subscription: {
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-03-10'),
      status: 'active',
      autoRenew: false
    },
    config: {
      notificationPreferences: {
        email: true,
        discord: true,
        telegram: true
      }
    },
    lastActive: new Date(Date.now() - 3600000),
    status: 'online',
    integrations: ["Twitter/X", "Reuters", "Bloomberg"],
    features: ["News Monitoring", "Alert System", "Summary Generation"],
    chatHistory: [
      {
        id: 1,
        message: "Breaking news alert: Major market movement detected.",
        timestamp: new Date(),
        sender: 'agent'
      }
    ]
  }
];

const Integration = ({ name, size }: { name: string; size: number }) => {
  const iconName = `si${name.toLowerCase().replace(/\s+/g, '')}` as keyof typeof SimpleIcons;
  const IconComponent = SimpleIcons[iconName];
  
  if (!IconComponent) {
    return <div className="w-5 h-5 bg-black/10 rounded" />;
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className="text-black"
    >
      <path 
        d={typeof IconComponent === 'object' && 'path' in IconComponent ? IconComponent.path : ''} 
        fill="currentColor" 
      />
    </svg>
  );
};

const AgentsPage = () => {
  const { account, contract } = useWeb3();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<UserAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'config' | 'subscription'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscribed agents
  const fetchSubscribedAgents = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      const subscribedAgents: UserAgent[] = [];

      // Try first 10 agent IDs (adjust based on your needs)
      for (let id = 1; id <= 10; id++) {
        try {
          // Check if user has active subscription for this agent
          const hasSubscription = await contract.hasActiveSubscription(account, id);
          
          if (hasSubscription) {
            // Get agent details
            const [name, description, pricePerMonth, integrations, features, isActive] = 
              await contract.getAgent(id);

            // Get subscription details
            const [startDate, endDate, isActive_sub] = 
              await contract.getSubscriptionDetails(account, id);

            if (isActive && isActive_sub) {
              subscribedAgents.push({
                id,
                name,
                type: "AI Agent", // Default type
                description,
                subscription: {
                  startDate: new Date(startDate.toNumber() * 1000),
                  endDate: new Date(endDate.toNumber() * 1000),
                  status: 'active',
                  autoRenew: false // Not implemented in contract
                },
                config: {
                  notificationPreferences: {
                    email: false,
                    discord: false,
                    telegram: false
                  }
                },
                lastActive: new Date(),
                status: 'online',
                integrations,
                features,
                chatHistory: [
                  {
                    id: 1,
                    message: "Hello! I'm your new AI assistant.",
                    timestamp: new Date(),
                    sender: 'agent'
                  }
                ]
              });
            }
          }
        } catch (error) {
          console.log(`No agent at index ${id} or error fetching:`, error);
        }
      }

      setAgents(subscribedAgents);
      
      // Set first agent as selected if available
      if (subscribedAgents.length > 0 && !selectedAgent) {
        setSelectedAgent(subscribedAgents[0]);
      }

    } catch (error) {
      console.error('Error fetching subscribed agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchSubscribedAgents();
    }
  }, [contract, account]);

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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedAgent) return;

    const updatedAgent = {
      ...selectedAgent,
      chatHistory: [
        ...selectedAgent.chatHistory,
        {
          id: selectedAgent.chatHistory.length + 1,
          message: newMessage,
          timestamp: new Date(),
          sender: 'user' as const
        }
      ]
    };

    setSelectedAgent(updatedAgent);
    setNewMessage('');
  };

  const renderAgentHeader = () => {
    if (!selectedAgent) return null;
    const AgentIcon = getAgentIcon(selectedAgent.type);

    return (
      <div className="p-6 border-b border-black/10 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
              <AgentIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
              <div className="flex items-center gap-2 text-sm text-black/60">
                <span>{selectedAgent.type}</span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${
                  selectedAgent.status === 'online' ? 'text-green-500' :
                  selectedAgent.status === 'configuring' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {['chat', 'config', 'subscription'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-black text-white' 
                    : 'hover:bg-black/5'
                }`}
              >
                {tab === 'chat' && <MessageSquare className="w-5 h-5" />}
                {tab === 'config' && <Settings className="w-5 h-5" />}
                {tab === 'subscription' && <Wallet className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAgentList = () => {
    return (
      <div className="w-80 border-r border-black/10 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-4 border-b border-black/10">
          <h2 className="text-xl font-bold">My Agents</h2>
        </div>
        <div className="divide-y divide-black/10">
          {agents.map(agent => {
            const AgentIcon = getAgentIcon(agent.type);
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 cursor-pointer hover:bg-black/5 transition-colors ${
                  selectedAgent?.id === agent.id ? 'bg-black/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center">
                    <AgentIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${
                        agent.status === 'online' ? 'bg-green-500' :
                        agent.status === 'configuring' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <p className="text-sm text-black/60">{agent.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-black/40">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(agent.lastActive, { addSuffix: true })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfigPanel = () => {
    if (!selectedAgent) return null;
    
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-xl font-bold mb-4">Agent Configuration</h3>
          
          {/* Integration Settings */}
          <div className="border-2 border-black/10 rounded-xl p-6 space-y-4">
            <h4 className="font-semibold">Integrations</h4>
            {selectedAgent.integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Integration name={integration} size={20} />
                  <span>{integration}</span>
                </div>
                <input
                  type="text"
                  placeholder={`Enter ${integration} username`}
                  className="px-4 py-2 border-2 border-black/10 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Notification Preferences */}
          <div className="border-2 border-black/10 rounded-xl p-6 space-y-4">
            <h4 className="font-semibold">Notification Preferences</h4>
            {Object.entries(selectedAgent.config.notificationPreferences || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
                <span className="capitalize">{key}</span>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    value ? 'bg-black text-white' : 'bg-black/10'
                  }`}
                >
                  {value ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSubscriptionPanel = () => {
    if (!selectedAgent) return null;

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-black/10 rounded-xl p-6 space-y-6">
            <h3 className="text-xl font-bold">Subscription Details</h3>
            
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Start Date</p>
                  <p className="text-sm text-black/60">
                    {selectedAgent.subscription.startDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold">End Date</p>
                <p className="text-sm text-black/60">
                  {selectedAgent.subscription.endDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5" />
                <span className="font-semibold">Auto-renew</span>
              </div>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedAgent.subscription.autoRenew ? 'bg-black text-white' : 'bg-black/10'
                }`}
              >
                {selectedAgent.subscription.autoRenew ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedAgent.subscription.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAgent.subscription.status.charAt(0).toUpperCase() + 
                 selectedAgent.subscription.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChatPanel = () => {
    if (!selectedAgent) return null;

    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedAgent.chatHistory.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
                message.sender === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-black/5 hover:bg-black/10'
              }`}>
                <p>{message.message}</p>
                <p className="text-xs mt-2 opacity-60">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-black/10">
          <div className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button 
              onClick={handleSendMessage}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="border-2 border-black rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex bg-white/50 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="mt-4 text-black/60">Loading your ai employees...</p>
            </div>
          ) : (
            <>
              {renderAgentList()}
              {selectedAgent ? (
                <div className="flex-1 flex flex-col">
                  {renderAgentHeader()}
                  {activeTab === 'chat' && renderChatPanel()}
                  {activeTab === 'config' && renderConfigPanel()}
                  {activeTab === 'subscription' && renderSubscriptionPanel()}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-black/60">
                    {agents.length === 0 
                      ? "You haven't subscribed to any agents yet" 
                      : "Select an agent to get started"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AgentsPage;