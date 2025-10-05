import { Button } from "@/components/ui/button";
import { Bookmark, Plus } from "lucide-react";
import { TMDbMovie } from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  movie: TMDbMovie;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

const WatchlistButton = ({ 
  movie, 
  variant = "outline", 
  size = "default", 
  className,
  showText = true 
}: WatchlistButtonProps) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isMovieInWatchlist = isInWatchlist(movie.id, movie.media_type || 'movie');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWatchlist(movie);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        isMovieInWatchlist 
          ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary" 
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {isMovieInWatchlist ? (
        <Bookmark className={cn("h-4 w-4 fill-current", showText && "mr-2")} />
      ) : (
        <Plus className={cn("h-4 w-4", showText && "mr-2")} />
      )}
      {showText && (isMovieInWatchlist ? "Na Lista" : "Assistir Depois")}
    </Button>
  );
};

export default WatchlistButton;