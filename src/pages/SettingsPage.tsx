import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, ArrowLeft, Bell, Monitor, Globe, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserSettings {
  notifications: boolean;
  autoplay: boolean;
  language: string;
  quality: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    autoplay: true,
    language: 'pt-BR',
    quality: 'hd'
  });
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadSettings();
  }, [user, navigate]);

  const loadSettings = () => {
    // Carregar configurações do localStorage ou API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    setLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast({
        title: "Funcionalidade em Desenvolvimento",
        description: "A exclusão de conta estará disponível em breve",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao desconectar",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header da Página */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-border hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-streaming-blue">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Configurações</h1>
                <p className="text-muted-foreground">Personalize sua experiência</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificações Push</Label>
                    <div className="text-sm text-muted-foreground">
                      Receba notificações sobre novos lançamentos
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => 
                      saveSettings({ ...settings, notifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reprodução */}
            <Card>
              <CardHeader>
                <CardTitle>Reprodução</CardTitle>
                <CardDescription>
                  Configure suas preferências de reprodução
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoplay">Reprodução Automática</Label>
                    <div className="text-sm text-muted-foreground">
                      Reproduzir trailers automaticamente
                    </div>
                  </div>
                  <Switch
                    id="autoplay"
                    checked={settings.autoplay}
                    onCheckedChange={(checked) => 
                      saveSettings({ ...settings, autoplay: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quality">Qualidade Padrão</Label>
                  <Select 
                    value={settings.quality}
                    onValueChange={(value) => saveSettings({ ...settings, quality: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD (480p)</SelectItem>
                      <SelectItem value="hd">HD (720p)</SelectItem>
                      <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                      <SelectItem value="4k">4K (2160p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Idioma e Região */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Idioma e Região</span>
                </CardTitle>
                <CardDescription>
                  Configure idioma e localização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">Idioma do Aplicativo</Label>
                  <Select 
                    value={settings.language}
                    onValueChange={(value) => saveSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español (ES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Privacidade e Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacidade e Segurança</span>
                </CardTitle>
                <CardDescription>
                  Gerencie sua conta e dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  Sair da Conta
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                        e removerá todos os seus dados dos nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir Conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Informações da Versão */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  <div>PauferFlix v1.0.0</div>
                  <div>© 2024 - Todos os direitos reservados</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;