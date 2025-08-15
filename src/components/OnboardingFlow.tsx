import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Star, Popcorn, Tv, Zap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingFlow = ({ isOpen, onClose }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const navigate = useNavigate();

  const genres = [
    { id: 'action', name: 'Ação', emoji: '💥' },
    { id: 'comedy', name: 'Comédia', emoji: '😂' },
    { id: 'drama', name: 'Drama', emoji: '🎭' },
    { id: 'horror', name: 'Terror', emoji: '😱' },
    { id: 'romance', name: 'Romance', emoji: '💕' },
    { id: 'scifi', name: 'Ficção Científica', emoji: '🚀' },
    { id: 'thriller', name: 'Suspense', emoji: '🔪' },
    { id: 'fantasy', name: 'Fantasia', emoji: '🧙‍♂️' },
    { id: 'animation', name: 'Animação', emoji: '🎨' },
    { id: 'documentary', name: 'Documentário', emoji: '📽️' }
  ];

  const steps = [
    {
      title: "Bem-vindo ao PauferFlix! 🎬",
      description: "Sua nova plataforma de descoberta de filmes e séries",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
            <Popcorn className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Deixe o destino escolher!</h3>
            <p className="text-muted-foreground">
              Descubra seu próximo filme ou série favorito com nossa roleta mágica e recomendações personalizadas.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <span>Rápido</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Star className="h-8 w-8 text-blue-500" />
              <span>Personalizado</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span>Divertido</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quais gêneros você mais gosta? 🎯",
      description: "Selecione seus favoritos para recomendações personalizadas",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                className={`p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedGenres.includes(genre.id) 
                    ? 'bg-primary text-white border-primary' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => {
                  if (selectedGenres.includes(genre.id)) {
                    setSelectedGenres(selectedGenres.filter(g => g !== genre.id));
                  } else {
                    setSelectedGenres([...selectedGenres, genre.id]);
                  }
                }}
              >
                <span className="mr-2">{genre.emoji}</span>
                {genre.name}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Selecione pelo menos 3 gêneros para continuar
          </p>
        </div>
      )
    },
    {
      title: "Tudo pronto! 🎉",
      description: "Agora você pode começar a descobrir conteúdos incríveis",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Perfil Configurado!</h3>
            <p className="text-muted-foreground">
              Suas preferências foram salvas. Agora você receberá recomendações personalizadas baseadas nos gêneros que você selecionou.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              {selectedGenres.slice(0, 5).map((genreId) => {
                const genre = genres.find(g => g.id === genreId);
                return genre ? (
                  <Badge key={genreId} variant="secondary">
                    <span className="mr-1">{genre.emoji}</span>
                    {genre.name}
                  </Badge>
                ) : null;
              })}
              {selectedGenres.length > 5 && (
                <Badge variant="outline">+{selectedGenres.length - 5} mais</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/trending')}
              className="flex items-center space-x-2"
            >
              <Tv className="h-4 w-4" />
              <span>Ver Tendências</span>
            </Button>
            <Button
              onClick={() => {
                // Simular roleta
                const randomMovieButton = document.querySelector('[data-roulette-spin]') as HTMLButtonElement;
                if (randomMovieButton) {
                  randomMovieButton.click();
                }
                onClose();
              }}
              className="flex items-center space-x-2"
            >
              <Popcorn className="h-4 w-4" />
              <span>Girar Roleta</span>
            </Button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = currentStep === 0 || (currentStep === 1 && selectedGenres.length >= 3) || currentStep === 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{steps[currentStep].title}</span>
            <Badge variant="outline">{currentStep + 1} de {steps.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button onClick={onClose}>
              Começar a Explorar
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
            >
              Próximo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;