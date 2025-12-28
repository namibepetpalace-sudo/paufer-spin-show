import { useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementToast = ({ achievement, onClose }: AchievementToastProps) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
        'animate-in slide-in-from-bottom-10 fade-in duration-500'
      )}
    >
      <div className="relative flex items-center gap-4 p-4 pr-12 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg animate-bounce">
            {achievement.icon}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-500 uppercase tracking-wide">
              Conquista Desbloqueada!
            </span>
          </div>
          <h4 className="font-bold text-foreground">{achievement.name}</h4>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6'][i % 5],
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
