import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  Eye, 
  LogOut,
  FileText,
  Clock,
  Mail,
  Calendar,
  Search,
  Filter,
  PieChart,
  Activity
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { surveyService } from "@/services/surveyService";
import { categories, questions } from "@/lib/surveyData";
import type { Tables } from "@/integrations/supabase/types";

const ADMIN_PASSWORD = "unicco2026";

type SurveyWithResponses = Tables<"surveys"> & {
  survey_responses: Tables<"survey_responses">[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [surveys, setSurveys] = useState<SurveyWithResponses[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all");

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthenticated", "true");
      setIsAuthenticated(true);
      loadData();
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    router.push("/");
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [surveysData, statsData] = await Promise.all([
        surveyService.getAllSurveys(),
        surveyService.getSurveyStats()
      ]);
      setSurveys(surveysData || []);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Email", "Nombre", "Fecha Creación", "Fecha Completado", "Estado"].join(","),
      ...filteredSurveys.map(survey => [
        survey.email,
        survey.name,
        new Date(survey.created_at).toLocaleDateString("es-MX"),
        survey.completed_at ? new Date(survey.completed_at).toLocaleDateString("es-MX") : "N/A",
        survey.completed_at ? "Completada" : "Incompleta"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encuestas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
                         (filterStatus === "completed" && survey.completed_at) ||
                         (filterStatus === "incomplete" && !survey.completed_at);
    return matchesSearch && matchesFilter;
  });

  const getQuestionStats = () => {
    const questionStats: Record<string, {
      total: number;
      answered: number;
      notMyRole: number;
      responses: Record<string, number>;
    }> = {};

    questions.forEach(q => {
      questionStats[q.id] = {
        total: 0,
        answered: 0,
        notMyRole: 0,
        responses: {}
      };
    });

    surveys.forEach(survey => {
      if (survey.completed_at) {
        survey.survey_responses.forEach(response => {
          if (questionStats[response.question_id]) {
            questionStats[response.question_id].total++;
            
            if (response.is_not_my_role) {
              questionStats[response.question_id].notMyRole++;
            } else if (response.answer_value) {
              questionStats[response.question_id].answered++;
              const value = response.answer_value;
              questionStats[response.question_id].responses[value] = 
                (questionStats[response.question_id].responses[value] || 0) + 1;
            }
          }
        });
      }
    });

    return questionStats;
  };

  const questionStats = getQuestionStats();

  if (!isAuthenticated) {
    return (
      <>
        <SEO title="Admin - Diagnóstico ERP" />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-2">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-heading">Panel de Administración</CardTitle>
              <CardDescription className="text-base">Diagnóstico de Madurez ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contraseña</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese la contraseña"
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base">
                  Iniciar Sesión
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Dashboard Admin - Diagnóstico ERP" />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-foreground">Panel de Administración</h1>
                  <p className="text-sm text-muted-foreground">Diagnóstico de Madurez ERP</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total de Encuestas</p>
                    <p className="text-4xl font-heading font-bold text-foreground mb-2">{stats.total}</p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <FileText className="w-4 h-4" />
                      <span>Registradas en el sistema</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Completadas</p>
                    <p className="text-4xl font-heading font-bold text-foreground mb-2">{stats.completed}</p>
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Finalizadas con éxito</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-chart-2/10">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tasa de Finalización</p>
                    <p className="text-4xl font-heading font-bold text-foreground mb-2">{stats.completionRate}%</p>
                    <div className="flex items-center gap-2 text-sm text-chart-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Promedio de completado</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-chart-2/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-chart-2" />
                  </div>
                </div>
                <Progress value={stats.completionRate} className="mt-4 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="surveys" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 h-auto p-1">
              <TabsTrigger value="surveys" className="gap-2 py-3">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Encuestas</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2 py-3">
                <PieChart className="w-4 h-4" />
                <span className="font-semibold">Estadísticas</span>
              </TabsTrigger>
            </TabsList>

            {/* Surveys Tab */}
            <TabsContent value="surveys" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-heading flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Lista de Encuestas
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Gestiona y visualiza todas las encuestas registradas
                      </CardDescription>
                    </div>
                    <Button onClick={exportToCSV} className="gap-2 bg-accent hover:bg-accent/90">
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        onClick={() => setFilterStatus("all")}
                        className="gap-2"
                      >
                        <Filter className="w-4 h-4" />
                        Todas ({surveys.length})
                      </Button>
                      <Button
                        variant={filterStatus === "completed" ? "default" : "outline"}
                        onClick={() => setFilterStatus("completed")}
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Completadas ({stats.completed})
                      </Button>
                      <Button
                        variant={filterStatus === "incomplete" ? "default" : "outline"}
                        onClick={() => setFilterStatus("incomplete")}
                        className="gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Incompletas ({stats.total - stats.completed})
                      </Button>
                    </div>
                  </div>

                  {/* Surveys List */}
                  <div className="grid gap-4">
                    {filteredSurveys.length === 0 ? (
                      <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No se encontraron encuestas</p>
                      </div>
                    ) : (
                      filteredSurveys.map((survey) => (
                        <Card key={survey.id} className="hover:shadow-md transition-shadow border-2">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Mail className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="font-semibold text-lg text-foreground">{survey.name}</p>
                                      <Badge 
                                        variant={survey.completed_at ? "default" : "secondary"}
                                        className={survey.completed_at ? "bg-accent" : "bg-muted"}
                                      >
                                        {survey.completed_at ? (
                                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Completada</>
                                        ) : (
                                          <><Clock className="w-3 h-3 mr-1" /> Incompleta</>
                                        )}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Mail className="w-3.5 h-3.5" />
                                      {survey.email}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">Creada:</span>
                                    <span>{new Date(survey.created_at).toLocaleDateString("es-MX", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    })}</span>
                                  </div>
                                  {survey.completed_at && (
                                    <div className="flex items-center gap-2 text-muted-foreground bg-accent/10 px-3 py-2 rounded-md">
                                      <CheckCircle2 className="w-4 h-4 text-accent" />
                                      <span className="font-medium">Completada:</span>
                                      <span>{new Date(survey.completed_at).toLocaleDateString("es-MX", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                      })}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Button
                                onClick={() => window.open(`/survey/${survey.unique_link_token}`, "_blank")}
                                variant="outline"
                                className="gap-2 md:w-auto w-full"
                              >
                                <Eye className="w-4 h-4" />
                                Ver Detalles
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              {categories.map((category) => {
                const categoryQuestions = questions.filter(q => q.category === category.id);
                
                return (
                  <Card key={category.id} className="border-2">
                    <CardHeader className="bg-muted/30">
                      <CardTitle className="text-xl font-heading flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-base mt-2">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {categoryQuestions.map((question) => {
                          const qStats = questionStats[question.id];
                          if (!qStats || qStats.total === 0) return null;

                          const sortedResponses = Object.entries(qStats.responses)
                            .sort(([, a], [, b]) => b - a);

                          return (
                            <div key={question.id} className="p-4 bg-muted/20 rounded-lg border">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-sm font-bold text-primary">{question.id.split("-")[1]}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground mb-2">{question.text}</h4>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      <span className="text-muted-foreground">Total:</span>
                                      <span className="font-semibold text-foreground">{qStats.total}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                                      <span className="text-muted-foreground">Respondidas:</span>
                                      <span className="font-semibold text-accent">{qStats.answered}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                                      <span className="text-muted-foreground">No es mi rol:</span>
                                      <span className="font-semibold">{qStats.notMyRole}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {sortedResponses.length > 0 && (
                                <div className="space-y-3 mt-4">
                                  {sortedResponses.map(([value, count]) => {
                                    const percentage = Math.round((count / qStats.answered) * 100);
                                    return (
                                      <div key={value} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="font-medium text-foreground">{value}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">{count} respuestas</span>
                                            <Badge variant="secondary" className="font-mono">
                                              {percentage}%
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}