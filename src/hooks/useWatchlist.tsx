import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TMDbMovie } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  media_type: string;
  created_at: string;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Erro ao carregar watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movie: TMDbMovie) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar à sua lista",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title || movie.name || '',
          movie_poster: movie.poster_path,
          media_type: movie.media_type || 'movie'
        });

      if (error) throw error;

      toast({
        title: "Adicionado à watchlist",
        description: `${movie.title || movie.name} foi adicionado à sua lista para assistir`,
      });

      await loadWatchlist();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já está na watchlist",
          description: "Este item já está na sua lista para assistir",
          variant: "destructive"
        });
      } else {
        console.error('Erro ao adicionar à watchlist:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar à watchlist",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const removeFromWatchlist = async (movieId: number, mediaType: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType);

      if (error) throw error;

      toast({
        title: "Removido da watchlist",
        description: "Item removido da sua lista para assistir",
      });

      await loadWatchlist();
      return true;
    } catch (error) {
      console.error('Erro ao remover da watchlist:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover da watchlist",
        variant: "destructive"
      });
      return false;
    }
  };

  const isInWatchlist = (movieId: number, mediaType: string = 'movie') => {
    return watchlist.some(item => 
      item.movie_id === movieId && item.media_type === mediaType
    );
  };

  const toggleWatchlist = async (movie: TMDbMovie) => {
    const movieId = movie.id;
    const mediaType = movie.media_type || 'movie';
    
    if (isInWatchlist(movieId, mediaType)) {
      return await removeFromWatchlist(movieId, mediaType);
    } else {
      return await addToWatchlist(movie);
    }
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    refreshWatchlist: loadWatchlist
  };
};