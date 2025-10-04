import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TMDbMovie } from "@/lib/tmdb";

interface UserPreferences {
  favorite_genres: number[];
  preferred_duration: string;
  preferred_rating: string;
  onboarding_completed: boolean;
}

interface UserInteraction {
  movie_id: number;
  media_type: string;
  interaction_type: 'view' | 'click' | 'search' | 'favorite' | 'rating';
  interaction_data?: any;
}

export const usePersonalization = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_genres, preferred_duration, preferred_rating, onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setPreferences(data);
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(newPreferences)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  };

  const completeOnboarding = async (selectedGenres: number[], duration: string = 'any', rating: string = 'any') => {
    return await updatePreferences({
      favorite_genres: selectedGenres,
      preferred_duration: duration,
      preferred_rating: rating,
      onboarding_completed: true
    });
  };

  const trackInteraction = async (interaction: UserInteraction) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          ...interaction
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar interação:', error);
    }
  };

  const addToWatchHistory = async (movie: TMDbMovie) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          movie_id: movie.id,
          media_type: movie.media_type || 'movie',
          movie_title: movie.title || movie.name || '',
          movie_poster: movie.poster_path,
          completed: false
        });

      if (error) throw error;

      // Também registra como interação
      await trackInteraction({
        movie_id: movie.id,
        media_type: movie.media_type || 'movie',
        interaction_type: 'view'
      });
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
    }
  };

  const rateMovie = async (movieId: number, mediaType: string, rating: number, review?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          movie_id: movieId,
          media_type: mediaType,
          rating,
          review
        });

      if (error) throw error;

      // Registra como interação
      await trackInteraction({
        movie_id: movieId,
        media_type: mediaType,
        interaction_type: 'rating',
        interaction_data: { rating, review }
      });

      return true;
    } catch (error) {
      console.error('Erro ao avaliar filme:', error);
      return false;
    }
  };

  const getPersonalizedRecommendations = async (): Promise<number[]> => {
    if (!user || !preferences?.favorite_genres.length) {
      return [];
    }

    try {
      // Busca interações recentes para entender comportamento
      const { data: recentInteractions } = await supabase
        .from('user_interactions')
        .select('movie_id, interaction_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Busca avaliações para entender preferências
      const { data: ratings } = await supabase
        .from('user_ratings')
        .select('movie_id, rating')
        .eq('user_id', user.id)
        .gte('rating', 4); // Apenas filmes bem avaliados

      // Combina gêneros favoritos com filmes bem avaliados
      const likedMovies = ratings?.map(r => r.movie_id) || [];
      const viewedMovies = recentInteractions?.map(r => r.movie_id) || [];

      return [...new Set([...likedMovies, ...viewedMovies])];
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      return [];
    }
  };

  const saveGenrePreferences = async (genreIds: number[]) => {
    return await updatePreferences({
      favorite_genres: genreIds,
      onboarding_completed: true
    });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    completeOnboarding,
    trackInteraction,
    addToWatchHistory,
    rateMovie,
    getPersonalizedRecommendations,
    saveGenrePreferences,
    needsOnboarding: !preferences?.onboarding_completed && !!user
  };
};