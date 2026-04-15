import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FileText, Mail, Calendar, CheckCircle2, AlertCircle, Loader2, BarChart3, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { surveyService } from "@/services/surveyService";
import { categories, questions } from "@/lib/surveyData";
import type { Answer } from "@/types/survey";

interface SurveyData {
  id: string;
  email: string;
  created_at: string;
  completed_at: string | null;
  survey_responses: Array<{
    question_id: string;
    answer_value: string | null;
    is_not_my_role: boolean;
  }>;
}

export default function SurveyResults() {
  const router = useRouter();
  const { token } = router.query;
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && typeof token === "string") {
      loadSurveyData(token);
    }
  }, [token]);

  const loadSurveyData = async (surveyToken: string) => {
    try {
      setLoading(true);
      const data = await surveyService.getSurveyByToken(surveyToken);
      setSurveyData(data);
    } catch (err) {
      console.error("Error loading survey:", err);
      setError("No se pudo cargar la encuesta. Verifique que la liga sea correcta.");
    } finally {
      setLoading(false);
    }
  };

  const getAnswersByCategory = () => {
    if (!surveyData) return {};

    const answerMap: Record<string, Record<string, Answer>> = {};
    
    surveyData.survey_responses.forEach(response => {
      const question = questions.find(q => q.id === response.question_id);
      if (question) {
        if (!answerMap[question.category]) {
          answerMap[question.category] = {};
        }
        answerMap[question.category][response.question_id] = {
          value: response.answer_value,
          isNotMyRole: response.is_not_my_role
        };
      }
    });

    return answerMap;
  };

  const getCategoryStats = () => {
    const answersByCategory = getAnswersByCategory();
    
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category.id);
      const categoryAnswers = answersByCategory[category.id] || {};
      
      const answered = Object.keys(categoryAnswers).length;
      const total = categoryQuestions.length;
      const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
      
      return {
        category,
        answered,
        total,
        percentage
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-heading font-semibold mb-2">Error al cargar</h2>
              <p className="text-muted-foreground">{error || "Encuesta no encontrada"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answersByCategory = getAnswersByCategory();
  const categoryStats = getCategoryStats();
  const totalAnswered = surveyData.survey_responses.length;
  const totalQuestions = questions.length;
  const completionPercentage = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <>
      <SEO
        title={`Resultados de Encuesta - ${surveyData.email}`}
        description="Resultados del diagnóstico de madurez ERP para UNICCO"
      />
      
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  Resultados de Diagnóstico ERP
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{surveyData.email}</span>
                  </div>
                  {surveyData.completed_at && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(surveyData.completed_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Completitud
                </div>
                <div className="text-3xl font-heading font-bold text-primary">
                  {completionPercentage}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalAnswered} / {totalQuestions} respuestas
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-8">
          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Resumen por Categoría
                </CardTitle>
                <CardDescription>
                  Progreso de completitud en cada área evaluada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryStats.map(({ category, answered, total, percentage }) => (
                    <div key={category.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2">
                          {category.title}
                        </h3>
                        <Badge variant={percentage === 100 ? "default" : "secondary"}>
                          {percentage}%
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {answered} de {total} preguntas
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {categories.map(category => {
              const categoryQuestions = questions.filter(q => q.category === category.id);
              const categoryAnswers = answersByCategory[category.id] || {};
              
              if (Object.keys(categoryAnswers).length === 0) return null;

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categoryQuestions.map((question, idx) => {
                        const answer = categoryAnswers[question.id];
                        if (!answer) return null;

                        return (
                          <div key={question.id} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-muted-foreground shrink-0 mt-0.5">
                                {idx + 1}.
                              </span>
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                  {question.text}
                                </p>
                                
                                {answer.isNotMyRole ? (
                                  <Badge variant="outline" className="text-xs">
                                    No es mi rol
                                  </Badge>
                                ) : question.type === "choice" && answer.value ? (
                                  <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                                    <p className="text-sm text-foreground font-medium">
                                      {answer.value}
                                    </p>
                                  </div>
                                ) : question.type === "open" && answer.value ? (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                      {answer.value}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            {idx < categoryQuestions.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {surveyData.completed_at && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      Encuesta completada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Gracias por completar el diagnóstico de madurez ERP. Estos resultados ayudarán a construir una propuesta personalizada para UNICCO.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}