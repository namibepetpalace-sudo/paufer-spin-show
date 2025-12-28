import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export const ACHIEVEMENTS_CONFIG: Record<string, { name: string; description: string; icon: string }> = {
  'first_spin': {
    name: 'Primeiro Giro',
    description: 'Use a roleta pela primeira vez',
    icon: '🎰'
  },
  'first_favorite': {
    name: 'Primeiro Amor',
    description: 'Adicione seu primeiro favorito',
    icon: '❤️'
  },
  'first_review': {
    name: 'Crítico Iniciante',
    description: 'Deixe sua primeira avaliação',
    icon: '⭐'
  },
  'five_reviews': {
    name: 'Crítico Experiente',
    description: 'Deixe 5 avaliações',
    icon: '🎬'
  },
  'ten_favorites': {
    name: 'Colecionador',
    description: 'Tenha 10 filmes favoritos',
    icon: '📚'
  },
  'streak_7': {
    name: 'Maratonista',
    description: 'Mantenha um streak de 7 dias',
    icon: '🔥'
  },
  'streak_30': {
    name: 'Dedicado',
    description: 'Mantenha um streak de 30 dias',
    icon: '🏆'
  },
  'watchlist_10': {
    name: 'Planejador',
    description: 'Adicione 10 itens à watchlist',
    icon: '📝'
  },
  'first_like': {
    name: 'Apoiador',
    description: 'Curta seu primeiro comentário',
    icon: '👍'
  },
  'popular_review': {
    name: 'Influenciador',
    description: 'Receba 10 likes em um comentário',
    icon: '🌟'
  }
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const { user } = useAuth();

  const loadAchievements = useCallback(async () => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const unlockedTypes = new Set(data?.map(a => a.achievement_type) || []);

      const allAchievements: Achievement[] = Object.entries(ACHIEVEMENTS_CONFIG).map(([type, config]) => ({
        id: type,
        type,
        ...config,
        unlocked: unlockedTypes.has(type),
        unlocked_at: data?.find(a => a.achievement_type === type)?.unlocked_at
      }));

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unlockAchievement = useCallback(async (achievementType: string): Promise<boolean> => {
    if (!user) return false;

    // Check if already unlocked
    const existing = achievements.find(a => a.type === achievementType);
    if (existing?.unlocked) return false;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_type: achievementType
        });

      if (error) {
        // Likely duplicate, ignore
        if (error.code === '23505') return false;
        throw error;
      }

      const config = ACHIEVEMENTS_CONFIG[achievementType];
      if (config) {
        const newAch: Achievement = {
          id: achievementType,
          type: achievementType,
          ...config,
          unlocked: true,
          unlocked_at: new Date().toISOString()
        };
        
        setNewAchievement(newAch);
        setAchievements(prev => prev.map(a => 
          a.type === achievementType ? { ...a, unlocked: true, unlocked_at: new Date().toISOString() } : a
        ));
        
        // Auto-clear after 5 seconds
        setTimeout(() => setNewAchievement(null), 5000);
      }

      return true;
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
      return false;
    }
  }, [user, achievements]);

  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Check favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (favoritesCount && favoritesCount >= 1) {
        await unlockAchievement('first_favorite');
      }
      if (favoritesCount && favoritesCount >= 10) {
        await unlockAchievement('ten_favorites');
      }

      // Check reviews count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (reviewsCount && reviewsCount >= 1) {
        await unlockAchievement('first_review');
      }
      if (reviewsCount && reviewsCount >= 5) {
        await unlockAchievement('five_reviews');
      }

      // Check watchlist count
      const { count: watchlistCount } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (watchlistCount && watchlistCount >= 10) {
        await unlockAchievement('watchlist_10');
      }

      // Check likes given
      const { count: likesCount } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (likesCount && likesCount >= 1) {
        await unlockAchievement('first_like');
      }

      // Check streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakData?.current_streak >= 7) {
        await unlockAchievement('streak_7');
      }
      if (streakData?.current_streak >= 30) {
        await unlockAchievement('streak_30');
      }

      // Check if user has a popular review
      const { data: popularReview } = await supabase
        .from('reviews')
        .select('likes_count')
        .eq('user_id', user.id)
        .gte('likes_count', 10)
        .limit(1);

      if (popularReview && popularReview.length > 0) {
        await unlockAchievement('popular_review');
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  }, [user, unlockAchievement]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const clearNewAchievement = () => setNewAchievement(null);

  return {
    achievements,
    loading,
    newAchievement,
    unlockAchievement,
    checkAndUnlockAchievements,
    clearNewAchievement,
    refresh: loadAchievements
  };
};
