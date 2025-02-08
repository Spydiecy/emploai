'use client';

import { useState } from 'react';
import { 
  ChevronUp, MessageSquare, Users,
  PlusCircle, TrendingUp, Tag, Search,
  X, DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  upvotes: number;
  status: 'pending' | 'in-progress' | 'planned' | 'completed';
  comments: number;
  requestedBy: string;
  requestDate: Date;
  hasUpvoted: boolean;
  pricePerMonth: number;
}

interface NewRequestForm {
  title: string;
  description: string;
  category: string;
  pricePerMonth: number;
}

const mockRequests: AgentRequest[] = [
  {
    id: 1,
    title: "SEO Optimization AI Agent",
    description: "An AI agent specialized in analyzing and optimizing website content for search engines, providing real-time recommendations and implementing SEO strategies.",
    category: "Marketing",
    upvotes: 156,
    status: 'planned',
    comments: 24,
    requestedBy: "seo_expert",
    requestDate: new Date('2024-02-01'),
    hasUpvoted: false,
    pricePerMonth: 0
  },
  {
    id: 2,
    title: "Legal Document Assistant",
    description: "AI agent for reviewing and drafting legal documents, contracts, and providing basic legal compliance checks.",
    category: "Legal",
    upvotes: 234,
    status: 'in-progress',
    comments: 45,
    requestedBy: "legal_tech",
    requestDate: new Date('2024-01-28'),
    hasUpvoted: true,
    pricePerMonth: 0
  },
  {
    id: 3,
    title: "Video Editing AI Assistant",
    description: "An AI agent that can assist with video editing tasks, suggesting cuts, transitions, and helping with content optimization.",
    category: "Media",
    upvotes: 189,
    status: 'pending',
    comments: 32,
    requestedBy: "content_creator",
    requestDate: new Date('2024-02-05'),
    hasUpvoted: false,
    pricePerMonth: 0
  }
];

const RequestPage = () => {
  const [requests, setRequests] = useState<AgentRequest[]>(mockRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRequest, setNewRequest] = useState<NewRequestForm>({
    title: '',
    description: '',
    category: '',
    pricePerMonth: 0
  });

  const categories = Array.from(new Set(requests.map(req => req.category)));
  const statuses = ['pending', 'in-progress', 'planned', 'completed'];

  const handleUpvote = (requestId: number) => {
    setRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === requestId
          ? {
              ...request,
              upvotes: request.hasUpvoted ? request.upvotes - 1 : request.upvotes + 1,
              hasUpvoted: !request.hasUpvoted
            }
          : request
      )
    );
  };

  const handleSubmitRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.category || !newRequest.pricePerMonth) {
      return;
    }

    const request: AgentRequest = {
      id: requests.length + 1,
      ...newRequest,
      upvotes: 0,
      status: 'pending',
      comments: 0,
      requestedBy: '0x1234...5678', // Replace with actual wallet address
      requestDate: new Date(),
      hasUpvoted: false,
      pricePerMonth: newRequest.pricePerMonth
    };

    setRequests([request, ...requests]);
    setIsModalOpen(false);
    setNewRequest({
      title: '',
      description: '',
      category: '',
      pricePerMonth: 0
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesCategory = !selectedCategory || request.category === selectedCategory;
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'planned': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800'
  };

  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Request AI Agent Employees</h1>
          <p className="text-black/60 text-lg max-w-2xl mx-auto">
            Help us build the future of AI employment. Request new AI agents or upvote existing requests to show your interest.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Requests', value: requests.length, icon: MessageSquare },
            { label: 'Total Upvotes', value: requests.reduce((acc, req) => acc + req.upvotes, 0), icon: ChevronUp },
            { label: 'In Progress', value: requests.filter(req => req.status === 'in-progress').length, icon: TrendingUp }
          ].map((stat, index) => (
            <div key={index} className="p-6 border-2 border-black rounded-xl hover:border-black/70 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/60">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-xl focus:outline-none hover:border-black/70 transition-all duration-300"
            />
          </div>
          <select
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-3 border-2 border-black rounded-xl focus:outline-none hover:border-black/70 transition-all duration-300"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="px-4 py-3 border-2 border-black rounded-xl focus:outline-none hover:border-black/70 transition-all duration-300"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 flex items-center gap-2 hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Request Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">New Agent Request</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="e.g., Content Writing Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="Describe what you want this agent to do..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={newRequest.pricePerMonth}
                      onChange={(e) => setNewRequest({...newRequest, pricePerMonth: Number(e.target.value)})}
                      className="w-full pl-12 pr-4 py-3 border-2 border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmitRequest}
                  className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRequests.map(request => (
            <div key={request.id} className="border-2 border-black rounded-xl p-6 hover:border-black/70 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className="text-sm text-black/60">
                  {formatDistanceToNow(request.requestDate, { addSuffix: true })}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">{request.title}</h3>
              <p className="text-black/60 mb-4 line-clamp-3">{request.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-black/40" />
                <span className="text-sm text-black/60">{request.category}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-black/40" />
                <span className="text-sm text-black/60">${request.pricePerMonth}/month</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <button
                  onClick={() => handleUpvote(request.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    request.hasUpvoted
                      ? 'bg-black text-white'
                      : 'hover:bg-black/5'
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>{request.upvotes}</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-black/60">
                    <MessageSquare className="w-4 h-4" />
                    <span>{request.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-black/60">
                    <Users className="w-4 h-4" />
                    <span>{request.requestedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default RequestPage;