import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSurvey } from "@/contexts/SurveyContext";
import { QuestionCard } from "@/components/QuestionCard";
import { useRouter } from "next/router";
import Image from "next/image";
import { SurveyProgress } from "@/components/SurveyProgress";

export default function SurveyPage() {
  const router = useRouter();
  const { 
    surveyId, 
    uniqueToken, 
    categories, 
    responses, 
    loadingSurveyConfig,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    saveSurveyResponse,
    completeSurvey
  } = useSurvey();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate progress
  const getProgress = () => {
    if (!categories.length) return 0;
    
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  const progress = getProgress();

  useEffect(() => {
    if (!surveyId && !loadingSurveyConfig) {
      router.push('/start');
    }
  }, [surveyId, router, loadingSurveyConfig]);

  if (loadingSurveyConfig || !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const isFirstCategory = currentCategoryIndex === 0;
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  // Check if all questions in current category are answered
  const isCategoryComplete = currentCategory.questions.every(
    q => responses[q.id] && (responses[q.id].answer_value || responses[q.id].is_not_my_role)
  );

  const handleNext = () => {
    if (isCategoryComplete && !isLastCategory) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCategory) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await completeSurvey();
      router.push('/thank-you');
    } catch (err) {
      setError("Hubo un error al enviar la encuesta. Por favor, intenta de nuevo.");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!surveyId) return null;

  return (
    <>
      <SEO 
        title="Encuesta de Diagnóstico - UNICCO"
        description="Evaluación de madurez operativa y financiera"
      />
      <div className="min-h-screen bg-background">
        {/* Header with Logo */}
        <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg shadow-sm p-2">
                  <Image 
                    src="/b11.jpg"
                    alt="B11 Logo"
                    width={100}
                    height={38}
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-heading font-bold text-foreground">Encuesta de Diagnóstico</h1>
                  <p className="text-sm text-muted-foreground">UNICCO - Evaluación ERP</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium mb-1">Progreso General</div>
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="w-32 h-2" />
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Progress */}
          <aside className="lg:w-1/4 flex-shrink-0">
            <div className="sticky top-28">
              <SurveyProgress />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold mb-3 flex items-center gap-3 text-foreground">
                {currentCategory.title}
              </h2>
              <p className="text-muted-foreground text-lg">{currentCategory.description}</p>
            </div>

            <div className="space-y-6">
              {currentCategory.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  response={responses[question.id]}
                  onResponseChange={saveSurveyResponse}
                />
              ))}
            </div>

            {/* Navigation Navigation */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstCategory}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </Button>

              {!isCategoryComplete && (
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Por favor, responde todas las preguntas para continuar
                </p>
              )}

              {isLastCategory ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCategoryComplete || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? "Enviando..." : "Finalizar Encuesta"}
                  {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCategoryComplete}
                  className="gap-2"
                >
                  Siguiente <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}