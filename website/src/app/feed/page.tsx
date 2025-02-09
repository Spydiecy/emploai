'use client';

import { useState } from 'react';
import { 
  MessageCircle, 
  Repeat2, 
  Heart, 
  Share,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

const TWITTER_HANDLE = 'EmploAi_';

// Real tweet data with direct image URLs
const tweets = [
  {
    id: '1887951959833067867',
        text: "Introducing @EmploAi_ ✨ why hire humans when you can rent AI employees that:\n\n- never sleep 😴\n- don't take holidays\n- actually read the docs\n- scale infinitely your next best hire might not be human 👀",
    created_at: '2025-02-06T21:30:00.000Z',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 2,
    }
  },
  {
    id: '1888141579233186264',
    text: "",
    created_at: '2025-02-07T10:04:00.000Z',
    imageUrl: 'https://pbs.twimg.com/media/GjQGvzEXsAAhdNu?format=png&name=large',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
    }
  },
  {
    id: '1888141949225275481',
    text: "yo what if you could manage payroll by just... talking to it? 🤔 'yo ai, pay the team' 'aight boss' that's it. (we actually built this btw lmao)",
    created_at: '2025-02-07T10:05:00.000Z',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
    }
  },
  {
    id: '1888326442364063907',
    text: "the future of hiring fr fr",
    created_at: '2025-02-07T22:18:00.000Z',
    imageUrl: 'https://pbs.twimg.com/media/GjSu3CSWkAAG3Ln?format=png&name=large',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
    }
  },
  {
    id: '1888326693087007127',
    text: "POV: your AI employee... \n - just shipped that feature \n - wrote perfect documentation \n - handled customer support \n - filed their own taxes ...at 3am on a Sunday built different fr fr 😤",
    created_at: '2025-02-07T22:19:00.000Z',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
    }
  },
  {
    id: '1888332925457825935',
    text: "Sneak peak of the ui 👀",
    created_at: '2025-02-07T22:44:00.000Z',
    imageUrl: 'https://pbs.twimg.com/media/GjS0xNaXMAAPv4D?format=jpg&name=large',
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 1,
    }
  }
].reverse();

const EmploAIFeed = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTweets = tweets.filter(tweet =>
    tweet.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <main className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">EmploAI Updates</h1>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 shadow-sm"
            />
          </div>
        </div>

        {/* Tweets Feed */}
        <div className="space-y-6">
          {filteredTweets.map(tweet => (
            <div 
              key={tweet.id} 
              className="flex flex-col border-2 border-black/10 rounded-xl p-6 hover:border-black/30 hover:shadow-lg transition-all duration-300 group bg-white"
            >
              {/* Tweet Content */}
              <p className="text-lg leading-relaxed mb-4 whitespace-pre-wrap">{tweet.text}</p>

              {/* Tweet Image */}
              {tweet.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden bg-black/5">
                  <Image
                    src={tweet.imageUrl}
                    alt="Tweet media"
                    width={1200}
                    height={675}
                    className="w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                    unoptimized
                  />
                </div>
              )}

              {/* Tweet Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <a
                  href={`https://twitter.com/intent/tweet?in_reply_to=${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                </a>
                <a
                  href={`https://twitter.com/intent/retweet?tweet_id=${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group"
                >
                  <Repeat2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                </a>
                <a
                  href={`https://twitter.com/intent/like?tweet_id=${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                </a>
                <a 
                  href={`https://twitter.com/${TWITTER_HANDLE}/status/${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
                >
                  <Share className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>

              {/* Tweet Timestamp */}
              <div className="mt-4 text-sm text-black/60">
                <a
                  href={`https://twitter.com/${TWITTER_HANDLE}/status/${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
                >
                  {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default EmploAIFeed;