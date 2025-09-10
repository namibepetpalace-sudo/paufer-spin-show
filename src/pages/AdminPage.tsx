import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, BarChart3, Database, Film, Globe, Shield, Zap } from "lucide-react";

const AdminPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "CineVerse",
    apiKeyTMDB: "demo-key-123",
    enableRegistration: true,
    enableComments: true,
    enableRatings: true,
    maintenanceMode: false,
    maxUsersPerDay: 1000,
    cacheTimeout: 3600,
  });

  const [users] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", role: "Admin", status: "Ativo", lastLogin: "2025-01-09" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", role: "User", status: "Ativo", lastLogin: "2025-01-08" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", role: "Moderator", status: "Bloqueado", lastLogin: "2025-01-07" },
  ]);

  const [stats] = useState({
    totalUsers: 15420,
    totalMovies: 85632,
    totalSearches: 245789,
    activeUsers: 2341,
    popularGenres: ["Action", "Drama", "Comedy", "Thriller"],
    apiUsage: 78,
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da plataforma foram atualizadas com sucesso.",
    });
  };

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: `Usuário ${action}`,
      description: `Ação realizada com sucesso para o usuário ID: ${userId}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel de Administração</h1>
              <p className="text-muted-foreground">Gerencie todas as configurações da plataforma</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              API & Cache
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Filmes no Banco</CardTitle>
                  <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMovies.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+250 novos esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Buscas Realizadas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSearches.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+5% hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Online agora</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gêneros Mais Populares</CardTitle>
                  <CardDescription>Os gêneros mais buscados pelos usuários</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popularGenres.map((genre, index) => (
                      <div key={genre} className="flex items-center justify-between">
                        <span className="font-medium">{genre}</span>
                        <Badge variant="secondary">{100 - index * 15}% popularidade</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uso da API</CardTitle>
                  <CardDescription>Monitoramento do limite da API TMDb</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Requests hoje</span>
                      <span className="font-mono text-sm">{stats.apiUsage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.apiUsage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Limite diário: 1000 requests
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure as opções básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Chave da API TMDb</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.apiKeyTMDB}
                      onChange={(e) => setSettings({...settings, apiKeyTMDB: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Máximo de Usuários por Dia</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={settings.maxUsersPerDay}
                      onChange={(e) => setSettings({...settings, maxUsersPerDay: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cacheTimeout">Timeout do Cache (segundos)</Label>
                    <Input
                      id="cacheTimeout"
                      type="number"
                      value={settings.cacheTimeout}
                      onChange={(e) => setSettings({...settings, cacheTimeout: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Permitir Novos Registros</Label>
                      <p className="text-sm text-muted-foreground">Usuários podem criar novas contas</p>
                    </div>
                    <Switch
                      checked={settings.enableRegistration}
                      onCheckedChange={(checked) => setSettings({...settings, enableRegistration: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Habilitar Comentários</Label>
                      <p className="text-sm text-muted-foreground">Usuários podem comentar em filmes</p>
                    </div>
                    <Switch
                      checked={settings.enableComments}
                      onCheckedChange={(checked) => setSettings({...settings, enableComments: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Habilitar Avaliações</Label>
                      <p className="text-sm text-muted-foreground">Usuários podem avaliar filmes</p>
                    </div>
                    <Switch
                      checked={settings.enableRatings}
                      onCheckedChange={(checked) => setSettings({...settings, enableRatings: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Modo Manutenção</Label>
                      <p className="text-sm text-muted-foreground">Site ficará indisponível para usuários</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Visualize e gerencie todos os usuários da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Login</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Ativo" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUserAction("editado", user.id)}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.status === "Ativo" ? "destructive" : "default"}
                              onClick={() => handleUserAction(user.status === "Ativo" ? "bloqueado" : "desbloqueado", user.id)}
                            >
                              {user.status === "Ativo" ? "Bloquear" : "Desbloquear"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Conteúdo</CardTitle>
                  <CardDescription>Configure como o conteúdo é exibido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="featuredContent">Conteúdo em Destaque</Label>
                    <Select defaultValue="trending">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trending">Filmes em Alta</SelectItem>
                        <SelectItem value="popular">Mais Populares</SelectItem>
                        <SelectItem value="recent">Mais Recentes</SelectItem>
                        <SelectItem value="rated">Melhor Avaliados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage">Itens por Página</Label>
                    <Select defaultValue="20">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 itens</SelectItem>
                        <SelectItem value="20">20 itens</SelectItem>
                        <SelectItem value="50">50 itens</SelectItem>
                        <SelectItem value="100">100 itens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Atualizar Configurações</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache e Performance</CardTitle>
                  <CardDescription>Gerencie o cache da aplicação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Limpar Cache de Filmes
                  </Button>
                  <Button variant="outline" className="w-full">
                    Limpar Cache de Imagens
                  </Button>
                  <Button variant="outline" className="w-full">
                    Recriar Índices de Busca
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Limpar Todo o Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da API</CardTitle>
                <CardDescription>Configure integrações externas e limites da API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tmdbApiKey">Chave da API TMDb</Label>
                    <Input
                      id="tmdbApiKey"
                      type="password"
                      placeholder="Digite sua chave da API TMDb"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestLimit">Limite de Requests por Hora</Label>
                    <Input
                      id="requestLimit"
                      type="number"
                      defaultValue="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cacheExpiry">Expiração do Cache (minutos)</Label>
                    <Input
                      id="cacheExpiry"
                      type="number"
                      defaultValue="60"
                    />
                  </div>
                </div>

                <Button className="w-full">Testar Conexão com API</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Configure opções de segurança e monitoramento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Logs de Auditoria</Label>
                      <p className="text-sm text-muted-foreground">Registrar ações dos usuários</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Proteção contra Spam</Label>
                      <p className="text-sm text-muted-foreground">Limitar requests por IP</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupLocation">Local do Backup</Label>
                  <Input
                    id="backupLocation"
                    placeholder="/backups/cineverse"
                    defaultValue="/backups/cineverse"
                  />
                </div>

                <Button className="w-full">Fazer Backup Agora</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;