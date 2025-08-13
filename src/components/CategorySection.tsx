import { useState, useEffect } from "react";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface CategorySectionProps {
  title: string;
  fetchFunction: () => Promise<TMDbMovie[]>;
}

const CategorySection = ({ title, fetchFunction }: CategorySectionProps) => {
  const [movies, setMovies] = useState<TMDbMovie[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const [moviesData, movieGenres, tvGenres] = await Promise.all([
        fetchFunction(),
        tmdbService.getMovieGenres(),
        tmdbService.getTVGenres()
      ]);
      
      setMovies(moviesData.slice(0, 12)); // Limitar a 12 itens por categoria
      setGenres([...movieGenres, ...tvGenres]);
    } catch (error) {
      console.error(`Erro ao carregar ${title}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64 mb-3"></div>
              <div className="bg-muted rounded h-4 mb-2"></div>
              <div className="bg-muted rounded h-3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={tmdbService.getTitle(movie)}
            posterPath={movie.poster_path}
            rating={movie.vote_average}
            year={tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie))}
            genre={tmdbService.getGenreName(movie.genre_ids, genres)}
            type={tmdbService.getMediaType(movie)}
            movie={movie}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;