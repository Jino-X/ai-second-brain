'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, X, Clock, Tag } from 'lucide-react';
import { KnowledgeType } from '@/types';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  created_at: string;
  search_type: 'text' | 'semantic' | 'hybrid';
  relevance_score: number;
  matching_chunk?: string;
  tags?: string[];
}

interface AdvancedSearchProps {
  onResults: (results: SearchResult[]) => void;
  onClear: () => void;
}

const TYPE_FILTERS: { label: string; value: KnowledgeType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'PDFs', value: 'pdf' },
  { label: 'Screenshots', value: 'image' },
  { label: 'Web Pages', value: 'url' },
  { label: 'Notes', value: 'note' },
  { label: 'GitHub', value: 'github' },
];

export default function AdvancedSearch({ onResults, onClear }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<KnowledgeType | 'all'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [useSemanticSearch, setUseSemanticSearch] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Get search suggestions
    const getSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    };

    const debounce = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    // Handle clicks outside search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          type: typeFilter,
          limit: 20,
          semantic: useSemanticSearch
        })
      });

      const data = await response.json();

      if (data.results) {
        onResults(data.results);

        // Save to recent searches
        const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recent-searches', JSON.stringify(newRecent));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search your knowledge... (try semantic search!)"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white/60 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Options */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setUseSemanticSearch(!useSemanticSearch)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${useSemanticSearch
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-white/40 hover:text-white/60'
                }`}
            >
              <Sparkles className="w-3 h-3" />
              Semantic Search
            </button>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-start gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${typeFilter === filter.value
                ? 'bg-violet-600 text-white'
                : 'bg-white/[0.04] text-white/40 hover:text-white/70 border border-white/8'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Button */}
        <div className="flex items-start justify-center">
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-white/40 text-xs">
                  <Tag className="w-3 h-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 py-2 text-white/40 text-xs">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
