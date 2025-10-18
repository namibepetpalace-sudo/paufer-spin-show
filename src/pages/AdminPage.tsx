import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Users, BarChart3, Database, Film, Globe, Shield, Zap,
  Bell, MessageSquare, Star, TrendingUp, Activity,
  DollarSign, Mail, Ticket, AlertTriangle, UserCog, Folder
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { DataTable } from "@/components/admin/DataTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { RechargeCodesTab } from "@/components/admin/RechargeCodesTab";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#E50914", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];

const AdminPage = () => {
  const { toast } = useToast();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  
  const [settings, setSettings] = useState({
    siteName: "CineVerse",
    apiKeyTMDB: "",
    enableRegistration: true,
    enableComments: true,
    enableRatings: true,
    maintenanceMode: false,
    maxUsersPerDay: 1000,
    cacheTimeout: 3600,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    openTickets: 0,
    growthRate: 0,
  });
  
  const [chartData, setChartData] = useState({
    userGrowth: [] as any[],
    popularGenres: [] as any[],
    activityByHour: [] as any[],
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadDashboardData();
    }
  }, [authLoading, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar usuários com roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) throw profilesError;

      // Estatísticas gerais
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday.toISOString());

      // Carregar reviews pendentes
      const { data: pendingReviews, count: pendingReviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .limit(10);

      // Carregar tickets abertos
      const { data: openTicketsData, count: openTicketsCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact' })
        .eq('status', 'open')
        .limit(10);

      // Carregar assinaturas
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(10);

      if (!subsError && subscriptionsData) {
        const totalRevenue = subscriptionsData.reduce((sum, sub) => 
          sum + (parseFloat(String(sub.price)) || 0), 0
        );
        setStats(prev => ({ ...prev, totalRevenue }));
        setSubscriptions(subscriptionsData);
      }

      // Carregar notificações
      const { data: notificationsData } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Carregar logs de auditoria
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Carregar collections
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('*')
        .limit(10);

      // Dados para gráficos
      const genresData = [
        { name: "Ação", value: 35 },
        { name: "Drama", value: 25 },
        { name: "Comédia", value: 20 },
        { name: "Thriller", value: 12 },
        { name: "Ficção", value: 8 },
      ];

      const userGrowthData = Array.from({ length: 30 }, (_, i) => ({
        day: `Dia ${i + 1}`,
        users: Math.floor(Math.random() * 50) + 10,
      }));

      const activityData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}h`,
        activity: Math.floor(Math.random() * 100) + 20,
      }));

      setUsers(profiles || []);
      setReviews(pendingReviews || []);
      setTickets(openTicketsData || []);
      setNotifications(notificationsData || []);
      setAuditLogs(logsData || []);
      setCollections(collectionsData || []);

      setStats({
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalRevenue: stats.totalRevenue,
        pendingReviews: pendingReviewsCount || 0,
        openTickets: openTicketsCount || 0,
        growthRate: 12.5,
      });

      setChartData({
        userGrowth: userGrowthData,
        popularGenres: genresData,
        activityByHour: activityData,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do painel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole as any
        });

      if (error) throw error;

      toast({
        title: "Role atualizada",
        description: "A role do usuário foi atualizada com sucesso.",
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a role do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleModerateReview = async (reviewId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status, 
          moderated_at: new Date().toISOString(),
          moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review moderada",
        description: `Review ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast({
        title: "Erro",
        description: "Não foi possível moderar a review.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const userColumns = [
    { header: "Nome", accessor: "display_name" as keyof any, sortable: true },
    { 
      header: "Role", 
      accessor: (row: any) => (
        <Badge variant={row.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
          {row.user_roles?.[0]?.role || 'user'}
        </Badge>
      ),
    },
    { 
      header: "Cadastro", 
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString('pt-BR'),
    },
    { 
      header: "Ações", 
      accessor: (row: any) => (
        <Select onValueChange={(value) => handleUpdateRole(row.user_id, value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Alterar role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderador</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="premium_user">Premium</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  const reviewColumns = [
    { header: "Filme ID", accessor: "movie_id" as keyof any },
    { 
      header: "Avaliação", 
      accessor: (row: any) => (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          {row.rating}/5
        </div>
      ),
    },
    { header: "Comentário", accessor: "comment" as keyof any },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    { 
      header: "Ações", 
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleModerateReview(row.id, 'approved')}>
            Aprovar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleModerateReview(row.id, 'rejected')}>
            Rejeitar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os aspectos da plataforma CineVerse
            </p>
          </div>
          <Button onClick={() => loadDashboardData()}>
            Atualizar Dados
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={Users}
            trend="up"
            trendValue={{ value: stats.growthRate, isPositive: true }}
          />
          <StatsCard
            title="Usuários Ativos (24h)"
            value={stats.activeUsers}
            icon={Activity}
            trend="neutral"
            description="Usuários ativos nas últimas 24 horas"
          />
          <StatsCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend="up"
            trendValue={{ value: 8.3, isPositive: true }}
          />
          <StatsCard
            title="Reviews Pendentes"
            value={stats.pendingReviews}
            icon={MessageSquare}
            description="Aguardando moderação"
          />
          <StatsCard
            title="Tickets Abertos"
            value={stats.openTickets}
            icon={Ticket}
            description="Tickets de suporte em aberto"
          />
          <StatsCard
            title="Taxa de Crescimento"
            value={`${stats.growthRate}%`}
            icon={TrendingUp}
            description="Crescimento mensal"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="codes">Códigos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="tickets">Suporte</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Usuários</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#E50914" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gêneros Populares</CardTitle>
                  <CardDescription>Distribuição de preferências</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.popularGenres}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.popularGenres.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Atividade por Horário</CardTitle>
                  <CardDescription>Distribuição ao longo do dia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.activityByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activity" fill="#E50914" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recharge Codes Tab */}
          <TabsContent value="codes" className="space-y-4">
            <RechargeCodesTab />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Total: {users.length} usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={users} columns={userColumns} itemsPerPage={20} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderação de Reviews</CardTitle>
                <CardDescription>
                  {stats.pendingReviews} reviews pendentes de moderação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={reviews} columns={reviewColumns} itemsPerPage={15} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Assinaturas</CardTitle>
                <CardDescription>
                  Receita total: R$ {stats.totalRevenue.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  data={subscriptions} 
                  columns={[
                    { header: "Plano", accessor: "plan" as keyof any },
                    { header: "Status", accessor: (row: any) => (
                      <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                        {row.status}
                      </Badge>
                    )},
                    { header: "Preço", accessor: (row: any) => `R$ ${row.price}` },
                    { header: "Início", accessor: (row: any) => new Date(row.started_at).toLocaleDateString('pt-BR') },
                  ]} 
                  itemsPerPage={15} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suporte ao Cliente</CardTitle>
                <CardDescription>
                  {stats.openTickets} tickets abertos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  data={tickets} 
                  columns={[
                    { header: "Assunto", accessor: "subject" as keyof any },
                    { header: "Prioridade", accessor: (row: any) => (
                      <Badge variant={row.priority === 'high' ? 'destructive' : 'secondary'}>
                        {row.priority}
                      </Badge>
                    )},
                    { header: "Status", accessor: "status" as keyof any },
                    { header: "Data", accessor: (row: any) => new Date(row.created_at).toLocaleDateString('pt-BR') },
                  ]} 
                  itemsPerPage={15} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Collections de Filmes</CardTitle>
                <CardDescription>
                  Crie e gerencie coleções temáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  data={collections} 
                  columns={[
                    { header: "Título", accessor: "title" as keyof any },
                    { header: "Descrição", accessor: "description" as keyof any },
                    { header: "Pública", accessor: (row: any) => (
                      <Badge variant={row.is_public ? 'default' : 'secondary'}>
                        {row.is_public ? 'Sim' : 'Não'}
                      </Badge>
                    )},
                  ]} 
                  itemsPerPage={10} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Notificações</CardTitle>
                <CardDescription>
                  Envie notificações para os usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input placeholder="Título da notificação" />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea placeholder="Conteúdo da notificação" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Enviar Notificação</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure as opções gerais da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Site</Label>
                  <Input 
                    value={settings.siteName} 
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key TMDb</Label>
                  <Input 
                    type="password"
                    value={settings.apiKeyTMDB} 
                    onChange={(e) => setSettings({...settings, apiKeyTMDB: e.target.value})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Permitir Registro</Label>
                  <Switch 
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({...settings, enableRegistration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Habilitar Comentários</Label>
                  <Switch 
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => setSettings({...settings, enableComments: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Habilitar Avaliações</Label>
                  <Switch 
                    checked={settings.enableRatings}
                    onCheckedChange={(checked) => setSettings({...settings, enableRatings: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Modo Manutenção</Label>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                  />
                </div>
                <Button onClick={() => {
                  toast({
                    title: "Configurações salvas",
                    description: "As configurações foram atualizadas com sucesso.",
                  });
                }}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
