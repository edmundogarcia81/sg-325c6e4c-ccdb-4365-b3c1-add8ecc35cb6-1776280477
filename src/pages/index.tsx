import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SurveyProgress } from "@/components/SurveyProgress";
import { QuestionCard } from "@/components/QuestionCard";
import { useSurvey } from "@/contexts/SurveyContext";
import { categories, questions } from "@/lib/surveyData";
import type { CategoryId } from "@/types/survey";

export default function Home() {
  const { state, setAnswer, setCurrentCategory, markCategoryComplete, getProgress } = useSurvey();
  const [showValidation, setShowValidation] = useState(false);

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

  const handleNext = () => {
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

  const currentCategory = categories.find(c => c.id === state.currentCategory);
  const answeredCount = getCurrentCategoryAnswers();
  const totalCount = currentCategoryQuestions.length;
  const categoryProgress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <>
      <SEO
        title="Encuesta de Diagnóstico ERP - Unión de Crédito"
        description="Evalúe la madurez operativa y financiera de su institución en 7 áreas clave"
      />
      
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Diagnóstico de Madurez ERP
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Evaluación de control financiero para uniones de crédito
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
                onCategorySelect={handleCategorySelect}
              />
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

              {showValidation && !areRequiredQuestionsAnswered() && (
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
              )}

              <div className="space-y-4 mb-8">
                {currentCategoryQuestions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answer={state.answers[question.id]}
                    onAnswer={setAnswer}
                    questionNumber={index + 1}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentCategoryIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {isLastCategory ? (
                  <Button
                    onClick={handleNext}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Finalizar Encuesta
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
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