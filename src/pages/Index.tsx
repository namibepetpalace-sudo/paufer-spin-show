import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import CategorySection from "@/components/CategorySection";
import SearchResults from "@/components/SearchResults";
import Roulette from "@/components/Roulette";
import RecommendationSection from "@/components/RecommendationSection";
import OnboardingFlow from "@/components/OnboardingFlow";
import MovieModal from "@/components/MovieModal";
import FilterStatus from "@/components/FilterStatus";
import { tmdbService, TMDbMovie } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { usePersonalization } from "@/hooks/usePersonalization";
import { SearchFilters } from "@/components/SearchFilters";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbMovie[]>([]);
  const [filteredResults, setFilteredResults] = useState<TMDbMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDbMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const { user } = useAuth();
  const { needsOnboarding, trackInteraction } = usePersonalization();
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar onboarding para usuários logados que não completaram
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
    // Para usuários não logados, mostrar onboarding promocional na primeira visita
    else if (!user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, needsOnboarding]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await tmdbService.searchMovies(searchQuery);
      setSearchResults(results);

      // Registra busca como interação do usuário
      if (user && results.length > 0) {
        await trackInteraction({
          movie_id: results[0].id,
          media_type: results[0].media_type || 'movie',
          interaction_type: 'search',
          interaction_data: { query: searchQuery, resultsCount: results.length }
        });
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Para usuários não logados, marca como visto
    if (!user) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  const handleMovieSelect = (movie: TMDbMovie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleApplyFilters = async (filters: any) => {
    setActiveFilters(filters);
    setIsSearching(true);
    
    try {
      let results: TMDbMovie[] = [];
      
      // Use the new advanced filtering method
      if (filters.mediaType === 'korean') {
        results = await tmdbService.getKoreanDramas();
      } else if (filters.mediaType === 'anime') {
        results = await tmdbService.getAnimeContent();
      } else if (filters.mediaType === 'documentary') {
        results = await tmdbService.getDocumentaries();
      } else {
        // Use the searchByFilters method for better filtering
        results = await tmdbService.searchByFilters(filters);
      }

      setFilteredResults(results);
      setSearchResults([]); // Clear search results when showing filtered results
      
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setFilteredResults([]);
  };

  const handleClearFilter = (key: keyof SearchFilters) => {
    if (!activeFilters) return;
    
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    
    if (Object.keys(newFilters).length === 0) {
      setActiveFilters(null);
      setFilteredResults([]);
    } else {
      handleApplyFilters(newFilters);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearchResults={(results: any) => {
          setSearchResults(results);
          setFilteredResults([]); // Clear filtered results when new search is made
          setActiveFilters(null);
        }}
        onMovieSelect={handleMovieSelect}
        onApplyFilters={handleApplyFilters}
      />
      
      <OnboardingFlow 
        isOpen={showOnboarding} 
        onClose={handleOnboardingClose} 
      />
      
      {/* Filter Status Bar */}
      <FilterStatus 
        activeFilters={activeFilters}
        onClearFilters={handleClearFilters}
        onClearFilter={handleClearFilter}
        resultCount={filteredResults.length > 0 ? filteredResults.length : undefined}
      />
      
      <main>
        <HeroSection />
        

        {searchResults.length > 0 ? (
          <SearchResults results={searchResults} genres={[]} />
        ) : filteredResults.length > 0 ? (
          <div className="px-4">
            <div className="container mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Resultados dos Filtros
                </h2>
                <p className="text-muted-foreground">
                  {filteredResults.length} resultado(s) encontrado(s)
                </p>
              </div>
              <SearchResults results={filteredResults} genres={[]} />
            </div>
          </div>
        ) : isSearching ? (
          <div className="px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Aplicando filtros...</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeFilters ? (
          <div className="px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground max-w-md">
                    Não encontramos nenhum filme ou série com os filtros aplicados. 
                    Tente ajustar seus critérios de busca.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Seções de Categorias */
          <div className="space-y-12 px-4">
            <RecommendationSection />
            <TrendingSection />
            
            <CategorySection 
              title="🔥 Filmes Populares"
              fetchFunction={() => tmdbService.getPopularMovies()}
            />
            
            <CategorySection 
              title="⭐ Filmes Mais Bem Avaliados"
              fetchFunction={() => tmdbService.getTopRatedMovies()}
            />
            
            <CategorySection 
              title="🎬 Em Cartaz nos Cinemas"
              fetchFunction={() => tmdbService.getNowPlayingMovies()}
            />
            
            <CategorySection 
              title="🔜 Próximos Lançamentos"
              fetchFunction={() => tmdbService.getUpcomingMovies()}
            />
            
            <CategorySection 
              title="📺 Séries Populares"
              fetchFunction={() => tmdbService.getPopularTVShows()}
            />
            
            <CategorySection 
              title="⭐ Séries Mais Bem Avaliadas"
              fetchFunction={() => tmdbService.getTopRatedTVShows()}
            />
            
            <CategorySection 
              title="📡 Séries No Ar Hoje"
              fetchFunction={() => tmdbService.getAiringTodayTVShows()}
            />
            
            <CategorySection 
              title="🆕 Séries No Ar"
              fetchFunction={() => tmdbService.getOnTheAirTVShows()}
            />

            {/* Roleta de Filmes */}
            <section className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold gradient-text">
                  🎲 Não sabe o que assistir?
                </h2>
                <p className="text-muted-foreground">
                  Deixe a sorte escolher por você!
                </p>
              </div>
              <Roulette />
            </section>
          </div>
        )}
      </main>
      
      {/* Movie Modal */}
      <MovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movie={selectedMovie}
      />
    </div>
  );
};

export default Index;