import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TMDbMovie } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";

interface FavoriteItem {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  media_type: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (movie: TMDbMovie) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar favoritos",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title || movie.name || '',
          movie_poster: movie.poster_path,
          media_type: movie.media_type || 'movie'
        });

      if (error) throw error;

      toast({
        title: "Adicionado aos favoritos",
        description: `${movie.title || movie.name} foi adicionado aos seus favoritos`,
      });

      await loadFavorites();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já está nos favoritos",
          description: "Este item já está na sua lista de favoritos",
          variant: "destructive"
        });
      } else {
        console.error('Erro ao adicionar favorito:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar aos favoritos",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const removeFromFavorites = async (movieId: number, mediaType: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType);

      if (error) throw error;

      toast({
        title: "Removido dos favoritos",
        description: "Item removido da sua lista de favoritos",
      });

      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover dos favoritos",
        variant: "destructive"
      });
      return false;
    }
  };

  const isFavorite = (movieId: number, mediaType: string = 'movie') => {
    return favorites.some(fav => 
      fav.movie_id === movieId && fav.media_type === mediaType
    );
  };

  const toggleFavorite = async (movie: TMDbMovie) => {
    const movieId = movie.id;
    const mediaType = movie.media_type || 'movie';
    
    if (isFavorite(movieId, mediaType)) {
      return await removeFromFavorites(movieId, mediaType);
    } else {
      return await addToFavorites(movie);
    }
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites
  };
};