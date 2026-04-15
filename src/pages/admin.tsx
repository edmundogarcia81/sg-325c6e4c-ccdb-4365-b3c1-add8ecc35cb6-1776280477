import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { 
  Lock, 
  LogOut, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Download, 
  Eye,
  Clock,
  BarChart3,
  Trash2,
  Settings,
  Plus,
  Edit,
  GripVertical,
  Save,
  X,
  FileText,
  PieChart
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { surveyService } from "@/services/surveyService";
import { surveyConfigService, type Category, type Question, type CategoryWithQuestions } from "@/services/surveyConfigService";
import type { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Survey = Tables<"surveys"> & {
  survey_responses: Tables<"survey_responses">[];
};

const ADMIN_PASSWORD = "unicco2026";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all");
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Survey config management states
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithQuestions, setCategoriesWithQuestions] = useState<CategoryWithQuestions[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editCategoryDialog, setEditCategoryDialog] = useState(false);
  const [editQuestionDialog, setEditQuestionDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ title: "", description: "" });
  const [questionForm, setQuestionForm] = useState({ 
    text: "", 
    type: "likert" as "likert" | "yesno" | "open",
    options: [""] 
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

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
      const [surveysData, statsData, categoriesData, catsWithQ] = await Promise.all([
        surveyService.getAllSurveys(),
        surveyService.getSurveyStats(),
        surveyConfigService.getAllCategories(),
        surveyConfigService.getCategoriesWithQuestions()
      ]);
      setSurveys(surveysData);
      setStats(statsData);
      setCategories(categoriesData);
      setCategoriesWithQuestions(catsWithQ);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate aggregated stats per category
  const categoryStats = useMemo(() => {
    if (!categoriesWithQuestions.length || !surveys.length) return [];

    return categoriesWithQuestions.map(category => {
      // Find all questions for this category
      const categoryQuestions = category.questions;
      const questionIds = categoryQuestions.map(q => q.id);

      // Collect all responses for these questions across all completed surveys
      const allResponses = surveys
        .filter(s => s.completed_at)
        .flatMap(s => s.survey_responses)
        .filter(r => questionIds.includes(r.question_id));

      const totalResponses = allResponses.length;
      const validResponses = allResponses.filter(r => !r.is_not_my_role && r.answer_value);
      const notMyRoleResponses = allResponses.filter(r => r.is_not_my_role);

      // Calculate the most common answer
      const answerCounts = validResponses.reduce((acc, curr) => {
        if (curr.answer_value) {
          acc[curr.answer_value] = (acc[curr.answer_value] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      let mostCommonAnswer = "Sin datos suficientes";
      let highestCount = 0;

      Object.entries(answerCounts).forEach(([answer, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostCommonAnswer = answer;
        }
      });

      if (mostCommonAnswer.length > 50) {
        mostCommonAnswer = mostCommonAnswer.substring(0, 47) + "...";
      }

      return {
        id: category.id,
        title: category.title,
        description: category.description,
        totalResponses,
        validResponses: validResponses.length,
        notMyRoleResponses: notMyRoleResponses.length,
        completionRate: totalResponses ? Math.round((validResponses.length / totalResponses) * 100) : 0,
        mostCommonAnswer
      };
    });
  }, [surveys, categoriesWithQuestions]);

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

  const handleDeleteSingle = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedSurveys.length === 0) return;
    setSurveyToDelete(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (surveyToDelete) {
        // Delete single survey
        await surveyService.deleteSurvey(surveyToDelete);
      } else {
        // Delete multiple surveys
        await surveyService.deleteSurveys(selectedSurveys);
      }
      
      // Reload data
      await loadData();
      setSelectedSurveys([]);
      setSurveyToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Error al eliminar la(s) encuesta(s)");
    } finally {
      setIsDeleting(false);
    }
  };

  // Category management functions
  const loadQuestions = async (categoryId: string) => {
    try {
      const data = await surveyConfigService.getQuestionsByCategory(categoryId);
      setQuestions(data);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const handleEditCategory = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ title: category.title, description: category.description });
    } else {
      setEditingCategory(null);
      setCategoryForm({ title: "", description: "" });
    }
    setEditCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await surveyConfigService.updateCategory(editingCategory.id, categoryForm);
      } else {
        await surveyConfigService.createCategory({
          ...categoryForm,
          position: categories.length + 1
        });
      }
      await loadData();
      setEditCategoryDialog(false);
      setCategoryForm({ title: "", description: "" });
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error al guardar la categoría");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Eliminar esta categoría y todas sus preguntas?")) return;
    try {
      await surveyConfigService.deleteCategory(categoryId);
      await loadData();
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error al eliminar la categoría");
    }
  };

  // Question management functions
  const handleEditQuestion = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      const opts = question.options ? 
        (typeof question.options === "string" ? JSON.parse(question.options) : question.options) 
        : [""];
      setQuestionForm({ 
        text: question.text, 
        type: question.type as "likert" | "yesno" | "open",
        options: Array.isArray(opts) ? opts : [""]
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({ text: "", type: "likert", options: [""] });
    }
    setEditQuestionDialog(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedCategory) return;
    try {
      const questionData = {
        text: questionForm.text,
        type: questionForm.type,
        options: questionForm.type === "likert" ? questionForm.options.filter(o => o.trim()) : undefined,
        category_id: selectedCategory.id,
        position: editingQuestion ? editingQuestion.position : questions.length + 1
      };

      if (editingQuestion) {
        await surveyConfigService.updateQuestion(editingQuestion.id, questionData);
      } else {
        await surveyConfigService.createQuestion(questionData);
      }
      
      await loadQuestions(selectedCategory.id);
      setEditQuestionDialog(false);
      setQuestionForm({ text: "", type: "likert", options: [""] });
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Error al guardar la pregunta");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      await surveyConfigService.deleteQuestion(questionId);
      if (selectedCategory) {
        await loadQuestions(selectedCategory.id);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error al eliminar la pregunta");
    }
  };

  const addOption = () => {
    setQuestionForm(prev => ({ ...prev, options: [...prev.options, ""] }));
  };

  const updateOption = (index: number, value: string) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const toggleSelectAll = () => {
    if (selectedSurveys.length === filteredSurveys.length) {
      setSelectedSurveys([]);
    } else {
      setSelectedSurveys(filteredSurveys.map(s => s.id));
    }
  };

  const toggleSelectSurvey = (surveyId: string) => {
    setSelectedSurveys(prev => 
      prev.includes(surveyId) 
        ? prev.filter(id => id !== surveyId)
        : [...prev, surveyId]
    );
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
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg shadow-sm p-2">
                <Image 
                  src="/b11.jpg?v=1"
                  alt="B11 Logo"
                  width={120}
                  height={48}
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Gestión de encuestas UNICCO</p>
              </div>
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

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-lg">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="surveys" className="gap-2">
                <Users className="w-4 h-4" />
                Encuestas
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Estadísticas
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings className="w-4 h-4" />
                Gestión de Encuesta
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
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
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

                  {selectedSurveys.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteMultiple}
                      className="gap-2 mb-4"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Seleccionadas ({selectedSurveys.length})
                    </Button>
                  )}

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">
                            <Checkbox
                              checked={selectedSurveys.length === filteredSurveys.length && filteredSurveys.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Email</th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Nombre</th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Fecha Inicio</th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Fecha Completado</th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Estado</th>
                          <th className="p-3 text-left text-sm font-semibold text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSurveys.map((survey) => (
                          <tr key={survey.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <Checkbox
                                checked={selectedSurveys.includes(survey.id)}
                                onCheckedChange={() => toggleSelectSurvey(survey.id)}
                              />
                            </td>
                            <td className="p-3 text-sm">{survey.email}</td>
                            <td className="p-3 text-sm font-medium">{survey.name}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {new Date(survey.created_at).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {survey.completed_at 
                                ? new Date(survey.completed_at).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                            <td className="p-3">
                              {survey.completed_at ? (
                                <Badge variant="default" className="bg-accent text-accent-foreground gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completada
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="w-3 h-3" />
                                  Incompleta
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/survey/${survey.unique_link_token}`)}
                                  className="gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Ver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteSingle(survey.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Eliminar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {categoryStats.map((stat, index) => (
                  <Card key={stat.id} className="overflow-hidden border-2 hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary border border-border">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{stat.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{stat.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Total Respuestas</p>
                          <p className="text-2xl font-bold">{stat.validResponses}</p>
                        </div>
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Tasa de Completitud</p>
                          <p className="text-2xl font-bold text-primary">{stat.completionRate}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-foreground">Respuestas Válidas</span>
                            <span className="font-bold">{stat.validResponses}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${stat.totalResponses ? (stat.validResponses / stat.totalResponses) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-muted-foreground">"No es mi rol"</span>
                            <span className="font-medium text-muted-foreground">{stat.notMyRoleResponses}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-muted-foreground/40 h-full rounded-full" 
                              style={{ width: `${stat.totalResponses ? (stat.notMyRoleResponses / stat.totalResponses) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Respuesta Más Común
                        </p>
                        <p className="text-sm font-medium bg-primary/5 text-primary-foreground text-primary p-3 rounded-lg border border-primary/10">
                          "{stat.mostCommonAnswer}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Survey Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Categories Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Categorías</CardTitle>
                      <CardDescription>Gestiona las categorías de la encuesta</CardDescription>
                    </div>
                    <Button onClick={() => handleEditCategory()} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nueva
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            selectedCategory?.id === category.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                          onClick={() => {
                            setSelectedCategory(category);
                            loadQuestions(category.id);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <Badge variant="secondary" className="text-xs">
                                  {category.title}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {category.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(category);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Questions Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Preguntas</CardTitle>
                      <CardDescription>
                        {selectedCategory ? `Preguntas de: ${selectedCategory.title}` : "Selecciona una categoría"}
                      </CardDescription>
                    </div>
                    {selectedCategory && (
                      <Button onClick={() => handleEditQuestion()} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedCategory ? (
                      <div className="space-y-2">
                        {questions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No hay preguntas. Agrega una nueva pregunta.
                          </p>
                        ) : (
                          questions.map((question) => (
                            <div
                              key={question.id}
                              className="p-4 rounded-lg border-2 border-border hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <Badge variant="secondary" className="text-xs">
                                      {question.type === "likert" ? "Escala" : question.type === "yesno" ? "Sí/No" : "Abierta"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm">{question.text}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Selecciona una categoría para ver sus preguntas
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {surveyToDelete ? (
                "Esta acción eliminará permanentemente esta encuesta y todas sus respuestas. Esta acción no se puede deshacer."
              ) : (
                `Esta acción eliminará permanentemente ${selectedSurveys.length} encuesta(s) y todas sus respuestas. Esta acción no se puede deshacer.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Edit Dialog */}
      <Dialog open={editCategoryDialog} onOpenChange={setEditCategoryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Modifica los datos de la categoría" : "Crea una nueva categoría para la encuesta"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-title">Título</Label>
              <Input
                id="cat-title"
                value={categoryForm.title}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Gestión de Ingresos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Descripción</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción breve de la categoría"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.title.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Edit Dialog */}
      <Dialog open={editQuestionDialog} onOpenChange={setEditQuestionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Modifica los datos de la pregunta" : "Crea una nueva pregunta para esta categoría"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="q-type">Tipo de Pregunta</Label>
              <Select
                value={questionForm.type}
                onValueChange={(value: "likert" | "yesno" | "open") => 
                  setQuestionForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger id="q-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likert">Escala Likert</SelectItem>
                  <SelectItem value="yesno">Sí/No</SelectItem>
                  <SelectItem value="open">Abierta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="q-text">Texto de la Pregunta</Label>
              <Textarea
                id="q-text"
                value={questionForm.text}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Escribe la pregunta..."
                rows={3}
              />
            </div>

            {questionForm.type === "likert" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opciones de Respuesta</Label>
                  <Button variant="outline" size="sm" onClick={addOption} className="gap-2">
                    <Plus className="w-3 h-3" />
                    Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      {questionForm.options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQuestionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion} disabled={!questionForm.text.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}