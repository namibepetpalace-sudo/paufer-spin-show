import { Button } from "@/components/ui/button";
import { Film, User, LogOut, Settings, TrendingUp, Heart } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onSearchResults?: (results: any[]) => void;
  onMovieSelect?: (movie: any) => void;
  onApplyFilters?: (filters: any) => void;
}

const Header = ({ onSearchResults, onMovieSelect, onApplyFilters }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-netflix-red glow-effect">
            <Film className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">PauferFlix</h1>
            <p className="text-xs text-netflix-light-gray">Deixe o destino escolher</p>
          </div>
        </div>

        {/* Search Bar with Filters */}
        <div className="flex-1 max-w-2xl mx-8 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar 
              onSearchResults={onSearchResults}
              onMovieSelect={onMovieSelect}
              placeholder="Buscar filmes, séries, animes, doramas..."
            />
          </div>
          <SearchFilters 
            onFiltersChange={(filters) => {
              // Optional: Real-time filter preview
            }}
            onApplyFilters={onApplyFilters}
          />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/trending')}
            className="text-foreground hover:text-netflix-red transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendências
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/favorites')}
            className="text-foreground hover:text-netflix-red transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favoritos
          </Button>
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-muted-foreground hover:text-primary"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleLogin}
              className="bg-netflix-red text-white border-0 hover:bg-netflix-red/90 transition-all duration-300 hover:scale-105"
            >
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;