import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Lock, Users, CheckCircle, TrendingUp, Eye, Download, LogOut, Search, Filter } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { surveyService } from "@/services/surveyService";
import { questions, categories } from "@/lib/surveyData";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "unicco2026"; // Cambiar esto a una contraseña segura

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "incomplete">("all");

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "authenticated") {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allSurveys, statistics] = await Promise.all([
        surveyService.getAllSurveys(),
        surveyService.getSurveyStats()
      ]);
      setSurveys(allSurveys);
      setStats(statistics);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "authenticated");
      setIsAuthenticated(true);
      loadData();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Contraseña incorrecta"
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setPassword("");
  };

  const exportToCSV = () => {
    const headers = ["Email", "Nombre", "Fecha Creación", "Fecha Completado", "Estado"];
    const rows = filteredSurveys.map(survey => [
      survey.email,
      survey.name,
      new Date(survey.created_at).toLocaleDateString("es-MX"),
      survey.completed_at ? new Date(survey.completed_at).toLocaleDateString("es-MX") : "Incompleta",
      survey.completed_at ? "Completada" : "Incompleta"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encuestas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = 
      survey.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "completed" && survey.completed_at) ||
      (statusFilter === "incomplete" && !survey.completed_at);

    return matchesSearch && matchesStatus;
  });

  const getQuestionStats = (questionId: string) => {
    const allResponses = surveys
      .filter(s => s.completed_at)
      .flatMap(s => s.survey_responses)
      .filter(r => r.question_id === questionId);

    const total = allResponses.length;
    if (total === 0) return null;

    const notMyRole = allResponses.filter(r => r.is_not_my_role).length;
    const answered = allResponses.filter(r => !r.is_not_my_role && r.answer_value).length;

    const valueCounts: Record<string, number> = {};
    allResponses.forEach(r => {
      if (!r.is_not_my_role && r.answer_value) {
        valueCounts[r.answer_value] = (valueCounts[r.answer_value] || 0) + 1;
      }
    });

    return {
      total,
      notMyRole,
      answered,
      valueCounts,
      notMyRolePercent: Math.round((notMyRole / total) * 100),
      answeredPercent: Math.round((answered / total) * 100)
    };
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEO title="Admin - Diagnóstico ERP" />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription>
                Ingrese la contraseña para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese contraseña"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Panel de Administración - Diagnóstico ERP" />
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-sm text-muted-foreground">
                Diagnóstico de Madurez ERP - UNICCO
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="container py-8">
          {/* Estadísticas generales */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Encuestas
                </CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-foreground">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completadas
                </CardTitle>
                <CheckCircle className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-accent">
                  {stats.completed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tasa de Finalización
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-primary">
                  {stats.completionRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="surveys" className="space-y-6">
            <TabsList>
              <TabsTrigger value="surveys">Encuestas</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="surveys" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lista de Encuestas</CardTitle>
                      <CardDescription>
                        Todas las encuestas registradas en el sistema
                      </CardDescription>
                    </div>
                    <Button onClick={exportToCSV} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        onClick={() => setStatusFilter("all")}
                        size="sm"
                      >
                        Todas
                      </Button>
                      <Button
                        variant={statusFilter === "completed" ? "default" : "outline"}
                        onClick={() => setStatusFilter("completed")}
                        size="sm"
                      >
                        Completadas
                      </Button>
                      <Button
                        variant={statusFilter === "incomplete" ? "default" : "outline"}
                        onClick={() => setStatusFilter("incomplete")}
                        size="sm"
                      >
                        Incompletas
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Fecha Inicio</TableHead>
                          <TableHead>Fecha Completado</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSurveys.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No se encontraron encuestas
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSurveys.map((survey) => (
                            <TableRow key={survey.id}>
                              <TableCell className="font-medium">{survey.email}</TableCell>
                              <TableCell>{survey.name}</TableCell>
                              <TableCell>
                                {new Date(survey.created_at).toLocaleDateString("es-MX", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </TableCell>
                              <TableCell>
                                {survey.completed_at ? (
                                  new Date(survey.completed_at).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  })
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {survey.completed_at ? (
                                  <Badge className="bg-accent">Completada</Badge>
                                ) : (
                                  <Badge variant="outline">Incompleta</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/survey/${survey.unique_link_token}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {categories.map(category => {
                const categoryQuestions = questions.filter(q => q.category === category.id);
                
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categoryQuestions.map(question => {
                        const questionStats = getQuestionStats(question.id);
                        
                        if (!questionStats) {
                          return (
                            <div key={question.id} className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium text-foreground mb-2">
                                {question.text}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Sin respuestas aún
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div key={question.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">
                                {question.text}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>
                                  Total respuestas: <strong className="text-foreground">{questionStats.total}</strong>
                                </span>
                                <span>
                                  Respondidas: <strong className="text-foreground">{questionStats.answered}</strong> ({questionStats.answeredPercent}%)
                                </span>
                                <span>
                                  No es mi rol: <strong className="text-foreground">{questionStats.notMyRole}</strong> ({questionStats.notMyRolePercent}%)
                                </span>
                              </div>
                            </div>

                            {question.type === "choice" && Object.keys(questionStats.valueCounts).length > 0 && (
                              <div className="space-y-2">
                                {Object.entries(questionStats.valueCounts)
                                  .sort(([, a], [, b]) => b - a)
                                  .map(([value, count]) => {
                                    const option = question.options?.find(o => o.value === value);
                                    const percentage = Math.round((count / questionStats.answered) * 100);
                                    
                                    return (
                                      <div key={value} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-foreground">
                                            {option?.label || value}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {count} ({percentage}%)
                                          </span>
                                        </div>
                                        <div className="h-2 bg-background rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-primary transition-all"
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