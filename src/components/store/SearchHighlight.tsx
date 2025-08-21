import React from 'react';
import { cn } from '@/lib/utils';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerm,
  className,
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 font-medium"
}) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex to find all occurrences of the search term (case insensitive)
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={cn("bg-transparent", highlightClassName)}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  suggestions,
  onSuggestionClick,
  className
}) => {
  if (!suggestions.length || !query) {
    return null;
  }

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto",
      className
    )}>
      <div className="p-2 text-xs text-muted-foreground border-b">
        Suggestions
      </div>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors focus:bg-muted focus:outline-none"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <SearchHighlight 
            text={suggestion} 
            searchTerm={query}
            highlightClassName="bg-primary/20 font-medium"
          />
        </button>
      ))}
    </div>
  );
};

interface RecentSearchesProps {
  searches: string[];
  onSearchClick: (search: string) => void;
  onClearSearches: () => void;
  className?: string;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchClick,
  onClearSearches,
  className
}) => {
  if (!searches.length) {
    return null;
  }

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50",
      className
    )}>
      <div className="flex justify-between items-center p-2 border-b">
        <span className="text-xs text-muted-foreground">Recent Searches</span>
        <button
          onClick={onClearSearches}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>
      {searches.slice(0, 5).map((search, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors focus:bg-muted focus:outline-none"
          onClick={() => onSearchClick(search)}
        >
          {search}
        </button>
      ))}
    </div>
  );
};