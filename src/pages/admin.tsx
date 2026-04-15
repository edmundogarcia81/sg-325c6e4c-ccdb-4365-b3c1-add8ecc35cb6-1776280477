import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  Lock, 
  LogOut, 
  Users, 
  CheckCircle2, 
  TrendingUp,
  FileText,
  Download,
  Search,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { surveyService } from "@/services/surveyService";
import { categories, questions } from "@/lib/surveyData";
import type { Tables } from "@/integrations/supabase/types";

type Survey = Tables<"surveys"> & {
  survey_responses: Tables<"survey_responses">[];
};

const ADMIN_PASSWORD = "unicco2026";

interface CategoryStats {
  categoryId: string;
  categoryTitle: string;
  totalQuestions: number;
  totalResponses: number;
  notMyRoleCount: number;
  mostCommonAnswer: string;
  mostCommonCount: number;
  averageScore: number;
  responseDistribution: { [key: string]: number };
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [surveysData, statsData] = await Promise.all([
        surveyService.getAllSurveys(),
        surveyService.getSurveyStats()
      ]);
      
      setSurveys(surveysData);
      setStats(statsData);
      calculateCategoryStats(surveysData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryStats = (surveysData: Survey[]) => {
    const statsMap: { [key: string]: CategoryStats } = {};

    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category.id);
      const responseDistribution: { [key: string]: number } = {};
      let totalResponses = 0;
      let notMyRoleCount = 0;
      let scoreSum = 0;
      let scoreCount = 0;

      categoryQuestions.forEach(question => {
        surveysData.forEach(survey => {
          const response = survey.survey_responses.find(r => r.question_id === question.id);
          if (response) {
            totalResponses++;
            if (response.is_not_my_role) {
              notMyRoleCount++;
            } else if (response.answer_value) {
              const value = response.answer_value;
              responseDistribution[value] = (responseDistribution[value] || 0) + 1;
              
              // Calculate score for numeric responses (1-5 scale)
              const numValue = parseInt(value);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
                scoreSum += numValue;
                scoreCount++;
              }
            }
          }
        });
      });

      // Find most common answer
      let mostCommonAnswer = "Sin datos";
      let mostCommonCount = 0;
      Object.entries(responseDistribution).forEach(([answer, count]) => {
        if (count > mostCommonCount) {
          mostCommonCount = count;
          mostCommonAnswer = answer;
        }
      });

      // Map numeric answers to text
      const answerTextMap: { [key: string]: string } = {
        "1": "Nunca",
        "2": "Rara vez",
        "3": "A veces",
        "4": "Frecuentemente",
        "5": "Siempre"
      };
      
      if (answerTextMap[mostCommonAnswer]) {
        mostCommonAnswer = answerTextMap[mostCommonAnswer];
      }

      statsMap[category.id] = {
        categoryId: category.id,
        categoryTitle: category.title,
        totalQuestions: categoryQuestions.length,
        totalResponses,
        notMyRoleCount,
        mostCommonAnswer,
        mostCommonCount,
        averageScore: scoreCount > 0 ? scoreSum / scoreCount : 0,
        responseDistribution
      };
    });

    setCategoryStats(Object.values(statsMap));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      loadData();
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setPassword("");
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = 
      survey.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "completed" && survey.completed_at) ||
      (filterStatus === "incomplete" && !survey.completed_at);
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ["Email", "Nombre", "Fecha Creación", "Fecha Completado", "Estado"];
    const rows = filteredSurveys.map(survey => [
      survey.email,
      survey.name,
      new Date(survey.created_at).toLocaleDateString("es-MX"),
      survey.completed_at ? new Date(survey.completed_at).toLocaleDateString("es-MX") : "N/A",
      survey.completed_at ? "Completada" : "Incompleta"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `encuestas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEO title="Admin - Login" />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
              <CardDescription>Ingrese la contraseña para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Panel de Administración - UNICCO" />
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Gestión de encuestas UNICCO</p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Encuestas</p>
                    <p className="text-4xl font-heading font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Completadas</p>
                    <p className="text-4xl font-heading font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Tasa Finalización</p>
                    <p className="text-4xl font-heading font-bold text-purple-900 dark:text-purple-100">{stats.completionRate}%</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="surveys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Encuestas
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Estadísticas por Categoría
              </TabsTrigger>
            </TabsList>

            <TabsContent value="surveys" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <CardTitle>Lista de Encuestas</CardTitle>
                      <CardDescription>Gestiona y visualiza todas las encuestas enviadas</CardDescription>
                    </div>
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por email o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("all")}
                      >
                        Todas
                      </Button>
                      <Button
                        variant={filterStatus === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("completed")}
                      >
                        Completadas
                      </Button>
                      <Button
                        variant={filterStatus === "incomplete" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("incomplete")}
                      >
                        Incompletas
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Fecha Creación</TableHead>
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
                              <TableCell>{new Date(survey.created_at).toLocaleDateString("es-MX")}</TableCell>
                              <TableCell>
                                {survey.completed_at 
                                  ? new Date(survey.completed_at).toLocaleDateString("es-MX") 
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {survey.completed_at ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completada
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    Incompleta
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
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
              <div className="grid gap-6">
                {categoryStats.map((stat, index) => {
                  const category = categories.find(c => c.id === stat.categoryId);
                  const maxValue = Math.max(...Object.values(stat.responseDistribution));
                  
                  return (
                    <Card key={stat.categoryId}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{category?.icon}</div>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">
                              {index + 1}. {stat.categoryTitle}
                            </CardTitle>
                            <CardDescription>
                              {stat.totalQuestions} preguntas • {stat.totalResponses} respuestas totales
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <p className="text-sm text-muted-foreground mb-1">Respuesta más común</p>
                            <p className="text-2xl font-heading font-bold text-primary">{stat.mostCommonAnswer}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {stat.mostCommonCount} respuestas ({Math.round((stat.mostCommonCount / stat.totalResponses) * 100)}%)
                            </p>
                          </div>
                          
                          <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
                            <p className="text-sm text-muted-foreground mb-1">Promedio general</p>
                            <p className="text-2xl font-heading font-bold text-accent">
                              {stat.averageScore > 0 ? stat.averageScore.toFixed(2) : "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Escala de 1 a 5
                            </p>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4 border border-border">
                            <p className="text-sm text-muted-foreground mb-1">No es mi rol</p>
                            <p className="text-2xl font-heading font-bold text-foreground">{stat.notMyRoleCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((stat.notMyRoleCount / stat.totalResponses) * 100)}% del total
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <PieChart className="w-4 h-4" />
                            Distribución de respuestas
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(stat.responseDistribution)
                              .sort(([, a], [, b]) => b - a)
                              .map(([answer, count]) => {
                                const percentage = Math.round((count / (stat.totalResponses - stat.notMyRoleCount)) * 100);
                                const barWidth = (count / maxValue) * 100;
                                
                                const answerTextMap: { [key: string]: string } = {
                                  "1": "Nunca",
                                  "2": "Rara vez",
                                  "3": "A veces",
                                  "4": "Frecuentemente",
                                  "5": "Siempre"
                                };
                                
                                const displayText = answerTextMap[answer] || answer;
                                
                                return (
                                  <div key={answer} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium text-foreground">{displayText}</span>
                                      <span className="text-muted-foreground">
                                        {count} respuestas ({percentage}%)
                                      </span>
                                    </div>
                                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-end pr-3 transition-all duration-500"
                                        style={{ width: `${barWidth}%` }}
                                      >
                                        <span className="text-xs font-semibold text-white">
                                          {percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}