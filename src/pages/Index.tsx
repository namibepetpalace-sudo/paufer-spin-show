import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { BottomNav } from "@/components/BottomNav";
import TrendingSection from "@/components/TrendingSection";
import CategorySection from "@/components/CategorySection";
import SearchResults from "@/components/SearchResults";
import Roulette from "@/components/Roulette";
import RecommendationSection from "@/components/RecommendationSection";
import OnboardingFlow from "@/components/OnboardingFlow";
import MovieModal from "@/components/MovieModal";
import FilterStatus from "@/components/FilterStatus";
import LoadingStats from "@/components/LoadingStats";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { usePersonalization } from "@/hooks/usePersonalization";
import { SearchFilters } from "@/components/SearchFilters";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbMovie[]>([]);
  const [filteredResults, setFilteredResults] = useState<TMDbMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDbMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState({ totalPages: 0, searchType: "" });
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const { user } = useAuth();
  const { needsOnboarding, trackInteraction } = usePersonalization();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o onboarding já foi mostrado nesta sessão
    const onboardingShown = sessionStorage.getItem('onboarding_shown');
    
    // Mostrar onboarding apenas para usuários logados que não completaram o onboarding
    // E que não viram nesta sessão
    if (user && needsOnboarding && !onboardingShown) {
      setShowOnboarding(true);
      sessionStorage.setItem('onboarding_shown', 'true');
    }
    
    // Load genres on mount
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
  }, [user, needsOnboarding]);

  // Centralized search function
  const handleSearch = async (query: string) => {
    console.log('🔍 Starting search for:', query);
    if (!query.trim()) return;

    setSearchQuery(query);
    setIsSearching(true);
    setFilteredResults([]); // Clear filtered results
    setActiveFilters(null); // Clear active filters
    
    try {
      const results = await tmdbService.searchMovies(query);
      console.log('✅ Search results:', results.length, 'items');
      setSearchResults(results);

      // Registra busca como interação do usuário
      if (user && results.length > 0) {
        await trackInteraction({
          movie_id: results[0].id,
          media_type: results[0].media_type || 'movie',
          interaction_type: 'search',
          interaction_data: { query, resultsCount: results.length }
        });
      }
    } catch (error) {
      console.error("❌ Erro na busca:", error);
      toast({
        title: "❌ Erro na Busca",
        description: "Não foi possível realizar a busca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
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
      
      // Use the new advanced filtering method with multiple pages
      if (filters.mediaType === 'korean') {
        const response = await tmdbService.getKoreanDramas(1000);
        results = response.results;
        setLoadingStats({ totalPages: 50, searchType: "K-Dramas" });
      } else if (filters.mediaType === 'anime') {
        const response = await tmdbService.getAnimeContent(1000);
        results = response.results;
        setLoadingStats({ totalPages: response.totalResults, searchType: "Animes" });
      } else if (filters.mediaType === 'documentary') {
        const response = await tmdbService.getDocumentaries(1000);
        results = response.results;
        setLoadingStats({ totalPages: 50, searchType: "Documentários" });
      } else if (filters.mediaType === 'bollywood') {
        const response = await tmdbService.searchByFilters({ ...filters, mediaType: 'bollywood' }, 1000);
        results = response.results;
        setLoadingStats({ totalPages: response.totalPages, searchType: "Filmes Bollywood" });
      } else if (filters.mediaType === 'chinese') {
        const response = await tmdbService.searchByFilters({ ...filters, mediaType: 'chinese' }, 1000);
        results = response.results;
        setLoadingStats({ totalPages: response.totalPages, searchType: "Dramas Chineses" });
      } else {
        // Use the searchByFilters method for better filtering
        const response = await tmdbService.searchByFilters(filters, 1000);
        results = response.results;
        setLoadingStats({ totalPages: response.totalPages, searchType: "Filmes e Séries" });
      }

      setFilteredResults(results);
      setSearchResults([]); // Clear search results when showing filtered results
      
      // Show success toast
      toast({
        title: "🎉 Busca Avançada Concluída!",
        description: `${results.length.toLocaleString()} ${loadingStats.searchType.toLowerCase()} encontrados com múltiplas páginas da API.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
      toast({
        title: "❌ Erro na Busca",
        description: "Não foi possível carregar os resultados. Tente novamente.",
        variant: "destructive",
      });
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
        onSearch={handleSearch}
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
        
        {/* Seção Como Funciona */}
        <section id="como-funciona" className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
              Como Funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">1. Escolha seus Gêneros</h3>
                <p className="text-muted-foreground">Selecione os gêneros de filmes e séries que mais gosta para personalizar suas recomendações</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-5xl mb-4">🎰</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">2. Gire a Roleta</h3>
                <p className="text-muted-foreground">Deixe a sorte escolher seu próximo filme ou série para assistir com nossa roleta mágica</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">3. Descubra e Salve</h3>
                <p className="text-muted-foreground">Favorite os conteúdos que mais gostou e adicione à sua lista para assistir depois</p>
              </div>
            </div>
          </div>
        </section>
        

        {searchResults.length > 0 ? (
          <SearchResults results={searchResults} genres={genres} />
        ) : filteredResults.length > 0 ? (
          <>
            <LoadingStats 
              isLoading={false} 
              resultCount={filteredResults.length}
              totalPages={loadingStats.totalPages}
              searchType={loadingStats.searchType}
            />
            <div className="px-4">
              <div className="container mx-auto">
                <SearchResults results={filteredResults} genres={genres} />
              </div>
            </div>
          </>
        ) : isSearching ? (
          <LoadingStats 
            isLoading={true}
          />
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

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;