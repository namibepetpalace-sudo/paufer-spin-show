import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Film } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
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
              className="pl-10 bg-netflix-dark border-netflix-gray focus:ring-netflix-red focus:border-netflix-red"
            />
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
          <Button className="bg-netflix-red text-white border-0 hover:bg-netflix-red/90 transition-all duration-300 hover:scale-105">
            Entrar
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;