import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SurveyProgress } from "@/components/SurveyProgress";
import { QuestionCard } from "@/components/QuestionCard";
import { useSurvey } from "@/contexts/SurveyContext";
import { useToast } from "@/hooks/use-toast";
import { categories, questions } from "@/lib/surveyData";
import type { CategoryId } from "@/types/survey";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { state, setAnswer, setCurrentCategory, markCategoryComplete, getProgress, saveToDatabaseAndSendEmail } = useSurvey();
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Verificar que tengamos email y surveyId
    const surveyId = localStorage.getItem("currentSurveyId");
    const email = localStorage.getItem("surveyEmail");
    
    if (!surveyId || !email) {
      router.push("/start");
    }
  }, [router]);

  const currentCategoryQuestions = questions.filter(
    q => q.category === state.currentCategory
  );

  const currentCategoryIndex = categories.findIndex(c => c.id === state.currentCategory);
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  const getCurrentCategoryAnswers = () => {
    return currentCategoryQuestions.filter(q => {
      const answer = state.answers[q.id];
      return answer && (answer.value !== null || answer.isNotMyRole);
    }).length;
  };

  const areRequiredQuestionsAnswered = () => {
    return currentCategoryQuestions
      .filter(q => q.required)
      .every(q => {
        const answer = state.answers[q.id];
        return answer && (answer.value !== null || answer.isNotMyRole);
      });
  };

  const handleNext = async () => {
    if (!areRequiredQuestionsAnswered()) {
      setShowValidation(true);
      return;
    }

    markCategoryComplete(state.currentCategory);

    if (!isLastCategory) {
      const nextCategory = categories[currentCategoryIndex + 1];
      setCurrentCategory(nextCategory.id);
      setShowValidation(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Última categoría - enviar email y mostrar confirmación
      setIsSubmitting(true);
      try {
        await saveToDatabaseAndSendEmail();
        
        toast({
          title: "¡Encuesta completada!",
          description: "Hemos enviado un resumen a su correo electrónico con una liga para ver las estadísticas."
        });

        // Redirigir a página de confirmación después de 2 segundos
        setTimeout(() => {
          router.push("/thank-you");
        }, 2000);
      } catch (error) {
        console.error("Error submitting survey:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Hubo un problema al enviar la encuesta. Por favor intente nuevamente."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      const prevCategory = categories[currentCategoryIndex - 1];
      setCurrentCategory(prevCategory.id);
      setShowValidation(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setCurrentCategory(categoryId);
    setShowValidation(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentCategory = categories.find((c) => c.id === state.currentCategory);
  const answeredCount = getCurrentCategoryAnswers();
  const totalCount = currentCategoryQuestions.length;
  const categoryProgress = totalCount > 0 ? answeredCount / totalCount * 100 : 0;

  return (
    <>
      <SEO
        title="Encuesta de Diagnóstico ERP - Unión de Crédito"
        description="Evalúe la madurez operativa y financiera de su institución en 7 áreas clave" />
      
      
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Diagnóstico de Madurez ERP
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Evaluación de control financiero para UNICCO

                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">
                  Progreso global
                </div>
                <div className="text-2xl font-heading font-bold text-primary">
                  {getProgress()}%
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-8">
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 h-fit">
              <SurveyProgress
                currentCategory={state.currentCategory}
                completedCategories={state.completedCategories}
                onCategorySelect={handleCategorySelect} />
              
            </aside>

            <main>
              <div className="bg-card rounded-lg border border-border p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-heading font-semibold text-foreground mb-1">
                      {currentCategory?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentCategory?.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Preguntas respondidas: {answeredCount} / {totalCount}
                        </span>
                        <span className="font-medium text-foreground">
                          {Math.round(categoryProgress)}%
                        </span>
                      </div>
                      <Progress value={categoryProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {showValidation && !areRequiredQuestionsAnswered() &&
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive mb-1">
                        Preguntas requeridas sin responder
                      </h3>
                      <p className="text-sm text-destructive/80">
                        Por favor responda todas las preguntas marcadas con (*) o seleccione "No es mi rol" si no aplica.
                      </p>
                    </div>
                  </div>
                </div>
              }

              <div className="space-y-4 mb-8">
                {currentCategoryQuestions.map((question, index) =>
                <QuestionCard
                  key={question.id}
                  question={question}
                  answer={state.answers[question.id]}
                  onAnswer={(answer) => setAnswer(question.id, answer)}
                  questionNumber={index + 1} />

                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentCategoryIndex === 0 || isSubmitting}>
                  
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {isLastCategory ? (
                  <Button
                    onClick={handleNext}
                    className="bg-accent hover:bg-accent/90"
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Finalizar Encuesta
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={isSubmitting}>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}