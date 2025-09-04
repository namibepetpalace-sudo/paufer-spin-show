import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { TMDbMovie } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  movie: TMDbMovie;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

const FavoriteButton = ({ 
  movie, 
  variant = "outline", 
  size = "default", 
  className,
  showText = true 
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isMovieFavorite = isFavorite(movie.id, movie.media_type || 'movie');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(movie);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        isMovieFavorite 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
          : "hover:bg-red-50 hover:text-red-600 hover:border-red-300",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4", 
          showText && "mr-2",
          isMovieFavorite && "fill-current"
        )} 
      />
      {showText && (isMovieFavorite ? "Favoritado" : "Favoritar")}
    </Button>
  );
};

export default FavoriteButton;