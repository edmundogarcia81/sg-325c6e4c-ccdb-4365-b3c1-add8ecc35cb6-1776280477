import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurvey } from "@/contexts/SurveyContext";
import { QuestionCard } from "@/components/QuestionCard";
import { useRouter } from "next/router";
import { SurveyProgress } from "@/components/SurveyProgress";

export default function SurveyPage() {
  const router = useRouter();
  const { 
    email, 
    name, 
    categories, 
    responses, 
    currentCategoryIndex, 
    setCurrentCategoryIndex,
    saveSurveyResponse,
    completeSurvey,
    loadingSurveyConfig
  } = useSurvey();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!categories.length) return 0;
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  const progressPercentage = getProgressPercentage();

  // Calculate category-specific progress
  const calculateCategoryProgress = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;
    
    const categoryQuestions = category.questions;
    const answeredInCategory = categoryQuestions.filter(
      q => responses[q.id] && (responses[q.id].answer_value || responses[q.id].is_not_my_role)
    ).length;
    
    return categoryQuestions.length > 0 
      ? Math.round((answeredInCategory / categoryQuestions.length) * 100) 
      : 0;
  };

  useEffect(() => {
    console.log("🏠 SurveyPage mounted");
    console.log("📊 Survey context:", { 
      email, 
      name, 
      categoriesCount: categories.length, 
      loadingSurveyConfig 
    });
    
    // Redirect to start if no survey data
    if (!loadingSurveyConfig && !email) {
      console.log("⚠️ No survey data, redirecting to /start");
      router.push("/start");
    }
  }, [email, loadingSurveyConfig, router, name, categories.length]);

  if (loadingSurveyConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: No se pudieron cargar las categorías de la encuesta.</p>
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = currentCategory?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? responses[currentQuestion.id] : null;
  
  const isLastQuestionInCategory = currentQuestionIndex === currentQuestions.length - 1;
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isLastQuestion = isLastQuestionInCategory && isLastCategory;

  const handleAnswer = async (questionId: string, value: string, isNotMyRole: boolean) => {
    await saveSurveyResponse(questionId, value, isNotMyRole);
  };

  const handleNext = () => {
    if (isLastQuestionInCategory) {
      // Move to next category
      if (!isLastCategory) {
        setCurrentCategoryIndex(currentCategoryIndex + 1);
        setCurrentQuestionIndex(0);
        window.scrollTo(0, 0);
      }
    } else {
      // Move to next question in same category
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) {
      // Move to previous category
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1];
        setCurrentCategoryIndex(currentCategoryIndex - 1);
        setCurrentQuestionIndex(prevCategory.questions.length - 1);
        window.scrollTo(0, 0);
      }
    } else {
      // Move to previous question in same category
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeSurvey();
      router.push('/thank-you');
    } catch (err) {
      console.error("Error completing survey:", err);
      setIsCompleting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Encuesta de Diagnóstico - UNICCO"
        description="Evaluación de madurez operativa y financiera"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Encuesta de Diagnóstico</h1>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">UNICCO - Evaluación ERP</p>
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Progreso General</p>
                <p className="text-xl lg:text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <Card className="sticky top-32">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Secciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {categories.map((category, index) => {
                    const isActive = currentCategoryIndex === index;
                    const Icon = isActive ? CheckCircle2 : Circle;
                    const categoryProgress = calculateCategoryProgress(category.id);
                    const isCompleted = categoryProgress === 100;

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setCurrentCategoryIndex(index);
                          setCurrentQuestionIndex(0);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : isCompleted
                            ? "bg-green-50 text-green-900 hover:bg-green-100"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              isCompleted ? "text-green-600" : ""
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${isActive ? "" : "text-foreground"}`}>
                              {category.title}
                            </p>
                            {!isActive && categoryProgress > 0 && (
                              <p className="text-xs mt-1 opacity-75">
                                {categoryProgress}% completado
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Questions Section */}
            <div className="flex-1 min-w-0">
              {/* Mobile Category Header - Only visible on mobile */}
              <div className="lg:hidden mb-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">
                          Sección {currentCategoryIndex + 1} de {categories.length}
                        </p>
                        <h2 className="text-base font-bold text-foreground mt-0.5">
                          {currentCategory?.title}
                        </h2>
                      </div>
                    </div>
                    {currentCategory?.description && (
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        {currentCategory.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Desktop Category Header - Only visible on desktop */}
              <div className="hidden lg:block mb-6">
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Sección {currentCategoryIndex + 1} de {categories.length}
                        </p>
                        <CardTitle className="text-xl mt-1">{currentCategory?.title}</CardTitle>
                      </div>
                    </div>
                    {currentCategory?.description && (
                      <CardDescription className="mt-3 text-sm leading-relaxed">
                        {currentCategory.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </div>

              <SurveyProgress
                current={currentQuestionIndex + 1}
                total={currentQuestions.length}
                categoryTitle={currentCategory?.title || ""}
              />

              <div className="mt-6">
                <QuestionCard
                  question={currentQuestion}
                  answer={responses[currentQuestion.id]}
                  onAnswer={handleAnswer}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
                  className="flex-1 sm:flex-initial h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Atrás</span>
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!currentAnswer || isCompleting}
                    className="flex-1 h-11 bg-green-600 hover:bg-green-700"
                  >
                    {isCompleting ? (
                      <>Finalizando...</>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Finalizar Encuesta</span>
                        <span className="sm:hidden">Finalizar</span>
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="flex-1 sm:flex-initial h-11"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">Siguiente</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Mobile category navigation dots - Only visible on mobile */}
              <div className="lg:hidden mt-6 flex justify-center gap-1.5">
                {categories.map((_, index) => {
                  const categoryProgress = calculateCategoryProgress(categories[index].id);
                  const isCompleted = categoryProgress === 100;
                  const isActive = currentCategoryIndex === index;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentCategoryIndex(index);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? "w-8 bg-primary"
                          : isCompleted
                          ? "w-2 bg-green-500"
                          : "w-2 bg-muted"
                      }`}
                      aria-label={`Ir a sección ${index + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}