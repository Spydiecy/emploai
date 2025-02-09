'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronUp, MessageSquare, Users,
  PlusCircle, TrendingUp, Tag, Search,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import Image from 'next/image';

interface AgentRequest {
  id: number;
  title: string;
  description: string;
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
  pricePerMonth: number;
}

const mockRequests: AgentRequest[] = [
  {
    id: 1,
    title: "SEO Optimization AI Agent",
    description: "An AI agent specialized in analyzing and optimizing website content for search engines, providing real-time recommendations and implementing SEO strategies.",
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
  const { account, contract, showNotification } = useWeb3();
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRequest, setNewRequest] = useState<NewRequestForm>({
    title: '',
    description: '',
    pricePerMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const statuses = ['pending', 'in-progress', 'planned', 'completed'];

  // Fetch feature requests from the contract
  const fetchFeatureRequests = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const requestsData: AgentRequest[] = [];
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      
      // Try the first 10 indices
      for (let index = 1; index <= 10; index++) {
        try {
          const [title, description, priceOffered, requester, upvotes, status] = 
            await contract.getFeatureRequest(index);

          // Skip requests with zero address
          if (requester === ZERO_ADDRESS) {
            continue;
          }

          // If we get here, the request exists and has a valid requester
          const hasUpvoted = account ? 
            await contract.userUpvotes(account, index) : 
            false;

          requestsData.push({
            id: index,
            title,
            description,
            upvotes: upvotes.toNumber(),
            status: status.toLowerCase() as 'pending' | 'in-progress' | 'planned' | 'completed',
            comments: 0, // Comments not implemented in contract
            requestedBy: requester,
            requestDate: new Date(), // Timestamp not stored in contract
            hasUpvoted,
            pricePerMonth: Number(ethers.utils.formatEther(priceOffered))
          });

        } catch (error) {
          // Skip if request doesn't exist
          console.log(`No request at index ${index}`);
        }
      }

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification('Failed to fetch requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load requests when contract is available
  useEffect(() => {
    if (contract) {
      fetchFeatureRequests();
    }
  }, [contract, account]);

  const handleUpvote = async (requestId: number) => {
    if (!contract || !account) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    try {
      const tx = await contract.upvoteFeatureRequest(requestId);
      showNotification('Processing upvote...', 'success');
      
      await tx.wait();
      
      // Update local state
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

      showNotification('Request upvoted successfully!', 'success');
    } catch (error: any) {
      console.error('Error upvoting request:', error);
      showNotification(
        error.code === 4001 
          ? 'Transaction cancelled' 
          : 'Failed to upvote request',
        'error'
      );
    }
  };

  const handleSubmitRequest = async () => {
    if (!contract || !account) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    if (!newRequest.title || !newRequest.description || !newRequest.pricePerMonth) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const priceInWei = ethers.utils.parseEther(newRequest.pricePerMonth.toString());
      
      const tx = await contract.submitFeatureRequest(
        newRequest.title,
        newRequest.description,
        priceInWei
      );

      showNotification('Processing request submission...', 'success');
      
      await tx.wait();

      // Refresh the requests list
      await fetchFeatureRequests();
      
      setIsModalOpen(false);
      setNewRequest({
        title: '',
        description: '',
        pricePerMonth: 0
      });

      showNotification('Feature request submitted successfully!', 'success');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      showNotification(
        error.code === 4001 
          ? 'Transaction cancelled' 
          : 'Failed to submit request',
        'error'
      );
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'planned': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800'
  };

  // Helper function to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
                  <label className="block text-sm font-medium mb-2">Monthly Budget (FLOW)</label>
                  <div className="relative">
                    <Image 
                      src="/assets/flow.png"
                      alt="FLOW"
                      width={20}
                      height={20}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    />
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-black/60">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black/60">No requests found</p>
          </div>
        ) : (
          /* Requests Grid */
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

                {/* Price Display */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-black/60">
                    <Image 
                      src="/assets/flow.png"
                      alt="FLOW"
                      width={16}
                      height={16}
                    />
                    <span>{request.pricePerMonth} FLOW/month</span>
                  </div>
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
                      <span>{formatAddress(request.requestedBy)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default RequestPage;