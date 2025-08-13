import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import CategorySection from "@/components/CategorySection";
import SearchResults from "@/components/SearchResults";
import Roulette from "@/components/Roulette";
import { tmdbService } from "@/lib/tmdb";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await tmdbService.searchMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchResults={(results: any) => setSearchResults(results)} />
      
      <main>
        <HeroSection />
        
        {/* Barra de pesquisa centralizada */}
        <section className="px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Pesquise por filmes e séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>

        {searchResults.length > 0 ? (
          <SearchResults results={searchResults} genres={[]} />
        ) : (
          /* Seções de Categorias */
          <div className="space-y-12 px-4">
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