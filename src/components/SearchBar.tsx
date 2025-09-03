import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchSuggestion {
  id: number;
  title: string;
  posterPath?: string;
  year?: string;
  type: 'movie' | 'tv';
  rating: number;
}

interface SearchBarProps {
  onSearchResults?: (results: any[]) => void;
  onMovieSelect?: (movie: any) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  onSearchResults, 
  onMovieSelect, 
  placeholder = "Buscar filmes e séries...",
  className = ""
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches and genres on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
    
    // Load genres
    const loadGenres = async () => {
      try {
        const movieGenres = await tmdbService.getMovieGenres();
        const tvGenres = await tmdbService.getTVGenres();
        setGenres([...movieGenres, ...tvGenres]);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    
    loadGenres();
  }, []);

  // Search for suggestions when query changes
  useEffect(() => {
    const searchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await tmdbService.searchMovies(debouncedQuery);
        const suggestions = results.slice(0, 8).map((movie: TMDbMovie) => ({
          id: movie.id,
          title: tmdbService.getTitle(movie),
          posterPath: movie.poster_path,
          year: tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie)),
          type: tmdbService.getMediaType(movie) as 'movie' | 'tv',
          rating: movie.vote_average
        }));
        
        setSuggestions(suggestions);
        
        // Also update search results for parent component
        if (onSearchResults) {
          onSearchResults(results);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchSuggestions();
  }, [debouncedQuery, onSearchResults]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    // Add to recent searches
    const newRecentSearches = [suggestion.title, ...recentSearches.filter(s => s !== suggestion.title)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    // Clear input and close suggestions
    setQuery("");
    setShowSuggestions(false);
    
    // Get full movie data for the modal
    try {
      const fullMovie: TMDbMovie = {
        id: suggestion.id,
        title: suggestion.type === 'movie' ? suggestion.title : undefined,
        name: suggestion.type === 'tv' ? suggestion.title : undefined,
        poster_path: suggestion.posterPath,
        vote_average: suggestion.rating || 0,
        release_date: suggestion.type === 'movie' ? `${suggestion.year}-01-01` : undefined,
        first_air_date: suggestion.type === 'tv' ? `${suggestion.year}-01-01` : undefined,
        genre_ids: [],
        media_type: suggestion.type
      };
      
      // Notify parent component with full movie object
      if (onMovieSelect) {
        onMovieSelect(fullMovie);
      }
    } catch (error) {
      console.error('Error creating movie object:', error);
    }
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-netflix-dark border-netflix-gray focus:ring-netflix-red focus:border-netflix-red"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowSuggestions(false);
              onSearchResults?.([]);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-netflix-dark border border-netflix-gray rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-netflix-gray">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-netflix-light-gray flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Buscas Recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-netflix-red"
                >
                  Limpar
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-netflix-gray rounded-md transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center mb-3 px-2">
                <TrendingUp className="h-4 w-4 mr-2 text-netflix-light-gray" />
                <h3 className="text-sm font-medium text-netflix-light-gray">
                  Sugestões ({suggestions.length})
                </h3>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center space-x-3 p-2 hover:bg-netflix-gray rounded-md transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {suggestion.posterPath ? (
                        <img
                          src={tmdbService.getImageUrl(suggestion.posterPath)}
                          alt={suggestion.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-netflix-gray rounded flex items-center justify-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.type === 'movie' ? 'Filme' : 'Série'} • {suggestion.year} • ⭐ {suggestion.rating ? suggestion.rating.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !isSearching && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;