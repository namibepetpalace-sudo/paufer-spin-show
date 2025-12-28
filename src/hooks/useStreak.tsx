import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useStreak = () => {
  const [streak, setStreak] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadStreak = useCallback(async () => {
    if (!user) {
      setStreak({ current_streak: 0, longest_streak: 0, last_activity_date: null });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak({
          current_streak: data.current_streak || 0,
          longest_streak: data.longest_streak || 0,
          last_activity_date: data.last_activity_date
        });
      }
    } catch (error) {
      console.error('Erro ao carregar streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if streak record exists
      const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingStreak) {
        // Create new streak
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        setStreak({ current_streak: 1, longest_streak: 1, last_activity_date: today });
        return { isNewStreak: true, streakDays: 1 };
      }

      const lastDate = existingStreak.last_activity_date;
      
      // Already logged in today
      if (lastDate === today) {
        return { isNewStreak: false, streakDays: existingStreak.current_streak };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak: number;
      let isNewStreak = false;

      if (lastDate === yesterdayStr) {
        // Consecutive day - increase streak
        newStreak = existingStreak.current_streak + 1;
        isNewStreak = true;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, existingStreak.longest_streak || 0);

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setStreak({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today
      });

      return { isNewStreak, streakDays: newStreak };
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
      return null;
    }
  }, [user]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Auto-update streak when user loads the app
  useEffect(() => {
    if (user && !loading) {
      updateStreak();
    }
  }, [user, loading, updateStreak]);

  return {
    streak,
    loading,
    updateStreak,
    refresh: loadStreak
  };
};
