import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Info } from "lucide-react";
import { TMDbMovie } from "@/lib/tmdb";
import MovieModal from "./MovieModal";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating: number;
  year: string;
  genre: string;
  type: 'movie' | 'tv';
  movie: TMDbMovie;
}

const MovieCard = ({ id, title, posterPath, rating, year, genre, type, movie }: MovieCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : `https://via.placeholder.com/300x450/1a1a2e/eee?text=Sem+Imagem`;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card/50 backdrop-blur border-border/50"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay com botões */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button 
                size="sm"
                className="bg-netflix-red hover:bg-netflix-red/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                <Info className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
                {title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{year}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {genre}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {type === 'movie' ? 'Filme' : 'Série'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MovieModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movie={movie}
      />
    </>
  );
};

export default MovieCard;