import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/useStreak';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StreakBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const StreakBadge = ({ size = 'md', showDetails = false, className }: StreakBadgeProps) => {
  const { streak, loading } = useStreak();

  if (loading) return null;
  if (streak.current_streak === 0) return null;

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-base gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        'shadow-lg shadow-orange-500/30',
        'animate-pulse-slow',
        sizeClasses[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], 'animate-bounce')} />
      <span>{streak.current_streak}</span>
    </div>
  );

  if (showDetails) {
    return (
      <div className="flex flex-col items-center gap-2">
        {badge}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {streak.current_streak} dias seguidos! 🔥
          </p>
          <p className="text-xs text-muted-foreground">
            Recorde: {streak.longest_streak} dias
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">🔥 Streak de {streak.current_streak} dias!</p>
          <p className="text-xs text-muted-foreground">Recorde: {streak.longest_streak} dias</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakBadge;
