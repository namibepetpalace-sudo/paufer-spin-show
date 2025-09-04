import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, X } from "lucide-react";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import WatchProviders from "./WatchProviders";
import FavoriteButton from "./FavoriteButton";
import WatchlistButton from "./WatchlistButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDbMovie | null;
}

const MovieModal = ({ isOpen, onClose, movie }: MovieModalProps) => {
  const [details, setDetails] = useState<any>(null);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const [trailerKey, setTrailerKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (movie && isOpen) {
      loadMovieDetails();
    }
  }, [movie, isOpen]);

  const loadMovieDetails = async () => {
    if (!movie) return;
    
    setLoading(true);
    try {
      const type = tmdbService.getMediaType(movie);
      
      // Buscar detalhes
      const movieDetails = type === 'movie' 
        ? await tmdbService.getMovieDetails(movie.id)
        : await tmdbService.getTVDetails(movie.id);
      
      // Buscar gêneros
      const allGenres = type === 'movie'
        ? await tmdbService.getMovieGenres()
        : await tmdbService.getTVGenres();
      
      // Buscar trailer
      const trailers = type === 'movie'
        ? await tmdbService.getMovieTrailers(movie.id)
        : await tmdbService.getTVTrailers(movie.id);
      
      const youtubeTrailer = trailers.results?.find(
        (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
      );
      
      setDetails(movieDetails);
      setGenres(allGenres);
      setTrailerKey(youtubeTrailer?.key || "");
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes do filme");
    } finally {
      setLoading(false);
    }
  };

  if (!movie) return null;

  const movieGenres = details?.genres || [];
  const runtime = details?.runtime || details?.episode_run_time?.[0];
  const releaseDate = tmdbService.getReleaseDate(movie);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="pr-8">{tmdbService.getTitle(movie)}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header com poster e informações básicas */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <img
                  src={tmdbService.getImageUrl(movie.poster_path)}
                  alt={tmdbService.getTitle(movie)}
                  className="w-48 h-72 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  
                  {releaseDate && (
                    <>
                      <Calendar className="h-4 w-4 ml-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {tmdbService.formatReleaseYear(releaseDate)}
                      </span>
                    </>
                  )}
                  
                  {runtime && (
                    <>
                      <Clock className="h-4 w-4 ml-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{runtime} min</span>
                    </>
                  )}
                </div>

                {movieGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movieGenres.map((genre: any) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {details?.overview && (
                  <p className="text-muted-foreground leading-relaxed">
                    {details.overview}
                  </p>
                )}

                <div className="flex gap-3">
                  <FavoriteButton 
                    movie={movie} 
                    variant="outline" 
                    size="default"
                    showText={true}
                  />
                  <WatchlistButton 
                    movie={movie} 
                    variant="outline" 
                    size="default"
                    showText={true}
                  />
                </div>
              </div>
            </div>

            {/* Trailer */}
            {trailerKey && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Trailer</h3>
                <div className="aspect-video">
                  <iframe
                    src={tmdbService.getYouTubeTrailerUrl(trailerKey)}
                    title="Trailer"
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Onde assistir */}
            {user && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Onde Assistir</h3>
                <WatchProviders 
                  movieId={movie.id} 
                  mediaType={tmdbService.getMediaType(movie)} 
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;