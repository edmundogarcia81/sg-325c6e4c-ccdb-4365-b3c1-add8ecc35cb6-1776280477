import { useSurvey } from "@/contexts/SurveyContext";
import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SurveyProgress() {
  const { categories, currentCategoryIndex, responses, setCurrentCategoryIndex } = useSurvey();

  if (!categories || categories.length === 0) return null;

  return (
    <Card className="p-4 border-2 sticky top-24">
      <h3 className="font-heading font-semibold mb-4 text-foreground">Secciones</h3>
      <div className="space-y-1">
        {categories.map((category, index) => {
          const isActive = index === currentCategoryIndex;
          const questions = category.questions || [];
          
          // Determine if category is completed based on answered questions vs total
          const isCompleted = questions.length > 0 && questions.every(
            q => responses[q.id] && (responses[q.id].answer_value || responses[q.id].is_not_my_role)
          );

          return (
            <button
              key={category.id}
              onClick={() => setCurrentCategoryIndex(index)}
              disabled={!isCompleted && index > currentCategoryIndex && index !== currentCategoryIndex + 1}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                ${isActive ? 'bg-primary text-primary-foreground font-medium shadow-md' : 'hover:bg-muted text-muted-foreground'}
                ${!isCompleted && index > currentCategoryIndex + 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isCompleted ? (
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
              ) : isActive ? (
                <Circle className="w-5 h-5 flex-shrink-0 fill-current opacity-20" />
              ) : (
                <Circle className="w-5 h-5 flex-shrink-0" />
              )}
              
              <span className="text-sm line-clamp-1 flex-1">
                {category.title}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}