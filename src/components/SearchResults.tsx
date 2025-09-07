import { TMDbMovie, TMDbGenre, tmdbService } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { Search } from "lucide-react";

interface SearchResultsProps {
  results: TMDbMovie[];
  genres: TMDbGenre[];
  onMovieSelect?: (movie: any) => void;
}

const SearchResults = ({ results, genres, onMovieSelect }: SearchResultsProps) => {
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

  if (results.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Search className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Resultados da Busca</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Encontrados
            </div>
            <div className="text-2xl font-bold text-primary">
              {results.length.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              resultados
            </div>
          </div>
        </div>
        
        {/* Search Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {results.map((movie) => (
            <div key={movie.id} onClick={() => handleMovieClick(movie)}>
              <MovieCard
                id={movie.id}
                title={tmdbService.getTitle(movie)}
                posterPath={movie.poster_path}
                rating={movie.vote_average}
                year={tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie))}
                genre={tmdbService.getGenreName(movie.genre_ids, genres)}
                type={tmdbService.getMediaType(movie)}
                movie={movie}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchResults;