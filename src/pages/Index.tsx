import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import SearchResults from "@/components/SearchResults";
import { useState, useEffect } from "react";
import { TMDbMovie, TMDbGenre, tmdbService } from "@/lib/tmdb";

const Index = () => {
  const [searchResults, setSearchResults] = useState<TMDbMovie[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getTVGenres()
        ]);
        setGenres([...movieGenres, ...tvGenres]);
      } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
      }
    };

    loadGenres();
  }, []);

  const handleSearchResults = (results: TMDbMovie[]) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchResults={handleSearchResults} />
      <main>
        <HeroSection />
        {searchResults.length > 0 ? (
          <SearchResults 
            results={searchResults} 
            genres={genres}
          />
        ) : (
          <TrendingSection />
        )}
      </main>
    </div>
  );
};

export default Index;
