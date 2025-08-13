import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

interface Favorite {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  media_type: 'movie' | 'tv';
  created_at: string;
}

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFavorites((data || []) as Favorite[]);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus favoritos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, navigate, toast]);

  const handleMovieClick = (favorite: Favorite) => {
    navigate(`/${favorite.media_type}/${favorite.movie_id}`);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removido dos favoritos",
        description: "Item removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold">Meus Favoritos</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'item' : 'itens'}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Comece adicionando filmes e séries aos seus favoritos!
            </p>
            <Button onClick={() => navigate('/')}>
              Explorar conteúdo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <div onClick={() => handleMovieClick(favorite)}>
                  <MovieCard
                    id={favorite.movie_id}
                    title={favorite.movie_title}
                    posterPath={favorite.movie_poster}
                    rating={0}
                    year=""
                    genre=""
                    type={favorite.media_type}
                    movie={{
                      id: favorite.movie_id,
                      title: favorite.movie_title,
                      poster_path: favorite.movie_poster,
                      vote_average: 0,
                      genre_ids: [],
                      media_type: favorite.media_type
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4 fill-current" />
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