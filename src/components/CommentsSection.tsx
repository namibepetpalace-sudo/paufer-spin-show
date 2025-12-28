import { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import CommentCard from './CommentCard';
import RatingStars from './RatingStars';

interface CommentsSectionProps {
  movieId: number;
  mediaType: 'movie' | 'tv';
  movieTitle?: string;
}

const CommentsSection = ({ movieId, mediaType, movieTitle }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const { comments, loading, submitting, addComment, toggleLike } = useComments(movieId, mediaType);
  const { user } = useAuth();
  const { unlockAchievement, checkAndUnlockAchievements } = useAchievements();

  const handleSubmit = async () => {
    const success = await addComment(newComment, newRating);
    if (success) {
      setNewComment('');
      setNewRating(0);
      
      // Check for achievements
      await unlockAchievement('first_review');
      await checkAndUnlockAchievements();
    }
  };

  const handleLike = async (commentId: string) => {
    await toggleLike(commentId);
    await unlockAchievement('first_like');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Comentários da Comunidade
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* New Comment Form */}
      {user ? (
        <div className="p-4 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sua avaliação:</span>
            <RatingStars 
              rating={newRating} 
              interactive 
              onChange={setNewRating}
              size="md"
            />
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`O que você achou de ${movieTitle || 'este filme'}?`}
            className="min-h-[80px] resize-none bg-background"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !newComment.trim()}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
          <p className="text-muted-foreground">
            Faça login para deixar seu comentário e avaliação
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum comentário ainda.</p>
          <p className="text-sm">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard 
              key={comment.id} 
              comment={comment} 
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
