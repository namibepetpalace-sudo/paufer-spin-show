import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Film, User, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { tmdbService } from "@/lib/tmdb";

interface HeaderProps {
  onSearchResults?: (results: any[]) => void;
}

const Header = ({ onSearchResults }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      onSearchResults?.([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await tmdbService.searchMovies(query);
      onSearchResults?.(results.slice(0, 12));
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

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

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar filmes e séries..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 bg-netflix-dark border-netflix-gray focus:ring-netflix-red focus:border-netflix-red"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-foreground hover:text-netflix-red transition-colors">
            Tendências
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-netflix-red transition-colors">
            Favoritos
          </Button>
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {user.user_metadata?.display_name || user.email}
                </span>
              </div>
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