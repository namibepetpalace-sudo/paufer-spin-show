import { Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import RatingStars from './RatingStars';
import { cn } from '@/lib/utils';
import { Comment } from '@/hooks/useComments';

interface CommentCardProps {
  comment: Comment;
  onLike: (commentId: string) => void;
}

const CommentCard = ({ comment, onLike }: CommentCardProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Agora mesmo' : `${diffMins} minutos atrás`;
      }
      return diffHours === 1 ? '1 hora atrás' : `${diffHours} horas atrás`;
    }
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user_avatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {comment.user_display_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {comment.user_display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {comment.rating && (
              <RatingStars rating={comment.rating} size="sm" />
            )}
          </div>

          {/* Comment Text */}
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            {comment.comment}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className={cn(
                'h-8 px-2 gap-1.5 text-muted-foreground hover:text-primary',
                comment.is_liked_by_user && 'text-red-500 hover:text-red-600'
              )}
            >
              <Heart 
                className={cn(
                  'h-4 w-4 transition-all',
                  comment.is_liked_by_user && 'fill-current scale-110'
                )} 
              />
              <span className="text-xs font-medium">
                {comment.likes_count > 0 ? comment.likes_count : ''}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
