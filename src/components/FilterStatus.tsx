import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw } from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";

interface FilterStatusProps {
  activeFilters: SearchFilters | null;
  onClearFilters: () => void;
  onClearFilter: (key: keyof SearchFilters) => void;
  resultCount?: number;
}

const FilterStatus = ({ activeFilters, onClearFilters, onClearFilter, resultCount }: FilterStatusProps) => {
  if (!activeFilters || Object.keys(activeFilters).length === 0) {
    return null;
  }

  const mediaTypes = [
    { value: "movie", label: "Filmes" },
    { value: "tv", label: "Séries" },
    { value: "anime", label: "Anime" },
    { value: "documentary", label: "Documentários" },
    { value: "korean", label: "K-Dramas" }
  ];

  const genres = [
    { id: "28", name: "Ação" },
    { id: "12", name: "Aventura" },
    { id: "16", name: "Animação" },
    { id: "35", name: "Comédia" },
    { id: "80", name: "Crime" },
    { id: "99", name: "Documentário" },
    { id: "18", name: "Drama" },
    { id: "10751", name: "Família" },
    { id: "14", name: "Fantasia" },
    { id: "36", name: "História" },
    { id: "27", name: "Terror" },
    { id: "10402", name: "Música" },
    { id: "9648", name: "Mistério" },
    { id: "10749", name: "Romance" },
    { id: "878", name: "Ficção Científica" },
    { id: "53", name: "Suspense" },
    { id: "10752", name: "Guerra" },
    { id: "37", name: "Faroeste" }
  ];

  const categories = [
    { value: "popular", label: "Populares" },
    { value: "top_rated", label: "Mais Bem Avaliados" },
    { value: "now_playing", label: "Em Cartaz" },
    { value: "upcoming", label: "Próximos Lançamentos" },
    { value: "trending", label: "Em Alta" }
  ];

  return (
    <div className="px-4 py-3 bg-accent/30 border-b border-border">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">Filtros ativos:</span>
            
            {activeFilters.mediaType && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {mediaTypes.find(t => t.value === activeFilters.mediaType)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearFilter('mediaType')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {activeFilters.genre && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {genres.find(g => g.id === activeFilters.genre)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearFilter('genre')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {activeFilters.category && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {categories.find(c => c.value === activeFilters.category)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearFilter('category')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {activeFilters.year && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {activeFilters.year}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearFilter('year')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {activeFilters.rating && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                ⭐ {activeFilters.rating}.0+
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearFilter('rating')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {resultCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {resultCount} resultado(s)
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterStatus;