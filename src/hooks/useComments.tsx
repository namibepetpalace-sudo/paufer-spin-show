import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Comment {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: string;
  rating: number | null;
  comment: string | null;
  status: string;
  created_at: string;
  likes_count: number;
  user_display_name?: string;
  user_avatar?: string;
  is_liked_by_user?: boolean;
}

export const useComments = (movieId: number, mediaType: 'movie' | 'tv') => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch approved comments for this movie
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId)
        .eq('media_type', mediaType)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setComments([]);
        return;
      }

      // Get user profiles for these reviews
      const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))];
      
      let profilesMap: Record<string, { display_name: string; avatar_url: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.user_id] = {
              display_name: p.display_name || 'Usuário',
              avatar_url: p.avatar_url || ''
            };
          });
        }
      }

      // Check which comments the current user has liked
      let userLikes: Set<string> = new Set();
      if (user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('review_id')
          .eq('user_id', user.id);
        
        if (likesData) {
          userLikes = new Set(likesData.map(l => l.review_id));
        }
      }

      // Combine all data
      const enrichedComments: Comment[] = reviewsData.map(review => ({
        id: review.id,
        user_id: review.user_id || '',
        movie_id: review.movie_id,
        media_type: review.media_type,
        rating: review.rating,
        comment: review.comment,
        status: review.status || 'pending',
        created_at: review.created_at || '',
        likes_count: review.likes_count || 0,
        user_display_name: profilesMap[review.user_id || '']?.display_name || 'Usuário',
        user_avatar: profilesMap[review.user_id || '']?.avatar_url || '',
        is_liked_by_user: userLikes.has(review.id)
      }));

      setComments(enrichedComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId, mediaType, user]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (comment: string, rating: number) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para comentar.',
        variant: 'destructive'
      });
      return false;
    }

    if (!comment.trim()) {
      toast({
        title: 'Comentário vazio',
        description: 'Escreva algo antes de enviar.',
        variant: 'destructive'
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          movie_id: movieId,
          media_type: mediaType,
          comment: comment.trim(),
          rating,
          status: 'approved' // Auto-approve for now
        });

      if (error) throw error;

      toast({
        title: 'Comentário enviado!',
        description: 'Seu comentário foi publicado.'
      });

      await loadComments();
      return true;
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o comentário.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para curtir.',
        variant: 'destructive'
      });
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const isLiked = comment.is_liked_by_user;

    // Optimistic update
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { 
            ...c, 
            is_liked_by_user: !isLiked, 
            likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1 
          }
        : c
    ));

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('comment_likes')
          .delete()
          .eq('review_id', commentId)
          .eq('user_id', user.id);

        // Update likes count
        await supabase
          .from('reviews')
          .update({ likes_count: Math.max(0, comment.likes_count - 1) })
          .eq('id', commentId);
      } else {
        // Add like
        await supabase
          .from('comment_likes')
          .insert({
            review_id: commentId,
            user_id: user.id
          });

        // Update likes count
        await supabase
          .from('reviews')
          .update({ likes_count: comment.likes_count + 1 })
          .eq('id', commentId);
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
      // Revert optimistic update
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, is_liked_by_user: isLiked, likes_count: comment.likes_count }
          : c
      ));
    }
  };

  return {
    comments,
    loading,
    submitting,
    addComment,
    toggleLike,
    refresh: loadComments
  };
};
