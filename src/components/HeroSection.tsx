import { Button } from "@/components/ui/button";
import { Play, Info, Zap } from "lucide-react";
import Roulette from "./Roulette";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-streaming-blue/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-glow/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">PauferFlix</span>
                <br />
                <span className="text-foreground">Descubra o que assistir</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                <span className="gradient-text font-semibold">"Deixe o destino escolher sua próxima série"</span>
                <br />
                Encontre filmes e séries perfeitamente adequados ao seu gosto ou deixe nossa roleta mágica surpreender você!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-streaming-blue text-white border-0 hover:opacity-90 glow-effect px-8 py-4 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Começar Agora
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg"
              >
                <Info className="h-5 w-5 mr-2" />
                Como Funciona
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">50K+</div>
                <div className="text-sm text-muted-foreground">Filmes e Séries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">10M+</div>
                <div className="text-sm text-muted-foreground">Descobertas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Roulette */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Glow effect behind roulette */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-streaming-blue/30 rounded-full blur-3xl transform scale-150 animate-glow-pulse"></div>
              
              {/* Roulette Component */}
              <div className="relative">
                <Roulette />
              </div>
              
              {/* Floating icon */}
              <div className="absolute -top-4 -right-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg animate-float">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;