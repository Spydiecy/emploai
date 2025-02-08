'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, Bell, Clock, ChevronRight, 
  MoreVertical, Check, RefreshCw, Play, Pause, 
  Wallet, Calendar, Link, User, ArrowUpRight, Shield
} from 'lucide-react';
import Image from 'next/image';
import * as SimpleIcons from 'simple-icons';

interface AgentSubscription {
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'paused';
  autoRenew: boolean;
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
  customSettings?: {
    [key: string]: any;
  };
  [key: string]: any;
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
    name: "PersonalAI Assistant",
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
  // Add more mock agents here
];

const Integration = ({ name, size }: { name: string; size: number }) => {
  const iconName = `Si${name.replace(/\s+/g, '')}` as keyof typeof SimpleIcons;
  const IconComponent = SimpleIcons[iconName];
  
  if (!IconComponent) {
    return <div className="w-5 h-5 bg-black/10 rounded" />;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={typeof IconComponent === 'object' && 'path' in IconComponent ? IconComponent.path : ''} fill="currentColor" />
  </svg>;
};

const AgentsPage = () => {
  const [selectedAgent, setSelectedAgent] = useState<UserAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'config' | 'subscription'>('chat');
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    if (mockUserAgents.length > 0) {
      setSelectedAgent(mockUserAgents[0]);
    }
  }, []);

  const renderAgentList = () => (
    <div className="w-80 border-r border-black/10 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4 border-b border-black/10">
        <h2 className="text-xl font-bold">My Agents</h2>
      </div>
      <div className="divide-y divide-black/10">
        {mockUserAgents.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={`p-4 cursor-pointer hover:bg-black/5 transition-colors ${
              selectedAgent?.id === agent.id ? 'bg-black/5' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{agent.name}</h3>
              <span className={`w-2 h-2 rounded-full ${
                agent.status === 'online' ? 'bg-green-500' :
                agent.status === 'configuring' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            <p className="text-sm text-black/60">{agent.type}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-black/40">
              <Clock className="w-3 h-3" />
              <span>Last active: {new Date(agent.lastActive).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatInterface = () => (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      {/* Agent Header */}
      <div className="p-4 border-b border-black/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="font-bold">{selectedAgent?.name}</h2>
            <span className="text-sm text-black/60">{selectedAgent?.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('config')}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {activeTab === 'chat' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedAgent?.chatHistory.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-black/5'
              }`}>
                {message.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Panel */}
      {activeTab === 'config' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <h3 className="text-xl font-bold">Agent Configuration</h3>
            
            {/* Integration Setup */}
            <div className="space-y-4">
              <h4 className="font-semibold">Platform Connections</h4>
              <div className="space-y-3">
                {selectedAgent?.integrations.map(integration => (
                  <div key={integration} className="flex items-center justify-between p-4 border-2 border-black/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-lg">
                        <Integration name={integration} size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{integration}</p>
                        <p className="text-sm text-black/60">
                          {selectedAgent?.config[integration.toLowerCase() + 'Username'] || 'Not configured'}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h4 className="font-semibold">Notification Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedAgent?.config.notificationPreferences || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border-2 border-black/10 rounded-lg">
                    <span className="capitalize">{key}</span>
                    <button className={`w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-black' : 'bg-black/20'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Panel */}
      {activeTab === 'subscription' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <h3 className="text-xl font-bold">Subscription Management</h3>
            
            {/* Current Plan */}
            <div className="p-6 border-2 border-black/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Current Plan</h4>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedAgent?.subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAgent?.subscription.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-black/60">Start Date</p>
                  <p className="font-medium">
                    {selectedAgent?.subscription.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-black/60">End Date</p>
                  <p className="font-medium">
                    {selectedAgent?.subscription.endDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">
                Renew Subscription
              </button>
            </div>

            {/* Auto-Renewal */}
            <div className="p-6 border-2 border-black/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Auto-Renewal</h4>
                  <p className="text-sm text-black/60">
                    Your subscription will automatically renew on expiry
                  </p>
                </div>
                <button className={`w-12 h-6 rounded-full transition-colors ${
                  selectedAgent?.subscription.autoRenew ? 'bg-black' : 'bg-black/20'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                    selectedAgent?.subscription.autoRenew ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-black/10 p-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'chat' ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'config' ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'subscription' ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex h-[calc(100vh-64px)] bg-white pt-16">
      {renderAgentList()}
      {selectedAgent ? (
        renderChatInterface()
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-black/60">Select an agent to get started</p>
        </div>
      )}
    </main>
  );
};

export default AgentsPage;