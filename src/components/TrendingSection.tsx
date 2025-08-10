import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";

interface TrendingSectionProps {
  onMovieSelect?: (movie: any) => void;
}

const TrendingSection = ({ onMovieSelect }: TrendingSectionProps) => {
  const [trendingMovies, setTrendingMovies] = useState<TMDbMovie[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendingData = async () => {
      try {
        const [trending, movieGenres, tvGenres] = await Promise.all([
          tmdbService.getTrending('week'),
          tmdbService.getMovieGenres(),
          tmdbService.getTVGenres()
        ]);
        
        setTrendingMovies(trending.slice(0, 18));
        setGenres([...movieGenres, ...tvGenres]);
      } catch (error) {
        console.error('Erro ao carregar dados da TMDb:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingData();
  }, []);

  const handleMovieClick = (movie: TMDbMovie) => {
    if (onMovieSelect) {
      onMovieSelect({
        id: movie.id,
        title: tmdbService.getTitle(movie),
        posterPath: movie.poster_path,
        rating: movie.vote_average,
        year: tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie)),
        genre: tmdbService.getGenreName(movie.genre_ids, genres),
        type: tmdbService.getMediaType(movie)
      });
    }
  };
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-streaming-blue">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Em Alta Esta Semana</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl h-64 mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))
          ) : (
            trendingMovies.map((movie) => (
              <div key={movie.id} onClick={() => handleMovieClick(movie)}>
                <MovieCard
                  id={movie.id}
                  title={tmdbService.getTitle(movie)}
                  posterPath={tmdbService.getImageUrl(movie.poster_path)}
                  rating={movie.vote_average}
                  year={tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie))}
                  genre={tmdbService.getGenreName(movie.genre_ids, genres)}
                  type={tmdbService.getMediaType(movie)}
                />
              </div>
            ))
          )}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Ver Mais Tendências
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;