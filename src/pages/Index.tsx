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
import { tmdbService, TMDbMovie } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { usePersonalization } from "@/hooks/usePersonalization";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchResults={(results: any) => setSearchResults(results)} />
      
      <OnboardingFlow 
        isOpen={showOnboarding} 
        onClose={handleOnboardingClose} 
      />
      
      <main>
        <HeroSection />
        
        {/* Barra de pesquisa centralizada */}
        <section className="px-4 py-8">
          <div className="container mx-auto max-w-2xl">
            <SearchBar 
              onSearchResults={(results: any) => setSearchResults(results)}
              placeholder="O que você quer assistir hoje?"
              className="w-full"
            />
          </div>
        </section>

        {searchResults.length > 0 ? (
          <SearchResults results={searchResults} genres={[]} />
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
    </div>
  );
};

export default Index;