import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Play, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath?: string;
  rating: number;
  year: string;
  genre: string;
  type: 'movie' | 'tv';
}

const MovieCard = ({ id, title, posterPath, rating, year, genre, type }: MovieCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const imageUrl = posterPath || `https://via.placeholder.com/300x450/1a1a2e/eee?text=${encodeURIComponent(title)}`;

  const handleDetailsClick = () => {
    navigate(`/${type}/${id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar aos favoritos.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', id)
          .eq('media_type', type);
        
        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos",
          description: `${title} foi removido dos seus favoritos.`,
        });
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            movie_id: id,
            movie_title: title,
            movie_poster: posterPath,
            media_type: type
          });
        
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos",
          description: `${title} foi adicionado aos seus favoritos.`,
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  return (
    <div className="movie-card group relative rounded-xl overflow-hidden p-4 cursor-pointer">
      {/* Poster Image */}
      <div className="relative overflow-hidden rounded-lg mb-3">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            onClick={handleDetailsClick}
            className="bg-primary hover:bg-primary-glow text-white border-0"
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
            {type === 'movie' ? 'Filme' : 'Série'}
          </span>
        </div>
        
        {/* Favorite Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0 ${
            isFavorite ? 'text-red-500' : 'text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      {/* Movie Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{year}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {genre}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;