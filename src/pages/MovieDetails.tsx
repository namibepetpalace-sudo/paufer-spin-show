import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowLeft, Heart, Play, Calendar, Clock } from "lucide-react";
import { tmdbService } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import WatchProviders from "@/components/WatchProviders";
import CommentsSection from "@/components/CommentsSection";

interface MovieDetailsProps {
  type: 'movie' | 'tv';
}

interface MovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path?: string }[];
  status: string;
}

const MovieDetails = ({ type }: MovieDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return;
      
      try {
        const details = type === 'movie' 
          ? await tmdbService.getMovieDetails(parseInt(id))
          : await tmdbService.getTVDetails(parseInt(id));
        setMovie(details);
        
        // Check if it's in favorites
        if (user) {
          const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('movie_id', parseInt(id))
            .eq('media_type', type)
            .single();
          
          setIsFavorite(!!data);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id, type, user, toast]);

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar aos favoritos.",
        variant: "destructive",
      });
      return;
    }

    if (!movie || !id) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', parseInt(id))
          .eq('media_type', type);
        
        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos",
          description: `${movie.title || movie.name} foi removido dos seus favoritos.`,
        });
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            movie_id: parseInt(id),
            movie_title: movie.title || movie.name || '',
            movie_poster: movie.poster_path,
            media_type: type
          });
        
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos",
          description: `${movie.title || movie.name} foi adicionado aos seus favoritos.`,
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Conteúdo não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name || '';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const runtime = movie.runtime || (movie.episode_run_time?.[0]);
  const backdropUrl = movie.backdrop_path 
    ? tmdbService.getImageUrl(movie.backdrop_path)
    : undefined;
  const posterUrl = tmdbService.getImageUrl(movie.poster_path);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {backdropUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-32 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-auto"
              />
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Title and Actions */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {releaseDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(releaseDate).getFullYear()}</span>
                          </div>
                        )}
                        {runtime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{runtime} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleFavorite}
                        disabled={favoriteLoading}
                        className={isFavorite ? "text-red-500 border-red-500" : ""}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'Favorito' : 'Favoritar'}
                      </Button>
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Assistir
                      </Button>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Overview */}
                  {movie.overview && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  )}

                  {/* Production Companies */}
                  {movie.production_companies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Produção</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.production_companies.map((company) => (
                          <Badge key={company.id} variant="outline">
                            {company.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Status</h3>
                    <Badge variant="secondary">{movie.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Watch Providers Section - Only for logged in users */}
        {user && (
          <div className="container mx-auto px-4 py-8">
            <WatchProviders movieId={parseInt(id!)} mediaType={type} />
          </div>
        )}

        {/* Comments Section */}
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <CommentsSection 
                movieId={parseInt(id!)} 
                mediaType={type}
                movieTitle={title}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;