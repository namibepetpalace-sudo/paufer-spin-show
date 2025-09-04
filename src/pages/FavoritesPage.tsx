import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { tmdbService, TMDbMovie } from "@/lib/tmdb";

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleRemove = async (movieId: number, mediaType: string) => {
    await removeFromFavorites(movieId, mediaType);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meus Favoritos</h1>
              <p className="text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'favorito' : 'favoritos'}
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Adicione filmes e séries aos seus favoritos para criar sua coleção pessoal!
            </p>
            <Button onClick={() => navigate('/')}>
              Explorar Catálogo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="relative group">
                <MovieCard
                  id={item.movie_id}
                  title={item.movie_title}
                  posterPath={item.movie_poster}
                  rating={0}
                  year=""
                  genre=""
                  type={item.media_type as 'movie' | 'tv'}
                  movie={{
                    id: item.movie_id,
                    title: item.movie_title,
                    poster_path: item.movie_poster,
                    vote_average: 0,
                    genre_ids: [],
                    media_type: item.media_type as 'movie' | 'tv'
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(item.movie_id, item.media_type)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;