import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFilters) => void;
  onApplyFilters?: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  genre?: string;
  mediaType?: string;
  year?: string;
  rating?: string;
  category?: string;
}

const SearchFilters = ({ onFiltersChange, onApplyFilters, className = "" }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

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

  const mediaTypes = [
    { value: "movie", label: "Filmes" },
    { value: "tv", label: "Séries" },
    { value: "anime", label: "Anime" },
    { value: "documentary", label: "Documentários" },
    { value: "korean", label: "K-Dramas" }
  ];

  const categories = [
    { value: "popular", label: "Populares" },
    { value: "top_rated", label: "Mais Bem Avaliados" },
    { value: "now_playing", label: "Em Cartaz" },
    { value: "upcoming", label: "Próximos Lançamentos" },
    { value: "trending", label: "Em Alta" }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange?.({});
  };

  const applyFilters = () => {
    onApplyFilters?.(filters);
    setIsOpen(false);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="relative bg-card border-border hover:bg-accent"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-card border-border" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Filtros de Busca</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar Tudo
                </Button>
              )}
            </div>
            
            <Separator />

            {/* Tipo de Mídia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <Select 
                value={filters.mediaType || ""} 
                onValueChange={(value) => handleFilterChange('mediaType', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {mediaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-foreground">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gênero */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Gênero</label>
              <Select 
                value={filters.genre || ""} 
                onValueChange={(value) => handleFilterChange('genre', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todos os gêneros" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id} className="text-foreground">
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Categoria</label>
              <Select 
                value={filters.category || ""} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-foreground">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano</label>
              <Select 
                value={filters.year || ""} 
                onValueChange={(value) => handleFilterChange('year', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Qualquer ano" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-foreground">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Avaliação Mínima */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Avaliação Mínima
              </label>
              <Select 
                value={filters.rating || ""} 
                onValueChange={(value) => handleFilterChange('rating', value)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Qualquer avaliação" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="9" className="text-foreground">⭐ 9.0+</SelectItem>
                  <SelectItem value="8" className="text-foreground">⭐ 8.0+</SelectItem>
                  <SelectItem value="7" className="text-foreground">⭐ 7.0+</SelectItem>
                  <SelectItem value="6" className="text-foreground">⭐ 6.0+</SelectItem>
                  <SelectItem value="5" className="text-foreground">⭐ 5.0+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Ativos */}
            {activeFiltersCount > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Filtros Ativos</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.mediaType && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {mediaTypes.find(t => t.value === filters.mediaType)?.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('mediaType')}
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.genre && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {genres.find(g => g.id === filters.genre)?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('genre')}
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.year && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {filters.year}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('year')}
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.rating && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        ⭐ {filters.rating}.0+
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('rating')}
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {categories.find(c => c.value === filters.category)?.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('category')}
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Apply Filters Button */}
            <div className="pt-4">
              <Button 
                onClick={applyFilters}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={activeFiltersCount === 0}
              >
                {activeFiltersCount > 0 ? `Aplicar ${activeFiltersCount} Filtros` : 'Selecione Filtros'}
              </Button>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Clique para ver os resultados com os filtros selecionados
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchFilters;